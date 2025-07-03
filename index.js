const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing "url" query parameter');
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');

    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const html = await page.content();
    await browser.close();
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(html);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Error al cargar la página');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Puppeteer corriendo en puerto ${PORT}`);
});
