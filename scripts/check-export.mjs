import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fail = (message) => {
	throw new Error(`svelte-admin-export: ${message}`);
};
const manifest = JSON.parse(readFileSync(join(root, 'svelte-admin-export.json'), 'utf8'));

if (
	manifest.schema !== 1 ||
	!Array.isArray(manifest.roots) ||
	!Array.isArray(manifest.files) ||
	Object.keys(manifest).sort().join(',') !== 'files,roots,schema'
) {
	fail('expected schema 1 with only roots and files');
}

const entries = [...manifest.roots, ...manifest.files];
if (manifest.roots.length === 0 || new Set(entries).size !== entries.length) {
	fail('roots are required and paths must be unique');
}
for (const path of entries) {
	if (
		typeof path !== 'string' ||
		!path ||
		path.startsWith('/') ||
		path.includes('\\') ||
		posix.normalize(path) !== path ||
		path.split('/').includes('..')
	) {
		fail(`invalid path: ${path}`);
	}
}

const tracked = new Map();
for (const record of execFileSync('git', ['ls-files', '--stage', '-z'], { cwd: root })
	.toString()
	.split('\0')) {
	if (!record) continue;
	const match = /^(\d+) [0-9a-f]+ \d+\t(.+)$/.exec(record);
	if (!match) fail(`cannot parse Git index record: ${record}`);
	tracked.set(match[2], match[1]);
}

const selected = new Set();
for (const exportedRoot of manifest.roots) {
	const absolute = join(root, exportedRoot);
	if (!existsSync(absolute) || !lstatSync(absolute).isDirectory()) {
		fail(`missing root directory: ${exportedRoot}`);
	}
	for (const path of tracked.keys()) {
		if (path.startsWith(`${exportedRoot}/`)) selected.add(path);
	}
	if (![...selected].some((path) => path.startsWith(`${exportedRoot}/`))) {
		fail(`root has no tracked files: ${exportedRoot}`);
	}
}
for (const path of manifest.files) {
	if (!tracked.has(path)) fail(`file is not tracked: ${path}`);
	selected.add(path);
}

function walk(directory) {
	for (const entry of readdirSync(directory)) {
		const absolute = join(directory, entry);
		const stat = lstatSync(absolute);
		const path = relative(root, absolute).split(posix.sep).join('/');
		if (stat.isSymbolicLink()) fail(`symlink is not exportable: ${path}`);
		if (stat.isDirectory()) walk(absolute);
		else if (!stat.isFile()) fail(`non-regular file is not exportable: ${path}`);
		else if (!tracked.has(path)) fail(`untracked file in export root: ${path}`);
	}
}
for (const exportedRoot of manifest.roots) walk(join(root, exportedRoot));

const folded = new Map();
for (const path of selected) {
	const mode = tracked.get(path);
	if (mode !== '100644' && mode !== '100755') fail(`unsupported Git mode ${mode}: ${path}`);
	const key = path.toLowerCase();
	if (folded.has(key) && folded.get(key) !== path) {
		fail(`case-colliding paths: ${folded.get(key)} and ${path}`);
	}
	folded.set(key, path);
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dependencies = new Set([
	...Object.keys(packageJson.dependencies ?? {}),
	...Object.keys(packageJson.devDependencies ?? {})
]);
const coreRoot = manifest.roots[0];
const sourceFiles = [...selected].filter(
	(path) => path.startsWith(`${coreRoot}/`) && /\.(?:css|js|mjs|svelte|ts)$/.test(path)
);

function resolveRelative(from, specifier) {
	const clean = specifier.split('?')[0];
	const target = posix.normalize(posix.join(posix.dirname(from), clean));
	if (target !== coreRoot && !target.startsWith(`${coreRoot}/`)) {
		fail(`core import escapes export root: ${from} -> ${specifier}`);
	}
	const candidates = [
		target,
		`${target}.ts`,
		`${target}.svelte`,
		`${target}/index.ts`,
		`${target}/index.js`
	];
	if (target.endsWith('.js')) candidates.push(`${target.slice(0, -3)}.ts`);
	if (target.endsWith('.svelte.js')) candidates.push(`${target.slice(0, -3)}.ts`);
	if (!candidates.some((path) => selected.has(path))) {
		fail(`unresolved core import: ${from} -> ${specifier}`);
	}
}

for (const path of sourceFiles) {
	const source = readFileSync(join(root, path), 'utf8');
	const specifiers = new Set();
	for (const pattern of [
		/(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/g,
		/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
		/@import\s+['"]([^'"]+)['"]/g
	]) {
		for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
	}
	for (const specifier of specifiers) {
		if (specifier.startsWith('.')) {
			resolveRelative(path, specifier);
			continue;
		}
		if (specifier.startsWith('$') || specifier.startsWith('/')) {
			fail(`forbidden application import: ${path} -> ${specifier}`);
		}
		const parts = specifier.split('/');
		const dependency = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
		if (!dependencies.has(dependency)) {
			fail(`undeclared dependency: ${path} -> ${specifier}`);
		}
	}
}

console.log(`✓ export contract: ${selected.size} files, closed ${coreRoot}`);
