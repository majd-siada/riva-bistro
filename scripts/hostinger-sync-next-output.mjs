/**
 * Hostinger monorepo fix: when the app root is the repository root, `next build`
 * runs in frontend/ and writes to frontend/.next. Hostinger expects .next at the
 * app root — copy the build output up after a successful frontend build.
 */
import { access, cp, constants } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendOutput = path.join(repoRoot, "frontend", ".next");
const rootOutput = path.join(repoRoot, ".next");

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(frontendOutput))) {
    if (await exists(rootOutput)) {
      console.log("hostinger-sync: .next already at repository root.");
      return;
    }

    console.error(
      `hostinger-sync: no Next.js output at ${frontendOutput} or ${rootOutput}`,
    );
    process.exit(1);
  }

  await cp(frontendOutput, rootOutput, { recursive: true, force: true });
  console.log(`hostinger-sync: copied ${frontendOutput} -> ${rootOutput}`);

  const standaloneCandidates = [
    path.join(rootOutput, "standalone", "server.js"),
    path.join(rootOutput, "standalone", "frontend", "server.js"),
  ];

  const found = standaloneCandidates.find((candidate) => exists(candidate));
  if (found) {
    console.log(`hostinger-sync: verified standalone server at ${found}`);
    return;
  }

  console.warn(
    "hostinger-sync: standalone/server.js not found; runtime start may still fail.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
