<br>
<h1 align="center">Dota 2 Hero Counters</h1>

<h2 align="center"><b>About</b></h2>
<h3 align="center">Script returns data from <a href="https://dota2.fandom.com/wiki/Dota_2_Wiki">Dota 2 Wiki</a> and <a href="https://dotapicker.com">dotapicker</a></h3>

<div align="center" class="thumbnails-container">
    <div class="thumbnail heroes">
        <h3><b>Pick Suggestions</b></h3>
        <img src="https://user-images.githubusercontent.com/52050303/205476611-7a4cbc5d-683b-48c2-a728-45d4026379b9.png" />
    </div>
    <div class="thumbnail items">
        <h3><b>Item Suggestions</b></h3>
        <img src="https://user-images.githubusercontent.com/52050303/205475912-39643717-daba-43b8-8e6a-d5f5c99decae.png" />
    </div>
</div>

---

### **Prerequisites**

- **NodeJS** v16+
- **npm** 8.1.0+

### **Installation**

```sh
# Open terminal
git clone https://github.com/freakGE/Dota2-HeroCounters-CLI.git
cd Dota2-HeroCounters-CLI
npm install
```

### **Flags**

| Flag                 | Description                                   |
| -------------------- | --------------------------------------------- |
| **-items**           | Suggests only items                           |
| **-heroes**          | Suggests only heroes                          |
| **-utility**         | Suggests only utility heroes. (Default: Core) |
| **-c**               | Returns items with their price                |
| **-k**               | To hide message while not including API key   |
| **-h** or **--help** | Insturctions...                               |

### **Usage**

To fully utilize the script's capabilities, obtain an [**STEAM API KEY**](https://steamcommunity.com/dev/apikey), open a terminal within **Dota2-HeroCounters-CLI**, create an **.env** file, and paste the key into the variable **STEAM_API_KEY**.

```sh
echo "STEAM_API_KEY=$YOUR_KEY" >> .env # w/o "$"
```

To run script

```sh
 node heroCounter.js # w/o any argument it will suggest both items and heroes
 node heroCounter.js -items # suggest only items
 node heroCounter.js -heroes -utility # only utility heroes
```

In case u already write ur API key into **.env** file u can use flag **-c** which returns items with their own price.

```sh
 node heroCounter.js -items -c
```

<div align="center"><img src="https://user-images.githubusercontent.com/52050303/203608667-c197019e-6bd7-4f86-8ae3-0171bf7b481d.png" /></div>
