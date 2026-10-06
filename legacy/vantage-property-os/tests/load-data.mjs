import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

export function loadData(file = 'app/data.ts', cache = new Map()) {
  const path = resolve(file);
  if (cache.has(path)) return cache.get(path);
  const exports = {};
  cache.set(path, exports);
  const js = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, resolveJsonModule: true, esModuleInterop: true }
  }).outputText;
  runInNewContext(js, { exports, require: name => name.endsWith('.json')
    ? JSON.parse(readFileSync(resolve(dirname(path), name), 'utf8'))
    : loadData(resolve(dirname(path), name + '.ts'), cache) });
  return exports;
}
