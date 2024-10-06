const colors = require("@colors/colors");
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

const API_URL = "https://www.dota2.com/datafeed/herolist?language=english";

const fetchHeroList = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data?.result?.data?.heroes) {
        const heroNames = data.result.data.heroes.map(hero => hero.name_loc);
        return heroNames;
      } else {
        throw new Error("Could not fetch hero data from API");
      }
    } catch (error) {
      console.error("Error fetching hero list:", error);
      return [];
    }
  };

const displayHelpInstructions = () => {
    const Table = require("cli-table3");

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
            description: "Suggest only utility heroes (Default: Core)",
        },
        {
            flag: "-sync",
            description: "Forces data sync, refetching hero counters",
        },
        {
            flag: "-custom",
            description: "Custom set of flags",
        },
        {
            flag: "-h or --help",
            description: "Instructions...",
        },
    ];

    instructions.forEach(item => {
        table.push([
            colors.magenta.bold(item.flag),
            colors.bold.cyan(item.description),
        ]);
    });

    console.log(table.toString());

    process.exit()
};

const handleError = (error, heroName, { heroCountersURL, itemCountersURL }) => {
    let errorMessage;

    switch (error.name) {
        case 'TimeoutError':
            errorMessage = "Timeout occurred while scraping.";
            break;
        case 'NetworkError':
            errorMessage = "Network issue encountered.";
            break;
        default:
            errorMessage = `An unexpected error occurred. 
            Hero: ${heroName} 
            Counter heroes URL: ${heroCountersURL}
            Counter items URL: ${itemCountersURL}`;
            break;
    }
    console.log(error)

    console.error(colors.bold.red("Error while scraping:", errorMessage));
};

const formatItemOutput = (counterItem) => {
    return counterItem.replace(/<a[^>]*>([^<]+)<\/a>/g, (_, linkText) => `${colors.bold.blue(linkText)}`)
};

const formatHeroOutput = (hero) => {
    return [colors.magenta.bold(hero.rate), colors.bold.cyan(hero.name)];
};

module.exports = {
    fetchHeroList,
    displayHelpInstructions,
    handleError,
    formatItemOutput,
    formatHeroOutput,
};
