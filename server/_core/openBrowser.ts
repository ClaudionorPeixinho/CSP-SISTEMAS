// Opens the site in the user's default browser when `pnpm dev` starts, so
// running the command is enough — no need to open a browser manually.
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// `tsx watch` fully restarts the server process on every server-file save
// (it's a backend, so no in-process HMR is possible). Re-opening a browser
// tab on every save would be very annoying, so we debounce: only open once
// per COOLDOWN_MS, tracked via the mtime of a lock file. A genuine fresh
// `pnpm dev` start (after the previous one had time to go quiet) still opens.
//
// Path note: in dev this file runs from its real location (server/_core/,
// two levels below the project root). In production it's esbuild-bundled
// into a single dist/index.js (one level below the root), which collapses
// `import.meta.dirname` to `dist/` for every module — so the same ".." count
// can't be correct in both cases and we have to branch on NODE_ENV, same as
// server/_core/vite.ts does for its own dist path.
const LOCK_FILE =
  process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "..", "..", "data", ".browser-open-lock")
    : path.resolve(import.meta.dirname, "..", "data", ".browser-open-lock");
const COOLDOWN_MS = 30_000;

function withinCooldown(): boolean {
  try {
    const { mtimeMs } = fs.statSync(LOCK_FILE);
    return Date.now() - mtimeMs < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function touchLock() {
  fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true });
  fs.writeFileSync(LOCK_FILE, String(Date.now()), "utf-8");
}

export function openBrowser(url: string) {
  if (withinCooldown()) return;
  touchLock();

  const platform = process.platform;
  const command =
    platform === "win32"
      ? `start "" "${url}"`
      : platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) console.warn(`[Browser] Não foi possível abrir automaticamente. Acesse ${url} manualmente.`);
  });
}
