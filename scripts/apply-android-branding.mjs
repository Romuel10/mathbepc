import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'resources', 'android');
const resRoot = path.join(root, 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(resRoot)) {
  throw new Error('Le projet Android n\'existe pas encore. Exécutez "npx cap add android" avant ce script.');
}

const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
for (const density of densities) {
  const srcDir = path.join(sourceRoot, `mipmap-${density}`);
  const destDir = path.join(resRoot, `mipmap-${density}`);
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
    const src = path.join(srcDir, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destDir, file));
  }
}

// Keep the adaptive-icon background in the same Malagasy school palette.
const valuesDir = path.join(resRoot, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#145C48</color>\n</resources>\n'
);

// Replace every generated Capacitor splash bitmap so no default Capacitor logo remains.
const splashSource = path.join(sourceRoot, 'splash.png');
if (fs.existsSync(splashSource)) {
  const stack = [resRoot];
  let replaced = 0;
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === 'splash.png') {
        fs.copyFileSync(splashSource, full);
        replaced++;
      }
    }
  }
  if (!replaced) {
    const drawable = path.join(resRoot, 'drawable');
    fs.mkdirSync(drawable, { recursive: true });
    fs.copyFileSync(splashSource, path.join(drawable, 'splash.png'));
  }
}

console.log('Identité visuelle Android MathBEPC appliquée.');
