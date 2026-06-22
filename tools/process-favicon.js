const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const srcPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'icon-source.jpg');

if (!fs.existsSync(srcPath)) {
  console.error('Usage: node tools/process-favicon.js [icon-source.jpg|png]');
  console.error('Generates favicon.png, favicon-32.png, apple-touch-icon.png in project root.');
  process.exit(1);
}

async function run() {
  const trimmed = await sharp(srcPath).trim({ threshold: 10 }).toBuffer();
  const squared = await sharp(trimmed)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(squared).resize(32, 32).png().toFile(path.join(root, 'favicon-32.png'));
  await sharp(squared).resize(64, 64).png().toFile(path.join(root, 'favicon.png'));
  await sharp(squared).resize(180, 180).png().toFile(path.join(root, 'apple-touch-icon.png'));
  console.log('Favicons written to project root.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
