import { NextRequest, NextResponse } from "next/server";
import { spawn, type ChildProcess } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

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
  const body = await request.json().catch(() => ({}));
  const action: string = body.action ?? "start";

  // ── MATCH ORDERS ON-CHAIN ─────────────────────────────────────────────
  if (action === "match") {
    const buyOrderId = body.buyOrderId;
    const sellOrderId = body.sellOrderId;
    if (!buyOrderId || !sellOrderId) {
      return NextResponse.json(
        { ok: false, error: "Missing buyOrderId or sellOrderId" },
        { status: 400 }
      );
    }

    try {
      const { ethers } = await import("ethers");
      const rpcUrl =
        body.rpcUrl ||
        process.env.NEXT_PUBLIC_RPC_URL ||
        process.env.RPC_URL ||
        "http://127.0.0.1:8545";
      const contractAddress =
        body.contractAddress ||
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCAL ||
        process.env.CONTRACT_ADDRESS ||
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
      const privateKey =
        process.env.KEEPER_PRIVATE_KEY ||
        process.env.PRIVATE_KEY ||
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = new ethers.Wallet(privateKey, provider);
      const abi = [
        "function matchOrders(uint256 buyOrderId, uint256 sellOrderId, uint256 deadline) external",
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      console.log('\n===============================================================');
      console.log('⚡ [AUTONOMOUS MATCH ENGINE] Crossing Order Pair Detected!');
      console.log(`🚀 STRICTLY AUTO-EXECUTING MATCH ON-CHAIN: Buy #${buyOrderId} ↔ Sell #${sellOrderId}`);
      console.log(`📍 Contract: ${contractAddress}`);
      console.log(`🌐 RPC URL:  ${rpcUrl}`);
      console.log('===============================================================');
      pushLog(`[api] Autonomous match requested: Buy #${buyOrderId} ↔ Sell #${sellOrderId}`);

      let tx;
      try {
        tx = await contract.matchOrders(buyOrderId, sellOrderId, deadline);
      } catch (estErr) {
        tx = await contract.matchOrders(buyOrderId, sellOrderId, deadline, { gasLimit: BigInt(800000) });
      }
      const receipt = await tx.wait();
      const txHash = receipt?.hash || tx.hash;

      console.log('\n🎉 [MATCH EXECUTED ON-CHAIN SUCCESSFULLY!]');
      console.log(`🔗 Transaction Hash: ${txHash}`);
      console.log(`✅ Settled: Buy #${buyOrderId} ↔ Sell #${sellOrderId}`);
      console.log('💰 0.1% Keeper Matching Fee Awarded!');
      console.log('===============================================================\n');
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
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
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

  pushLog(`[api] Spawning keeper from ${keeperDir}`);
  pushLog(`[api] Entry: ${entryPoint}`);

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
      { ok: false, error: `Failed to spawn keeper: ${message}` },
      { status: 500 }
    );
  }
}

// ── GET /api/keeper  →  return current status + recent logs ─────────────
export async function GET() {
  return NextResponse.json({
    running: keeper.running,
    pid: keeper.pid,
    startedAt: keeper.startedAt,
    logs: keeper.logs,
  });
}
