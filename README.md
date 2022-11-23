<br>
<h1 align="center">Dota 2 Counter Items for Heroes</h1>

<h2 align="center">About</h2>
<h3 align="center">Script returns information from <a href="https://dota2.fandom.com/wiki/Dota_2_Wiki">Dota 2 Wiki</a> </h3>
<div align="center"><img src="https://user-images.githubusercontent.com/52050303/203575478-dfd17637-f9f2-41ab-89cc-a77781edb1ba.png" /></div>

---

### Prerequisites

- [STEAM API KEY](https://steamcommunity.com/dev)
- **NodeJS** v16+
- **npm** 8.1.0+

### Installation

```sh
# Open terminal
git clone https://github.com/freakGE/Dota2-HeroCounters-CLI.git
cd Dota2-HeroCounters-CLI
echo "STEAM_API_KEY=${KEY}" >> .env
npm install
```

### **Flags**

| Flag | Description                                 |
| ---- | ------------------------------------------- |
| -c   | Returns items with their price              |
| -k   | To hide message while not including API key |

### Usage

```sh
 node heroCounter.js
```

```sh
 node heroCounter.js -c # + cost
```

<div align="center"><img src="https://user-images.githubusercontent.com/52050303/203608667-c197019e-6bd7-4f86-8ae3-0171bf7b481d.png" /></div>
