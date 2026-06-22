const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.join(__dirname, '..');
const srcPath = path.join(root, '아이콘.png');

function isBackground(r, g, b, a) {
  if (a <= 8) return true;
  const lum = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return lum >= 228 && spread <= 36;
}

function loadPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function clonePng(img) {
  const out = new PNG({ width: img.width, height: img.height });
  img.data.copy(out.data);
  return out;
}

function knockOutBackground(img) {
  const { width, height, data } = img;
  const visited = new Uint8Array(width * height);
  const stack = [];

  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    visited[idx] = 1;
    stack.push(x, y);
  }

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (stack.length) {
    const x = stack.pop();
    const y = stack.pop();
    const idx = (y * width + x) * 4;
    data[idx + 3] = 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  for (let i = 0; i < data.length; i += 4) {
    if (isBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      data[i + 3] = 0;
    }
  }
}

function getBounds(img, alphaMin = 12) {
  const { width, height, data } = img;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a <= alphaMin) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, w: width, h: height };
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  };
}

function cropPng(img, bounds) {
  const out = new PNG({ width: bounds.w, height: bounds.h });
  for (let y = 0; y < bounds.h; y++) {
    for (let x = 0; x < bounds.w; x++) {
      const src = ((bounds.y + y) * img.width + (bounds.x + x)) * 4;
      const dst = (y * bounds.w + x) * 4;
      out.data[dst] = img.data[src];
      out.data[dst + 1] = img.data[src + 1];
      out.data[dst + 2] = img.data[src + 2];
      out.data[dst + 3] = img.data[src + 3];
    }
  }
  return out;
}

function sample(img, fx, fy) {
  const x = Math.max(0, Math.min(img.width - 1, fx));
  const y = Math.max(0, Math.min(img.height - 1, fy));
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
}

function resizePng(img, size) {
  const out = new PNG({ width: size, height: size });
  const scaleX = img.width / size;
  const scaleY = img.height / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = (x + 0.5) * scaleX - 0.5;
      const sy = (y + 0.5) * scaleY - 0.5;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(img.width - 1, x0 + 1);
      const y1 = Math.min(img.height - 1, y0 + 1);
      const tx = sx - x0;
      const ty = sy - y0;

      const c00 = sample(img, x0, y0);
      const c10 = sample(img, x1, y0);
      const c01 = sample(img, x0, y1);
      const c11 = sample(img, x1, y1);

      const dst = (y * size + x) * 4;
      for (let c = 0; c < 4; c++) {
        const top = c00[c] * (1 - tx) + c10[c] * tx;
        const bottom = c01[c] * (1 - tx) + c11[c] * tx;
        out.data[dst + c] = Math.round(top * (1 - ty) + bottom * ty);
      }
    }
  }
  return out;
}

function fitSquare(img) {
  const size = Math.max(img.width, img.height);
  const out = new PNG({ width: size, height: size });
  const ox = Math.floor((size - img.width) / 2);
  const oy = Math.floor((size - img.height) / 2);

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const src = (y * img.width + x) * 4;
      const dst = ((oy + y) * size + (ox + x)) * 4;
      out.data[dst] = img.data[src];
      out.data[dst + 1] = img.data[src + 1];
      out.data[dst + 2] = img.data[src + 2];
      out.data[dst + 3] = img.data[src + 3];
    }
  }
  return out;
}

function writePng(filePath, img) {
  fs.writeFileSync(filePath, PNG.sync.write(img));
}

const src = loadPng(srcPath);
const cleaned = clonePng(src);
knockOutBackground(cleaned);
const bounds = getBounds(cleaned);
const cropped = cropPng(cleaned, bounds);
const squared = fitSquare(cropped);
const favicon32 = resizePng(squared, 32);
const favicon64 = resizePng(squared, 64);
const appleIcon = resizePng(squared, 180);

writePng(path.join(root, 'favicon.png'), favicon64);
writePng(path.join(root, 'favicon-32.png'), favicon32);
writePng(path.join(root, 'apple-touch-icon.png'), appleIcon);

console.log('Processed favicon:', bounds, '->', squared.width, 'px square');
