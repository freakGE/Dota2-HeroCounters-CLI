try {
    require.resolve("puppeteer");
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
  const Table = require("cli-table3");
  const colors = require("@colors/colors");
  
  const {displayHelpInstructions, handleError, formatItemOutput, formatHeroOutput} = require('./utils');
  const {minimal_args, getHeroCountersURL, getItemCountersURL} = require('./config/puppeteerConfig')
  const {scrapeCounterHeroes, scrapeCounterItems} = require('./scrapers/index');

  const { 
    setCounterHeroes,
    setCounterItems,
    checkHeroData
} = require('./saveCounterData');
  

  const TIMEOUT = 30000
  const MIN_RATE = 2
  const args = process.argv.slice(2);
  
  if (args.includes("-custom")) {
    const customFlag = ["-items"]
    args.push(...customFlag)
  }
  
  if (args.includes("-h") || args.includes("--help")) 
    displayHelpInstructions();
  
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
    
  
  const processCounter = async (hero, browser) => {
    const existingData = checkHeroData(hero);
    const heroCountersURL = getHeroCountersURL(hero)
    const itemCountersURL = getItemCountersURL(hero)
    try {
        let counterHeroes = existingData?.counterHeroes || [];
        let counterItems = existingData?.counterItems || [];
        if (
            args.includes("-sync") || 
            (args.includes("-heroes") && counterHeroes.length === 0) || 
            (args.includes("-items") && counterItems.length === 0) ||
            ((!args.includes("-heroes") && !args.includes("-items")) && counterHeroes.length === 0) ||
            ((!args.includes("-heroes") && !args.includes("-items")) && counterItems.length === 0)
        ) {
            const promises = [];

            if (args.includes("-heroes")) {
                promises.push(scrapeCounterHeroes(browser, heroCountersURL, () => (args.includes("-utility") ? 1 : 0), TIMEOUT));
            } 
            if (args.includes("-items")) {
                promises.push(scrapeCounterItems(browser, itemCountersURL, TIMEOUT));
            } 
            if (!args.includes("-heroes") && !args.includes("-items")) {
                promises.push(scrapeCounterHeroes(browser, heroCountersURL, () => (args.includes("-utility") ? 1 : 0), TIMEOUT));
                promises.push(scrapeCounterItems(browser, itemCountersURL, TIMEOUT));
            }
    
            const results = await Promise.all(promises);
    
            if (results.length > 0) {
                if (args.includes("-heroes") || (!args.includes("-heroes") && !args.includes("-items"))) counterHeroes = results[0];
                if (args.includes("-items") || (!args.includes("-heroes") && !args.includes("-items"))) counterItems = results[results.length - 1]; 
            }
        }



        if (counterHeroes?.length > 0 && (!args.includes("-items"))) {
            const table = new Table({
                head: ["Rate", "Hero"],
                style: { head: ["green", "bold"] },
            });

            const filteredHeroes = counterHeroes.filter(hero => hero.rate > MIN_RATE)
            filteredHeroes.forEach(hero => {
                table.push(formatHeroOutput(hero));
            });
           

            setCounterHeroes(hero, filteredHeroes)
            console.log(table.toString());
        } else if (counterHeroes?.length === 0 && (!args.includes("-items"))) {
            console.log(colors.bold.red("No hero data found."));
        }

        if (counterItems?.length > 0 && (!args.includes("-heroes"))) {
            counterItems.forEach(counterItem => {
                console.log(`${colors.bold.magenta("⚫")}${formatItemOutput(counterItem).replace(/<\/?a[^>]*>/g, '')}`);
            });
            setCounterItems(hero, counterItems)
        } else if (counterItems?.length === 0 && (!args.includes("-heroes"))) {
            console.log(colors.bold.red("No item data found."));
        }

    } catch (error) {
        handleError(error, hero, {heroCountersURL, itemCountersURL})
    }
  };
  
  const heroCounter = async (browser, isFirstRequest) => {
    const promptMessage = isFirstRequest
    ? `Enter Hero Name (or type ${colors.red.bold("exit")} to quit)`
    : "\nEnter Hero Name";
  
  
    rl.question(`${colors.green.bold(promptMessage)}\n${colors.magenta.bold(">")} `,
      answer => {
        if (answer.trim().toLowerCase() === "exit" || answer.trim().toLowerCase() === "e") {
          console.log(colors.bold.green("Exiting..."));
          rl.close(); 
          return; 
        }
  
        try {
          const ignoredWords = ["of", "the"];
          let input;
          let filteredAnswer;
  
          if (answer.trim().includes("-")) {
            input = answer.trim().split("-");
            for (let i = 0; i < input.length; i++) {
              input[i] = input[i][0].toUpperCase() + input[i].substr(1);
            }
  
            filteredAnswer = input.join("-");
          }
  
          if (filteredAnswer === undefined) {
            filteredAnswer = answer.trim().split(" ");
          }
  
          for (let i = 0; i < filteredAnswer.length; i++) {
            if (!ignoredWords.includes(filteredAnswer[i])) {
              filteredAnswer[i] =
                filteredAnswer[i][0].toUpperCase() + filteredAnswer[i].slice(1);
            }
          }
  
          const hero =
            typeof filteredAnswer === "string"
              ? filteredAnswer
              : filteredAnswer.join("_");
  
          processCounter(hero, browser)
            .then(() => {
              heroCounter(browser, false);
            })
            .catch(err => {
              console.error(err);
              heroCounter(browser, false); 
            });
  
        } catch (err) {
          console.error("Error processing input:", err);
          heroCounter(browser, false);
        }
      }
    );
  };
  
  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: minimal_args,
    });
  
    heroCounter(browser, true);
  
    rl.on('close', async () => {
      await browser.close(); 
    });
  })();