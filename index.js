const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Falta el parámetro ?url=");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const html = await page.content();
    await browser.close();
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error al renderizar la página");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto " + PORT));
