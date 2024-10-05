const scrapeCounterItems = async (browser, url, timeout = 30000) => {
    const page = await browser.newPage();
    await page.goto(url, { timeout, waitUntil: "networkidle2" });
  
    const noArticle = (await page.$(".noarticletext")) || null;
  
    if (noArticle === null) {
      await page.waitForSelector(`#Items`, {timeout});
    }
  
    const data = noArticle
      ? []
      : await page.evaluate(() => {
          const counterItems = [];
  
          const list =
            document.querySelector("#Items").parentElement.nextElementSibling;
  
          const listLength = list.childElementCount;
  
          for (var i = 0; i < listLength; i++) {
            const item = list.children[i];
            const links = item.querySelectorAll('a');
            
            let itemText = item.textContent.trim(); 
          
            links.forEach(link => {
              const linkText = link.textContent.trim();
              if (linkText) {
                const boldedText = `<a>${linkText}</a>`;
                
                const linkTextRegex = new RegExp(linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); 
                itemText = itemText.replace(linkTextRegex, boldedText);
              }
            });
          
            counterItems.push(itemText);
          }
          return counterItems;
        });
  
    await page.close()
    return data;
  };

module.exports = scrapeCounterItems;
