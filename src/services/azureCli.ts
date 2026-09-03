import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { platform } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runCommand(executable: string, args: string[], timeoutMs: number) {
  const resolvedExecutable = platform() === "win32" && executable.toLowerCase().endsWith("az.cmd")
    ? resolve(dirname(executable), "..", "python.exe")
    : executable;

  if (platform() === "win32") {
    return execFileAsync(resolvedExecutable, ["-IBm", "azure.cli", ...args], {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 8
    });
  }

  return execFileAsync(resolvedExecutable, args, {
    timeout: timeoutMs,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8
  });
}

export interface AzureCliResult<T = unknown> {
  ok: boolean;
  command: string;
  data?: T;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export async function runAzJson<T = unknown>(args: string[], timeoutMs = 30000): Promise<AzureCliResult<T>> {
  const command = `az ${args.join(" ")}`;
  const azExecutable =
    process.env.AZURE_CLI_PATH ??
    (platform() === "win32" ? "C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\python.exe" : "az");

  try {
    const { stdout, stderr } = await runCommand(azExecutable, [...args, "-o", "json"], timeoutMs);

    const trimmed = stdout.trim();
    return {
      ok: true,
      command,
      data: trimmed ? (JSON.parse(trimmed) as T) : undefined,
      stdout: trimmed,
      stderr: stderr.trim()
    };
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    return {
      ok: false,
      command,
      stdout: err.stdout?.trim(),
      stderr: err.stderr?.trim(),
      error: err.message
    };
  }
}
