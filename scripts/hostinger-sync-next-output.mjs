/**
 * Hostinger Next.js deploy finalize for monorepo layout.
 *
 * 1. Copies .next/static and public/ into the standalone bundle (required by Next.js).
 * 2. Ensures a server.js entry at .next/standalone/ for Hostinger's standalone runner.
 * 3. When the app builds in frontend/, mirrors frontend/.next to the repository root
 *    so Hostinger can find .next/standalone when the deploy root is the repo.
 */
import { access, cp, constants, writeFile } from "node:fs/promises";
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

async function resolveStandaloneLayout(standaloneDir) {
  const flatServer = path.join(standaloneDir, "server.js");
  const nestedServer = path.join(standaloneDir, "frontend", "server.js");

  if (await exists(nestedServer)) {
    return {
      layout: "nested",
      serverPath: nestedServer,
      staticDst: path.join(standaloneDir, "frontend", ".next", "static"),
      publicDst: path.join(standaloneDir, "frontend", "public"),
      nodeModulesDir: path.join(standaloneDir, "node_modules"),
      entryShim: flatServer,
    };
  }

  if (await exists(flatServer)) {
    return {
      layout: "flat",
      serverPath: flatServer,
      staticDst: path.join(standaloneDir, ".next", "static"),
      publicDst: path.join(standaloneDir, "public"),
      nodeModulesDir: path.join(standaloneDir, "node_modules"),
      entryShim: null,
    };
  }

  throw new Error(`Standalone server missing in ${standaloneDir}`);
}

async function finalizeStandalone(appDir, outputDir) {
  const standaloneDir = path.join(outputDir, "standalone");
  const layout = await resolveStandaloneLayout(standaloneDir);
  const staticSrc = path.join(outputDir, "static");
  const publicSrc = path.join(appDir, "public");

  if (await exists(staticSrc)) {
    await cp(staticSrc, layout.staticDst, { recursive: true, force: true });
    console.log(`hostinger-sync: copied static -> ${layout.staticDst}`);
  } else {
    throw new Error(`Next.js static output missing at ${staticSrc}`);
  }

  if (await exists(publicSrc)) {
    await cp(publicSrc, layout.publicDst, { recursive: true, force: true });
    console.log(`hostinger-sync: copied public -> ${layout.publicDst}`);
  } else {
    console.warn(`hostinger-sync: no public/ directory at ${publicSrc}`);
  }

  if (!(await exists(layout.staticDst))) {
    throw new Error("Standalone bundle is missing .next/static after sync");
  }

  if (!(await exists(path.join(layout.nodeModulesDir, "next")))) {
    throw new Error(
      `Standalone bundle is missing next in ${layout.nodeModulesDir}. ` +
        "Check outputFileTracingRoot in frontend/next.config.ts.",
    );
  }

  if (layout.entryShim && layout.layout === "nested") {
    await writeFile(layout.entryShim, "require('./frontend/server.js');\n", "utf8");
    console.log(`hostinger-sync: wrote standalone entry shim -> ${layout.entryShim}`);
  }

  console.log(
    `hostinger-sync: verified ${layout.layout} standalone server at ${layout.serverPath}`,
  );
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
