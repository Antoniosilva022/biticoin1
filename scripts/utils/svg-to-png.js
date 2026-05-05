import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../../site/img/biticoin-logo.svg');
const outPath = join(__dirname, '../../site/img/biticoin-logo.png');

const svg = readFileSync(svgPath);

await sharp(svg)
  .resize(200, 200)
  .png()
  .toFile(outPath);

console.log('✅ Logo convertido: site/img/biticoin-logo.png');
