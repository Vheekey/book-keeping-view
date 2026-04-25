const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vendorDir = path.join(root, 'vendor');

const files = [
  {
    src: path.join(root, 'node_modules/pdfjs-dist/build/pdf.min.js'),
    dest: path.join(vendorDir, 'pdf.min.js'),
  },
  {
    src: path.join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
    dest: path.join(vendorDir, 'pdf.worker.min.js'),
  },
  {
    src: path.join(root, 'node_modules/tesseract.js/dist/tesseract.min.js'),
    dest: path.join(vendorDir, 'tesseract.min.js'),
  },
];

if (!fs.existsSync(vendorDir)) {
  fs.mkdirSync(vendorDir, { recursive: true });
}

for (const file of files) {
  if (!fs.existsSync(file.src)) {
    console.warn(`Missing vendor source: ${file.src}`);
    continue;
  }
  fs.copyFileSync(file.src, file.dest);
}

console.log('Vendor assets copied.');
