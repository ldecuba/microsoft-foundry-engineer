import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { platform } from "node:os";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
async function runCommand(executable, args, timeoutMs) {
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
export async function runAzJson(args, timeoutMs = 30000) {
    const command = `az ${args.join(" ")}`;
    const azExecutable = process.env.AZURE_CLI_PATH ??
        (platform() === "win32" ? "C:\\Program Files\\Microsoft SDKs\\Azure\\CLI2\\python.exe" : "az");
    try {
        const { stdout, stderr } = await runCommand(azExecutable, [...args, "-o", "json"], timeoutMs);
        const trimmed = stdout.trim();
        return {
            ok: true,
            command,
            data: trimmed ? JSON.parse(trimmed) : undefined,
            stdout: trimmed,
            stderr: stderr.trim()
        };
    }
    catch (error) {
        const err = error;
        return {
            ok: false,
            command,
            stdout: err.stdout?.trim(),
            stderr: err.stderr?.trim(),
            error: err.message
        };
    }
}
