const readline = require("readline");
const puppeteer = require("puppeteer");
const fetchSync = require("sync-fetch");
const chalk = require("chalk");
const { type } = require("os");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

const scrapeCounterItems = async url => {
  const browser = await puppeteer.launch({
    headless: true,
    args: minimal_args,
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const noArticle = (await page.$(".noarticletext")) || null;

  if (noArticle === null) {
    await page.waitForSelector(`#Items`);
  }

  const data = noArticle
    ? []
    : await page.evaluate(() => {
        const counterItems = [];

        const list =
          document.querySelector("#Items").parentElement.nextElementSibling;

        const listLength = list.childElementCount;

        for (var i = 0; i < listLength; i++) {
          counterItems.push(list.children[i].textContent.trim());
        }
        return counterItems;
      });

  await browser.close();
  return data;
};

const fetchItems = () => {
  const response = fetchSync(
    `https://api.steampowered.com/IEconDOTA2_570/GetGameItems/v0001/?key=${process.env.STEAM_API_KEY}&format=json&language=en`
  );
  const data = response.json();

  return data.result.items;
};

rl.question(
  `${chalk.green.bold(`Enter Hero Name`)}\n${chalk.magenta.bold(">")} `,
  answer => {
    const ignoredWords = ["of", "the"];
    let input;
    let filtredAnswer;
    if (answer.trim().includes("-")) {
      input = answer.trim().split("-");
      for (let i = 0; i < input.length; i++) {
        input[i] = input[i][0].toUpperCase() + input[i].substr(1);
      }

      filtredAnswer = input.join("-");
    }

    if (filtredAnswer === undefined) filtredAnswer = answer.trim().split(" ");

    for (let i = 0; i < filtredAnswer.length; i++) {
      if (!ignoredWords.includes(filtredAnswer[i]))
        filtredAnswer[i] =
          filtredAnswer[i][0].toUpperCase() + filtredAnswer[i].substr(1);
    }
    const hero =
      typeof filtredAnswer === "string"
        ? filtredAnswer
        : filtredAnswer.join("_");

    const url = `https://dota2.fandom.com/wiki/${hero}/Counters`;
    const counterItems = scrapeCounterItems(url);

    counterItems.then(data => {
      if (data.length === 0) {
        console.log(
          `${chalk.bold.red("There is currently no text in this page.")}`
        );
        console.log(`${chalk.bold.green("Check:")}`);
        [`Hero: ${hero}`, url].map(item => {
          console.log(`${chalk.bold.magenta("⚫")}${item}`);
        });
        return;
      }

      const items = fetchItems();

      data.map(counterItem => {
        let counterItemText = counterItem;

        items.map(item => {
          if (counterItem.includes(item.localized_name)) {
            let itemName = item.localized_name;
            // let itemPrice = item.cost;
            // ${chalk.bold.yellow(`🟡${itemPrice}`)}
            counterItemText = `${counterItemText.replace(
              itemName,
              `${chalk.bold.blue(itemName)}`
            )}`;
          }
        });
        console.log(`${chalk.bold.magenta("⚫")}${counterItemText}`);
      });
    });
    rl.close();
  }
);
