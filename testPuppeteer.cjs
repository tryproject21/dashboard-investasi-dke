const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });

  await page.goto('http://localhost:5173/#/data', { waitUntil: 'networkidle0' });

  await page.waitForSelector('.table-row-hover');

  await page.click('.table-row-hover');

  await page.waitForSelector('button[title="Hapus Kegiatan"]');

  page.on('dialog', async dialog => {
    console.log('Dialog appeared:', dialog.message());
    await dialog.accept();
  });

  console.log('Clicking delete...');
  await page.click('button[title="Hapus Kegiatan"]');

  await new Promise(r => setTimeout(r, 2000));

  const content = await page.content();
  if (content.includes('Memuat Tabel Data')) {
    console.log('STILL LOADING!');
  } else if (!content.includes('Rekapitulasi Data Investasi')) {
    console.log('BLANK PAGE DETECTED!');
  } else {
    console.log('SUCCESS! Table reloaded correctly.');
  }

  await browser.close();
})();
