const scrapeCounterHeroes = async (browser, url, role, timeout = 30000) => {
    const page = await browser.newPage();
    await page.goto(url, { timeout, waitUntil: "networkidle2" });
  
    const noHeroes = (await page.$(".heroSuggestionContainerScroll")) || true;
  
    if (noHeroes === true) {
      return [];
    }
  
    await page.exposeFunction("role", role);
  
    await page.waitForSelector(`.heroSuggestionContainerScroll`, {timeout});
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
  
    await page.close();
    return data;
  };

module.exports = scrapeCounterHeroes;
