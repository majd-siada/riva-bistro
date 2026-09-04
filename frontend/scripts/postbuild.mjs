/**
 * Resolve and run the monorepo Hostinger sync script after `next build`.
 * Hostinger / local monorepo: ../scripts/...
 * Docker Compose: mount repo scripts at /scripts
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(here, "../../scripts/hostinger-sync-next-output.mjs"),
  "/scripts/hostinger-sync-next-output.mjs",
];

const script = candidates.find((candidate) => existsSync(candidate));
if (!script) {
  console.error(
    "postbuild: hostinger-sync script not found. Expected ../scripts or /scripts mount.",
  );
  process.exit(1);
}

const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
process.exit(result.status ?? 1);
