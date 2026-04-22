const path = require('path');
const fs = require('fs');
const outPath = path.join(process.cwd(), 'output', 'playwright', 'access-card-scan-verify', 'active-scan.png');
await page.waitForFunction(() => {
  const el = document.querySelector('.security-rbac__scan-particles');
  return el && Number(getComputedStyle(el).opacity) > 0.85;
}, { timeout: 10000 });
const target = page.locator('.security-card');
await target.screenshot({ path: outPath, scale: 'css', type: 'png' });
console.log(outPath);
