import { NextRequest, NextResponse } from "next/server";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import { SUPPORTED_CHAINS } from "@/lib/contractConfig";

export const dynamic = "force-dynamic";

// The route signs with a server key and controls a local process, so it only
// runs under `next dev` with an explicit opt-in. Production servers return 404.
function isKeeperApiEnabled() {
  return (
    process.env.ENABLE_KEEPER_API === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

function notFound() {
  return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

// ── In-memory keeper process state ──────────────────────────────────────
// Persists across requests for the lifetime of the Next.js dev server.
interface KeeperState {
  process: ChildProcess | null;
  pid: number | null;
  running: boolean;
  startedAt: string | null;
  logs: string[];
}

const MAX_LOG_LINES = 200;

const keeper: KeeperState = {
  process: null,
  pid: null,
  running: false,
  startedAt: null,
  logs: [],
};

function pushLog(line: string) {
  keeper.logs.push(line);
  if (keeper.logs.length > MAX_LOG_LINES) {
    keeper.logs.splice(0, keeper.logs.length - MAX_LOG_LINES);
  }
}

// ── POST /api/keeper  →  start or stop keeper, or execute match ─────────
export async function POST(request: NextRequest) {
  if (!isKeeperApiEnabled()) return notFound();

  // A JSON content type forces a CORS preflight, so other sites cannot post here.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(
      { ok: false, error: "Content-Type must be application/json." },
      { status: 415 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const action: unknown = body.action;

  // ── MATCH ORDERS ON-CHAIN ─────────────────────────────────────────────
  if (action === "match") {
    const { buyOrderId, sellOrderId, chainId } = body;
    if (!isPositiveInteger(buyOrderId) || !isPositiveInteger(sellOrderId)) {
      return NextResponse.json(
        { ok: false, error: "buyOrderId and sellOrderId must be positive integers." },
        { status: 400 }
      );
    }

    // RPC and contract come from the app's chain config, never from the request.
    const chain = isPositiveInteger(chainId) ? SUPPORTED_CHAINS[chainId] : undefined;
    if (!chain || !chain.contractAddress) {
      return NextResponse.json(
        { ok: false, error: "Unsupported chainId." },
        { status: 400 }
      );
    }

    const privateKey = process.env.KEEPER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { ok: false, error: "Keeper key is not configured." },
        { status: 503 }
      );
    }

    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl, chain.chainId, {
        staticNetwork: true,
      });
      const signer = new ethers.Wallet(privateKey, provider);
      const abi = [
        "function matchOrders(uint256 buyOrderId, uint256 sellOrderId, uint256 deadline) external",
      ];
      const contract = new ethers.Contract(chain.contractAddress, abi, signer);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      pushLog(`[api] Autonomous match requested: Buy #${buyOrderId} ↔ Sell #${sellOrderId} on ${chain.shortName}`);

      // Simulate first so a match that would revert is never sent.
      await contract.matchOrders.staticCall(buyOrderId, sellOrderId, deadline);
      const tx = await contract.matchOrders(buyOrderId, sellOrderId, deadline);
      const receipt = await tx.wait();
      const txHash = receipt?.hash || tx.hash;

      pushLog(`[api] Autonomous match successful: Buy #${buyOrderId} ↔ Sell #${sellOrderId} (tx: ${txHash})`);

      return NextResponse.json({
        ok: true,
        txHash,
        buyOrderId,
        sellOrderId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      pushLog(`[api] Autonomous match error for Buy #${buyOrderId} ↔ Sell #${sellOrderId}: ${msg}`);
      return NextResponse.json(
        { ok: false, error: "Match failed." },
        { status: 500 }
      );
    }
  }

  if (action !== "start" && action !== "stop") {
    return NextResponse.json(
      { ok: false, error: "Unknown action." },
      { status: 400 }
    );
  }

  // ── STOP ──────────────────────────────────────────────────────────────
  if (action === "stop") {
    if (!keeper.running || !keeper.process) {
      return NextResponse.json(
        { ok: false, error: "Keeper is not running." },
        { status: 400 }
      );
    }

    try {
      keeper.process.kill("SIGTERM");
    } catch {
      // Process may already be dead — that's fine.
    }

    keeper.running = false;
    keeper.process = null;
    keeper.pid = null;
    pushLog(`[api] Keeper stopped by user at ${new Date().toISOString()}`);

    return NextResponse.json({ ok: true, status: "stopped" });
  }

  // ── START ─────────────────────────────────────────────────────────────
  if (keeper.running && keeper.process) {
    return NextResponse.json(
      { ok: false, error: "Keeper is already running.", pid: keeper.pid },
      { status: 409 }
    );
  }

  // Resolve the path to the Keeper2 project relative to the WebUI project.
  // WebUI lives at  …/Windmill-EVM-Contracts/Windmill-EVM-WebUI
  // Keeper2 lives at …/Windmill-EVM-Contracts/Windmill-EVM-Keeper2
  const keeperDir = path.resolve(process.cwd(), "..", "Windmill-EVM-Keeper2");
  const fileName = ["src", "index.js"].join("/");
  const entryPoint = String(path.resolve(keeperDir, fileName));

  pushLog("[api] Spawning keeper");

  try {
    const child = spawn("node", [entryPoint], {
      cwd: keeperDir,
      env: { ...process.env },          // inherits Keeper2/.env via dotenv inside the keeper
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,                    // keep it tied to this server so we can manage it
      windowsHide: true,
    });

    keeper.process = child;
    keeper.pid = child.pid ?? null;
    keeper.running = true;
    keeper.startedAt = new Date().toISOString();
    keeper.logs = [];
    pushLog(`[api] Keeper started  pid=${keeper.pid}  at ${keeper.startedAt}`);

    // Stream stdout / stderr into the in-memory log buffer
    child.stdout?.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) pushLog(`[stdout] ${line}`);
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) pushLog(`[stderr] ${line}`);
    });

    child.on("exit", (code, signal) => {
      pushLog(
        `[api] Keeper exited  code=${code}  signal=${signal}  at ${new Date().toISOString()}`
      );
      keeper.running = false;
      keeper.process = null;
      keeper.pid = null;
    });

    child.on("error", (err) => {
      pushLog(`[api] Keeper error: ${err.message}`);
      keeper.running = false;
      keeper.process = null;
      keeper.pid = null;
    });

    return NextResponse.json({
      ok: true,
      status: "started",
      pid: keeper.pid,
      startedAt: keeper.startedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    pushLog(`[api] Failed to spawn keeper: ${message}`);
    return NextResponse.json(
      { ok: false, error: "Failed to spawn keeper." },
      { status: 500 }
    );
  }
}

// ── GET /api/keeper  →  return current status + recent logs ─────────────
export async function GET() {
  if (!isKeeperApiEnabled()) return notFound();

  return NextResponse.json({
    running: keeper.running,
    pid: keeper.pid,
    startedAt: keeper.startedAt,
    logs: keeper.logs,
  });
}
