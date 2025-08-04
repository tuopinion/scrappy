const express = require("express");
const puppeteer = require("puppeteer");

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
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
