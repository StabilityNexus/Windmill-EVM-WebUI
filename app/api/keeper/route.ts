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

// ── POST /api/keeper  →  start or stop the keeper process ───────────────
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action: string = body.action ?? "start";

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

  // Resolve the path to the Keeper project. Defaults to a sibling folder
  // (the convention used by the org's repos — e.g. …/GSSOC 2027/Windmill-EVM-WebUI
  // and …/GSSOC 2027/Windmill-EVM-Keeper) but is overridable via
  // KEEPER_REPO_PATH for contributors who clone it elsewhere.
  const keeperDir = process.env.KEEPER_REPO_PATH
    ? path.resolve(process.env.KEEPER_REPO_PATH)
    : path.resolve(process.cwd(), "..", "Windmill-EVM-Keeper");
  const fileName = ["src", "index.js"].join("/");
  const entryPoint = String(path.resolve(keeperDir, fileName));

  pushLog(`[api] Spawning keeper from ${keeperDir}`);
  pushLog(`[api] Entry: ${entryPoint}`);

  try {
    // Use the exact Node binary already running this server (process.execPath)
    // rather than the bare "node" command — spawning by name alone can fail
    // with ENOENT on Windows when the running Node install (e.g. via Volta)
    // isn't resolvable through the child process's inherited PATH.
    const child = spawn(process.execPath, [entryPoint], {
      cwd: keeperDir,
      env: { ...process.env },          // inherits the keeper's own .env via dotenv inside it
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

// ── Keeper telemetry (real health, not a guess) ──────────────────────────
// The keeper process itself exposes a read-only GET /health document (see
// Windmill-EVM-Keeper's src/telemetry-server.js) whenever TELEMETRY_PORT is
// set in its .env. Ask it directly instead of inferring health from stdout
// activity — it already tracks isHealthy, consecutiveFailures, lastError,
// and lastCycle internally.
const DEFAULT_TELEMETRY_PORT = 8081;
const TELEMETRY_FETCH_TIMEOUT_MS = 2000;

interface KeeperTelemetry {
  id?: string;
  address?: string | null;
  chainId?: number;
  startedAt?: string | null;
  stopped?: boolean;
  uptimeSeconds?: number;
  isHealthy?: boolean;
  consecutiveFailures?: number;
  lastError?: unknown;
  lastCycle?: unknown;
}

async function fetchKeeperTelemetry(): Promise<{ ok: boolean; data: KeeperTelemetry | null; error?: string }> {
  const port = Number(process.env.KEEPER_TELEMETRY_PORT || DEFAULT_TELEMETRY_PORT);
  const host = process.env.KEEPER_TELEMETRY_HOST || "127.0.0.1";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEMETRY_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`http://${host}:${port}/health`, { signal: controller.signal });
    const data = (await res.json()) as KeeperTelemetry;
    return { ok: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, data: null, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

// ── GET /api/keeper  →  return current status + recent logs ─────────────
export async function GET() {
  // Only worth asking for telemetry if we actually spawned a process —
  // avoids a pointless timeout wait on every poll while stopped.
  const telemetry = keeper.running ? await fetchKeeperTelemetry() : { ok: false, data: null };

  return NextResponse.json({
    running: keeper.running,
    pid: keeper.pid,
    startedAt: keeper.startedAt,
    logs: keeper.logs,
    telemetry,
  });
}
