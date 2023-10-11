const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const puppeteer = require("puppeteer");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.static(__dirname + "/public"));

function parseQuery() {
  return {
    width: 400,
    height: 400,
    zoom: 6.948324170362582,
    center: [5.351180602364934, 52.18246194009333],
    timeout: 30000,
    filename: "map",
  };
}

async function fetchPicture(page, { width, height, center, zoom, timeout }) {
  await page.setViewport({ width, height });
  const error = await page.evaluate(
    (view) => {
      document.body.classList.add("loading");
      try {
        // will throw an exception if center coordinates are invalid
        // @ts-ignore
        map.jumpTo(view);
        return null;
      } catch (e) {
        document.body.classList.remove("loading");
        return "Error, check the query parameters.";
      }
    },
    { zoom, center }
  );
  if (error) {
    return { error };
  }
  try {
    await page.waitForSelector("body.loading", { hidden: true, timeout });
  } catch {
    return { error: `Timeout exceeded (${timeout}ms)` };
  }
  const scrShot = await page.screenshot({ type: "jpeg" }); // returns a Buffer
  return { buffer: scrShot };
}

app.get("/api/map", async (req, res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  // TODO
  await page.goto(`http://localhost:${PORT}/map.html`);

  const { error, buffer } = await fetchPicture(page, parseQuery());
  if (error) {
    res.status(400).send(error);
  } else {
    res.contentType("image/jpeg").end(buffer, "binary");
  }
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
