import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const installed = JSON.parse(await readFile('node_modules/@opentiny/tiny-robot-kit/package.json', 'utf8'));
const dist = 'node_modules/@opentiny/tiny-robot-kit/dist';
const visited = new Set();
const entries = {};
const dependencies = {};
async function trace(file, forbidden, graph) {
  const key = `${graph}:${file}`;
  if (visited.has(key)) return;
  visited.add(key);
  const content = await readFile(`${dist}/${file}`, 'utf8');
  const imports = [...content.matchAll(/(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)["']([^"']+)["']/g)].map((match) => match[1]);
  for (const dependency of imports) {
    if (!dependency.startsWith('./')) {
      for (const peer of forbidden) assert.ok(dependency !== peer && !dependency.startsWith(`${peer}/`), `${graph}: ${peer} dependency in ${file}`);
      dependencies[graph].add(dependency); continue;
    }
    let target = dependency.slice(2);
    if (file.endsWith('.d.ts')) target = target.replace(/\.js$/, '.d.ts');
    if (file.endsWith('.d.mts')) target = target.replace(/\.mjs$/, '.d.mts');
    await trace(target, forbidden, graph);
  }
}
for (const entry of ['core', 'angular', 'node']) {
  const esm = await import(`@opentiny/tiny-robot-kit/${entry}`);
  const cjs = require(`@opentiny/tiny-robot-kit/${entry}`);
  const named = (module) => Object.keys(module).filter((name) => !['default', '__esModule'].includes(name)).sort();
  assert.deepEqual(named(esm), named(cjs), `${entry}: ESM/CJS named exports differ`);
  for (const name of named(esm)) assert.equal(typeof esm[name], typeof cjs[name], `${entry}.${name}: export types differ`);
  entries[entry] = named(esm); dependencies[entry] = new Set();
  for (const extension of ['mjs', 'js', 'd.ts', 'd.mts']) {
    await trace(`${entry}.${extension}`, entry === 'angular' ? ['vue'] : ['vue', '@angular/core'], entry);
  }
}
for (const name of ['createConversationManager', 'AIClient', 'formatMessages', 'extractTextFromResponse']) assert.ok(entries.core.includes(name), `Missing core export: ${name}`);
for (const name of ['connectAngularConversation', 'injectAngularConversation']) assert.ok(entries.angular.includes(name), `Missing Angular export: ${name}`);
for (const name of ['loadSkill', 'loadSkillWithDetails', 'createFsSkillStorage']) assert.ok(entries.node.includes(name), `Missing node export: ${name}`);
for (const peer of ['vue', '@angular/core']) {
  assert.equal(installed.peerDependenciesMeta?.[peer]?.optional, true, `${peer} must be an optional peer`);
  assert.equal(typeof installed.peerDependencies?.[peer], 'string', `${peer} peer range missing`);
}
assert.ok(!(await readdir('node_modules')).includes('vue'), 'Vue must not be installed');
console.log(JSON.stringify({ version: installed.version, node: process.version, namedExports: entries, checkedFiles: [...visited],
  dependencies: Object.fromEntries(Object.entries(dependencies).map(([key, values]) => [key, [...values]])),
  peerDependencies: installed.peerDependencies, peerDependenciesMeta: installed.peerDependenciesMeta,
  tarballSha256: createHash('sha256').update(await readFile('kit.tgz')).digest('hex') }));
