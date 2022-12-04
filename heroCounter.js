try {
  require.resolve("puppeteer");
  require.resolve("sync-fetch");
  require.resolve("dotenv");
  require.resolve("cli-table3");
  require.resolve("@colors/colors");
} catch (e) {
  console.log(`Error: ${e.code}`);
  console.log(`To install modules type:`);
  console.log(`npm install`);
  process.exit(e.code);
}

const readline = require("readline");
const puppeteer = require("puppeteer");
const fetchSync = require("sync-fetch");
const Table = require("cli-table3");
const colors = require("@colors/colors");
require("dotenv").config();

const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help")) {
  const table = new Table({
    head: ["Flag", "Description"],
    style: {
      head: ["green", "bold"],
    },
  });

  const instructions = [
    {
      flag: "-items",
      description: "Suggest only items",
    },
    {
      flag: "-heroes",
      description: "Suggest only heroes",
    },
    {
      flag: "-utility",
      description: "Suggest only utility heroes. (Default: Core)",
    },
    {
      flag: "-c",
      description: "Returns items with their price",
    },
    {
      flag: "-k",
      description: "To hide message while not including API key",
    },
    {
      flag: "-h or --help",
      description: "Insturctions..",
    },
  ];

  instructions.map(item => {
    table.push([
      colors.magenta.bold(item.flag),
      colors.bold.cyan(item.description),
    ]);
  });

  console.log(table.toString());

  process.exit();
}

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

const scrapeCounterHeroes = async (url, role) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: minimal_args,
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const noHeroes = (await page.$(".heroSuggestionContainerScroll")) || true;

  if (noHeroes === true) {
    return [];
  }

  await page.exposeFunction("role", role);

  await page.waitForSelector(`.heroSuggestionContainerScroll`);
  const data = await page.evaluate(async () => {
    const counterHeroes = [];

    const roleIndex = await role();

    const list = document.querySelector(".heroSuggestionContainerScroll")
      .firstElementChild.children[roleIndex].children[0].children;

    for (var i = 0; i < list.length; i++) {
      let name = list[i].children[1].textContent.trim().split("\n")[0];
      let rate = parseFloat(
        list[i].children[1].children[1].textContent
          .trim()
          .split("\n")[0]
          .slice(1, -1)
          .replace("+", "")
      ).toFixed(1);

      counterHeroes.push({ name, rate });
    }
    return counterHeroes;
  });

  await browser.close();
  return data;
};

const fetchItems = () => {
  try {
    const response = fetchSync(
      `https://api.steampowered.com/IEconDOTA2_570/GetGameItems/v0001/?key=${process.env.STEAM_API_KEY}&format=json&language=en`
    );

    const data = response.json();

    return data.result.items;
  } catch (err) {
    if (args.includes("-c")) {
      console.log(
        `${colors.red.bold(`API key is missing!`)} ${colors.green.bold(
          `You can't see items price without API key.`
        )}`
      );
    }
    if (args.includes("-k")) return;
    console.log(
      `${colors.bold.green(
        `To highlight items, enter your Steam API key into ${colors.magenta(
          ".env"
        )} file.\nFor API key, you can visit ${colors.blue.underline(
          "(https://steamcommunity.com/dev)"
        )}`
      )}`
    );
    console.log(
      `${colors.bold.yellow(
        `echo "STEAM_API_KEY=${colors.magenta.bold("KEY")}" >> .env`
      )}`
    );
    console.log(
      `${colors.red.bold(
        `To hide this message add flag ${colors.magenta("-k")} to the script`
      )}`
    );
  }
};

rl.question(
  `${colors.green.bold(`Enter Hero Name`)}\n${colors.magenta.bold(">")} `,
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

    let noData = false;

    if (
      (args.includes("-items") && args.includes("-heroes")) ||
      !args.includes("-items")
    ) {
      const url = `https://dotapicker.com/herocounter#!/E_${hero}`;

      const counterHeroes = scrapeCounterHeroes(url, () => {
        return args.includes("-utility") ? 1 : 0;
      });

      counterHeroes.then(data => {
        if (data.length === 0) {
          noData = true;
          if (args.includes("-heroes") && !args.includes("-items")) {
            console.log(
              `${colors.bold.red(
                "There is currently no data about this hero."
              )}`
            );
            console.log(`${colors.bold.green("Outputs:")}`);
            [`Hero: ${hero}`, url].map(item => {
              console.log(`${colors.bold.magenta("⚫")}${item}`);
            });
            process.exit();
          }
          return;
        }

        const table = new Table({
          head: ["Rate", "Hero"],
          style: {
            head: ["green", "bold"],
          },
        });
        data.map(hero => {
          if (hero.rate <= 0) return;
          table.push([
            colors.magenta.bold(hero.rate),
            colors.bold.cyan(hero.name),
          ]);
        });
        console.log(table.toString());
      });
    }

    if (args.includes("-heroes") && !args.includes("-items")) {
      rl.close();
      return;
    }

    const url = `https://dota2.fandom.com/wiki/${hero}/Counters`;
    const counterItems = scrapeCounterItems(url);

    counterItems.then(data => {
      if (data.length === 0) {
        console.log(
          `${colors.bold.red("There is currently no data about this hero.")}`
        );
        console.log(`${colors.bold.green("Outputs:")}`);

        if (args.includes("-items") && !args.includes("-heroes")) {
          [`Hero: ${hero}`, url].map(item => {
            console.log(`${colors.bold.magenta("⚫")}${item}`);
          });
          process.exit();
        }

        [
          `Hero: ${hero}`,
          `https://dotapicker.com/herocounter#!/E_${hero}`,
          url,
        ].map(item => {
          console.log(`${colors.bold.magenta("⚫")}${item}`);
        });
        process.exit();
      }

      const items = fetchItems();

      data.map(counterItem => {
        let counterItemText = counterItem;

        if (!items) {
          console.log(`${colors.bold.magenta("⚫")}${counterItem}`);
          return;
        }

        items.map(item => {
          if (counterItem.includes(item.localized_name)) {
            let itemName = item.localized_name;

            if (args.includes("-c")) {
              counterItemText = `${counterItemText.replace(
                itemName,
                `${colors.bold.blue(itemName)} ${colors.bold.yellow(
                  `🟡${item.cost}`
                )}`
              )}`;
              return;
            }

            counterItemText = `${counterItemText.replace(
              itemName,
              `${colors.bold.blue(itemName)}`
            )}`;
          }
        });
        console.log(`${colors.bold.magenta("⚫")}${counterItemText}`);
      });
    });
    rl.close();
  }
);
