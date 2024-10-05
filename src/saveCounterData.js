const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, 'data', 'counterData.json');

const TIME = new Date().toISOString();

const ensureFileExists = () => {
    const dirPath = path.join(__dirname, 'data');

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    if (!fs.existsSync(jsonFilePath)) {
        fs.writeFileSync(jsonFilePath, JSON.stringify({ hero: {} }, null, 2), 'utf-8');
    }
};

const readData = () => {
    ensureFileExists();
    const data = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(data);
};

const saveData = (data) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

const initializeHeroData = () => ({
    counterHeroes: [],
    counterItems: [],
    lastUpdated: {
        counterHeroes: null,
        counterItems: null
    }
});

const setCounterHeroes = (heroName, counterHeroesArray) => {
    const data = readData();

    if (!data.hero[heroName]) {
        data.hero[heroName] = initializeHeroData();
    }

    data.hero[heroName].counterHeroes = counterHeroesArray; 
    data.hero[heroName].lastUpdated.counterHeroes = TIME;
    saveData(data);
};

const setCounterItems = (heroName, counterItemsArray) => {
    const data = readData();

    if (!data.hero[heroName]) {
        data.hero[heroName] = initializeHeroData();
    }

    data.hero[heroName].counterItems = counterItemsArray; 
    data.hero[heroName].lastUpdated.counterItems = TIME;
    saveData(data);
};

const checkHeroData = (heroName) => {
    const data = readData();
    const heroData = data.hero[heroName] || null;

    if (heroData && heroData.lastUpdated) {
        const lastUpdatedDate = new Date(heroData.lastUpdated);
        const currentDate = new Date();
        const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

        if (lastUpdatedDate < oneMonthAgo) return null;
    }
    return heroData;
}


module.exports = {
    setCounterHeroes,
    setCounterItems,
    checkHeroData
};
