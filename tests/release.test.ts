import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
const branding = fs.readFileSync(new URL('../scripts/apply-android-branding.mjs', import.meta.url), 'utf8');

test('release version is exactly 1.0.0', () => {
  assert.equal(pkg.version, '1.0.0');
});

test('release has only necessary runtime dependencies', () => {
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['react', 'react-dom']);
});

test('PWA identity is complete', () => {
  assert.equal(manifest.short_name, 'MathBEPC');
  assert.equal(manifest.id, './');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
});

test('Android version is derived from package.json', () => {
  assert.match(branding, /packageJson\.version/);
  assert.doesNotMatch(branding, /versionName "3\.0\.0"/);
});
