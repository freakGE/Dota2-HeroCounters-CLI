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
  
  const { fetchHeroList, displayHelpInstructions, handleError, formatItemOutput, formatHeroOutput} = require('./utils');
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
  // const INPUT_HISTORY = []
  // let inputIndex = -1;

  
  if (args.includes("-custom")) {
    const customFlag = ["-items"]
    args.push(...customFlag)
  }
  
  if (args.includes("-h") || args.includes("--help")) 
    displayHelpInstructions();
  
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
    
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  
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
            console.log(`Counter heroes URL: ${heroCountersURL}`)
        }

        if (counterItems?.length > 0 && (!args.includes("-heroes"))) {
            counterItems.forEach(counterItem => {
                console.log(`${colors.bold.magenta("⚫")}${formatItemOutput(counterItem).replace(/<\/?a[^>]*>/g, '')}`);
            });
            setCounterItems(hero, counterItems)
        } else if (counterItems?.length === 0 && (!args.includes("-heroes"))) {
            console.log(colors.bold.red("No item data found."));
            console.log(`Counter items URL: ${itemCountersURL}`)
        }

    } catch (error) {
        handleError(error, hero, {heroCountersURL, itemCountersURL})
    }
  };
  
  
  const heroCounter = async (browser, isFirstRequest, heroList) => {
    const promptMessage = isFirstRequest
      ? `Enter Hero Name (or type ${colors.red.bold("exit")} to quit)`
      : "\nEnter Hero Name";
  
      let input = '';
      let suggestedHero = ""

    console.log(`${colors.green.bold(promptMessage)}\n${colors.magenta.bold(">")}`);

    const onKeyPress = async (str, key) => {
      /* 
      TODO:
      ?key.name
      * up                    input=INPUT_HISTORY[i--]
      * down                  input=INPUT_HISTORY[i++]
      * tab, (right | left )  input=suggestions[i++, i--]
      */
      
      if (key.name === 'return') {
        if (input.length === 0) return
        if (input.trim().toLowerCase() === "exit" || input.trim().toLowerCase() === "e") {
          console.log(colors.bold.green("Exiting..."));
          rl.close();
          return;
        }

        try {
          if (suggestedHero.length > 0) input = suggestedHero
          suggestedHero = ''
          
          const ignoredWords = ["of", "the"];
          let heroInput;
          let filteredAnswer;
        
          if (input.trim().includes("-")) {
            heroInput = input.trim().split("-");
            for (let i = 0; i < heroInput.length; i++) {
              heroInput[i] = heroInput[i][0].toUpperCase() + heroInput[i].slice(1);
            }
        
            filteredAnswer = heroInput.join("-");
          }
        
          if (filteredAnswer === undefined) {
            filteredAnswer = input.trim().split(" ");
          }
          for (let i = 0; i < filteredAnswer.length; i++) {
            if (!ignoredWords.includes(filteredAnswer[i])) {
              filteredAnswer[i] = filteredAnswer[i][0].toUpperCase() + filteredAnswer[i].slice(1);
            }
          }

        
          const hero = typeof filteredAnswer === "string"
              ? filteredAnswer
              : filteredAnswer.join("_");


          input = '';

          // process.stdin.removeListener('keypress', onKeyPress); 
          // process.stdin.off('keypress', onKeyPress);
          
          console.log(colors.green.bold(`Processing hero: ${hero}`)); 
          await processCounter(hero, browser);

          // process.stdin.on('keypress', onKeyPress);
          return
        } catch (err) {
          console.error(colors.red.bold("Error processing input:", err));
        } finally {
          heroCounter(browser, false, heroList); 
        }
        
      } else if (key.name === 'backspace') {
        input = input.slice(0, -1);
      } else if (key.name === 'escape') {
        console.log(colors.bold.green("Exiting..."));
        rl.close();
        return;
      } else {
        if (/^[a-zA-Z\s]$/.test(str)) input += str; 
      }

      // Suggest heroes as user types
      const suggestions = heroList.filter(hero => hero.toLowerCase().startsWith(input.toLowerCase()));
      if (suggestions.length === 1) suggestedHero = suggestions[0]
      if (suggestions.length > 1) suggestedHero = ''

      console.clear(); // Clear console before showing new prompt
      console.log(`${colors.green.bold(promptMessage)}\n${colors.magenta.bold(">")} ${input}`); // Show current input
      if (suggestions.length > 0 && input.length > 0 && suggestions.length !== heroList.length) {
        console.log(colors.yellow(`Suggestions: ${suggestions.join(', ')}${suggestedHero.length > 0 ? " (Press 'Enter')":''}`)); // Display suggestions
      }
    };

    // Attach the keypress event listener
    process.stdin.removeAllListeners('keypress');
    process.stdin.on('keypress', onKeyPress);
    process.stdin.resume();
  };
  

  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: minimal_args,
    });
    const heroList = await fetchHeroList() || [];
  
    heroCounter(browser, true, heroList);
  
    rl.on('close', async () => {
      await browser.close(); 
    });
  })();