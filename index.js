const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Falta el parámetro ?url=");

  let browser = null;

  try {
    const executablePath = await chromium.executablePath;
    if (!executablePath) throw new Error("No se encontró ejecutable de Chromium.");

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const html = await page.content();
    await browser.close();

    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("❌ Error al renderizar:", err.message);
    if (browser) await browser.close();
    res.status(500).send("Error al renderizar la página");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en puerto " + PORT);
});
