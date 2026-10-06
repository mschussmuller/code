// One-off export of the legacy Vantage Property OS inventory (hardcoded TS data)
// into seed/inventory.json. Requires TypeScript 5's JS API:
//   TS_MODULE=/path/to/node_modules/typescript node scripts/export-legacy.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require(process.env.TS_MODULE || "typescript");
const legacyDir = resolve("legacy/vantage-property-os/app");

function load(path, cache = new Map()) {
  if (cache.has(path)) return cache.get(path);
  const exports = {};
  cache.set(path, exports);
  const js = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  runInNewContext(js, {
    exports,
    require: (name) => load(resolve(dirname(path), name + ".ts"), cache),
  });
  return exports;
}

const { projects, units } = load(resolve(legacyDir, "data.ts"));
const out = { exportedAt: new Date().toISOString(), projects, units };
writeFileSync("seed/inventory.json", JSON.stringify(out, null, 1) + "\n");
console.log(`Exported ${projects.length} projects, ${units.length} units`);
