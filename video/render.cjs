const { chromium } = require('/tmp/seal-browser-RwFdAn/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/thequacker/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: path.join(dir, 'raw'), size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  await page.goto('file://' + path.join(dir, 'video.html'));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.complete ? null : new Promise(resolve => { image.onload = resolve; image.onerror = resolve; })));
  });
  await page.waitForTimeout(700);
  const duration = await page.evaluate(() => { window.startVideo(); return window.videoDuration; });
  console.log(`Recording ${duration} seconds at 1920x1080`);
  await page.waitForTimeout(duration * 1000 + 550);
  const video = page.video();
  await context.close();
  await fs.rename(await video.path(), path.join(dir, 'raw', 'pocket-pact-film.webm'));
  await browser.close();
  console.log('Captured', path.join(dir, 'raw', 'pocket-pact-film.webm'));
})().catch(error => { console.error(error); process.exit(1); });
