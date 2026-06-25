const fs = require('fs');
const path = require('path');

function findFiles(dir, exts) {
  const res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...findFiles(p, exts));
    else if (exts.includes(path.extname(entry.name).toLowerCase())) res.push(p);
  }
  return res;
}

function checkHtmlForImages(file) {
  const content = fs.readFileSync(file, 'utf8');
  const imgRegex = /<img[^>]*>/gi;
  const imgs = content.match(imgRegex) || [];
  const missing = [];
  imgs.forEach(tag => {
    if (!/\salt\s*=\s*"[^"]+"/i.test(tag) && !/\salt\s*=\s*'[^']+'/i.test(tag)) {
      missing.push(tag);
    }
  });
  return { file, count: imgs.length, missing };
}

const snapshotsDir = path.join(__dirname, '..', '..', 'tmp', 'site-snapshots');
const srcDir = path.join(__dirname, '..', 'src');
const htmlFiles = [];
if (fs.existsSync(snapshotsDir)) htmlFiles.push(...findFiles(snapshotsDir, ['.html']));
if (fs.existsSync(srcDir)) htmlFiles.push(...findFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx', '.html']));

let totalImgs = 0;
let totalMissing = 0;
const report = [];
for (const f of htmlFiles) {
  const r = checkHtmlForImages(f);
  totalImgs += r.count;
  totalMissing += r.missing.length;
  if (r.missing.length) report.push({ file: f, missing: r.missing.length });
}

console.log(`Scanned ${htmlFiles.length} files. Images found: ${totalImgs}. Missing alt: ${totalMissing}.`);
if (report.length) {
  console.log('Files with missing alt attributes:');
  report.forEach(r => console.log(` - ${r.file}: ${r.missing} images`));
  process.exitCode = 2;
} else {
  console.log('All images have alt attributes (no issues found by this quick scan).');
}
