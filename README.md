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
    <div>
        <h3>Searching</h3>
        <img src="https://github.com/user-attachments/assets/681b0e47-dde9-4600-8c30-e86a9e61510a" />
    </div>

</div>

### **Features**
* Saves fetched data locally for quicker subsequent access and offline use.
* Supports custom flags like -items and -heroes for flexibility.
* Cross-platform support (Windows, Linux, and macOS).
* Easy-to-use CLI setup with automated dependency installation.
* Provides a desktop shortcut for quick access (Windows only).

---

### **Prerequisites**

- **NodeJS** v16+
- **npm** 8.1.0+

### **Installation**

```sh
# Open terminal
git clone https://github.com/freakGE/Dota2-HeroCounters-CLI.git
cd Dota2-HeroCounters-CLI
node setup.js

dota2-cli # To run script (Linux only)
# If you are using Windows, a shortcut named dota2-cli.lnk will be created on your desktop
```

### **Flags**

| Flag                 | Description                                   |
| -------------------- | --------------------------------------------- |
| **-items**           | Suggests only items                           |
| **-heroes**          | Suggests only heroes                          |
| **-utility**         | Suggests only utility heroes. (Default: Core) |
| **-sync**            | Forces data sync, refetching hero counters    |
| **-custom**          | Custom set of flags                           |
| **-h** or **--help** | Insturctions...                               |

# **Usage**

```sh
# Inside parent dir
cd Dota2-HeroCounters-CLI
```
### *node*
```sh
# node src/index.js [flags]
node src/index.js # w/o any argument it will suggest both items and heroes
node src/index.js -items # suggest only items
```
### *Shortcut*
Open dota2-cli.lnk on your desktop
```sh
Enter flags (e.g., -items -heroes): -heroes -utility
# You can run this from parent dir as well
npm start 
# OR
node run.js
```

