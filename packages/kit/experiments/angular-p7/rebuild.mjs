import { cp, copyFile, mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = dirname(fileURLToPath(import.meta.url));
const repository = resolve(source, '../../../..');
const [tarballArg, destinationArg, majorArg = '20', ...flags] = process.argv.slice(2);
if (!tarballArg || !destinationArg || !['20', '21', '22'].includes(majorArg)) {
  throw new Error('Usage: node rebuild.mjs <tarball.tgz> <outside-repository-host> [20|21|22] [--reuse-single] [--node=path] [--npm=path]');
}
const destination = resolve(destinationArg);
const node = flags.find((flag) => flag.startsWith('--node='))?.slice(7) ?? process.execPath;
const npmCli = flags.find((flag) => flag.startsWith('--npm='))?.slice(6) ?? process.env.P7_NPM_CLI ?? join(dirname(node), 'node_modules/npm/bin/npm-cli.js');
const relation = relative(await realpath(repository), destination);
if (!relation.startsWith('..') && !isAbsolute(relation)) throw new Error('Host must be outside the repository');
// Fresh destinations prevent lockfiles or installed package contents from contaminating evidence.
try { await readFile(join(destination, 'package.json')); throw new Error('Destination already contains a host; choose a fresh directory'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, filter: (path) => !['node_modules', 'dist', '.angular'].includes(path.split(/[\\/]/).at(-1)) });
await copyFile(resolve(tarballArg), join(destination, 'kit.tgz'));
const pkg = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'));
for (const section of ['dependencies', 'devDependencies']) {
  for (const name of Object.keys(pkg[section])) if (name.startsWith('@angular/')) pkg[section][name] = `^${majorArg}.0.0`;
}
pkg.devDependencies.typescript = majorArg === '22' ? '~6.0.0' : '~5.9.0';
pkg.devDependencies.vitest = majorArg === '20' ? '^3.2.7' : '^4.0.8';
pkg.dependencies['zone.js'] = majorArg === '20' ? '~0.15.0' : '~0.16.0';
if (flags.includes('--reuse-single')) {
  const single = resolve(source, '../angular-s3');
  for (const file of ['app.spec.ts', 'd1.spec.ts', 'd2.spec.ts', 's4.spec.ts', 'session.ts', 's4-state.ts']) {
    await copyFile(join(single, 'src', file), join(destination, 'src', file === 'app.spec.ts' ? 'legacy-app.spec.ts' : file));
  }
  await copyFile(join(single, 'src/app.ts'), join(destination, 'src/legacy-app.ts'));
  const appSpec = join(destination, 'src/legacy-app.spec.ts');
  await writeFile(appSpec, (await readFile(appSpec, 'utf8')).replaceAll("from './app'", "from './legacy-app'"));
}
await writeFile(join(destination, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
const result = spawnSync(node, [npmCli, 'install', '--no-audit', '--no-fund'], { cwd: destination, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`npm install failed: ${result.status}`);
const npmVersion = spawnSync(node, [npmCli, '--version'], { encoding: 'utf8' }).stdout.trim();
const manifest = {
  angularMajor: Number(majorArg), tarball: resolve(tarballArg),
  sha256: createHash('sha256').update(await readFile(join(destination, 'kit.tgz'))).digest('hex'),
  node, nodeVersion: spawnSync(node, ['--version'], { encoding: 'utf8' }).stdout.trim(), npmCli, npmVersion,
  reuseSingle: flags.includes('--reuse-single'), createdAt: new Date().toISOString(),
};
await writeFile(join(destination, 'p7-host-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ destination, ...manifest }));
