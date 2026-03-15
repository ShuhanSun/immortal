# Game of Immortal 
A browser-based cultivation game built with React, Vite, and TailwindCSS.

[Start Game](https://shuhansun.github.io/immortal/)

Created by Shuhan Sun

----
## 凡人修仙游戏
Shuhan 自制

[开始游戏](https://shuhansun.github.io/immortal/)

----

## Overview

**Immortal** is a lightweight web game inspired by Chinese cultivation fantasy.

The project is currently implemented as a single-page browser game where the player starts as a mortal, grows through cultivation, manages resources, fights enemies, buys items, and progresses through higher realms.

This project is designed as an experimental indie game prototype:
- fast to run
- easy to modify
- simple to deploy
- suitable for continuous feature iteration

## Current Features

### Cultivation Progression
- Realm-based growth system
- Experience accumulation and breakthrough progression
- Multiple cultivation stages from **凡人** to **筑基**

### Combat System
- Turn-based or stat-driven combat flow
- Enemies with different strength levels
- Combat rewards and loot drops

### Items and Economy
- Spirit stones as currency
- Herbs, pills, talismans, weapons, shields, and manuals
- Buying and selling through an in-game shop

### Equipment and Methods
- Weapons and defensive equipment
- Cultivation methods with passive bonuses
- Consumables for healing, growth, and breakthrough support

### World Flavor
- Cultivation-themed enemies such as wild beasts and demon beasts
- Item names and progression systems rooted in xianxia-style design

## Tech Stack

- **React**
- **Vite**
- **TailwindCSS**
- **Lucide React**

## Project Structure

```text
immortal/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
````

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ShuhanSun/immortal.git
cd immortal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Deployment

This project includes GitHub Pages deployment scripts.

```bash
npm run deploy
```

If deployment is configured correctly, the production build will be published from the `dist` directory.

## Gameplay Direction

The current prototype focuses on a compact cultivation gameplay loop:

* cultivate and gain experience
* improve realm and attributes
* gather and trade resources
* use pills and manuals to strengthen the character
* fight stronger enemies
* move toward long-term immortal progression

## Future Plans

Possible next steps for the project:

* save/load system
* map exploration
* sect system
* quests and story events
* alchemy refinement system
* equipment rarity and random affixes
* more realms beyond
* boss encounters
* audio and animation polish
* mobile-friendly UI improvements

## Why This Project

This project is an experiment in combining:

* browser-native game development
* xianxia-inspired system design
* rapid prototyping
* AI-assisted development workflow

It is intentionally lightweight and iteration-friendly.

## License

MIT License

## Author

**Shuhan Sun**

GitHub: [ShuhanSun](https://github.com/ShuhanSun)
