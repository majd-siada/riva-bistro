/**
 * Hostinger Next.js deploy finalize for monorepo layout.
 *
 * 1. Copies .next/static and public/ into the standalone bundle (required by Next.js).
 * 2. When the app builds in frontend/, mirrors frontend/.next to the repository root
 *    so Hostinger can find .next/standalone when the deploy root is the repo.
 */
import { access, cp, constants } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendDir = path.join(repoRoot, "frontend");
const frontendOutput = path.join(frontendDir, ".next");
const rootOutput = path.join(repoRoot, ".next");

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function finalizeStandalone(appDir, outputDir) {
  const standaloneDir = path.join(outputDir, "standalone");
  const serverPath = path.join(standaloneDir, "server.js");
  const staticSrc = path.join(outputDir, "static");
  const staticDst = path.join(standaloneDir, ".next", "static");
  const publicSrc = path.join(appDir, "public");
  const publicDst = path.join(standaloneDir, "public");

  if (!(await exists(serverPath))) {
    const nestedServer = path.join(standaloneDir, "frontend", "server.js");
    if (await exists(nestedServer)) {
      console.error(
        `hostinger-sync: nested standalone at ${nestedServer}. Set Hostinger root directory to frontend/.`,
      );
    }
    throw new Error(`Standalone server missing at ${serverPath}`);
  }

  if (await exists(staticSrc)) {
    await cp(staticSrc, staticDst, { recursive: true, force: true });
    console.log(`hostinger-sync: copied static -> ${staticDst}`);
  } else {
    throw new Error(`Next.js static output missing at ${staticSrc}`);
  }

  if (await exists(publicSrc)) {
    await cp(publicSrc, publicDst, { recursive: true, force: true });
    console.log(`hostinger-sync: copied public -> ${publicDst}`);
  } else {
    console.warn(`hostinger-sync: no public/ directory at ${publicSrc}`);
  }

  if (!(await exists(path.join(standaloneDir, ".next", "static")))) {
    throw new Error("Standalone bundle is missing .next/static after sync");
  }

  console.log(`hostinger-sync: verified standalone server at ${serverPath}`);
}

async function main() {
  if (!(await exists(frontendOutput))) {
    if (await exists(rootOutput)) {
      console.log("hostinger-sync: finalizing standalone at repository root .next");
      await finalizeStandalone(frontendDir, rootOutput);
      return;
    }

    console.error(
      `hostinger-sync: no Next.js output at ${frontendOutput} or ${rootOutput}`,
    );
    process.exit(1);
  }

  await finalizeStandalone(frontendDir, frontendOutput);

  await cp(frontendOutput, rootOutput, { recursive: true, force: true });
  console.log(`hostinger-sync: copied ${frontendOutput} -> ${rootOutput}`);

  await finalizeStandalone(frontendDir, rootOutput);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
