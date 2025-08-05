const express = require("express");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    console.error("Falta el parámetro ?url=");
    return res.status(400).send("Falta el parámetro ?url=");
  }

  console.log(`Cargando: ${url}`);
  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const html = await page.content();
    await browser.close();

    console.log(`✅ Renderizado OK para ${url}`);
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error(`❌ Error al renderizar ${url}:`, error.message);
    if (browser) await browser.close();
    res.status(500).send("Error al renderizar la página");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
