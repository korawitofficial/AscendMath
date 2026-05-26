# ✨ AscendMath

![AscendMath badge](https://img.shields.io/badge/AscendMath-00c2ff?style=for-the-badge) ![Status badge](https://img.shields.io/badge/Status-Active-orange?style=for-the-badge) ![Language badge](https://img.shields.io/badge/Language-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=000) ![MathJax badge](https://img.shields.io/badge/MathJax-LaTeX-blueviolet?style=for-the-badge) ![License badge](https://img.shields.io/badge/License-MIT-4caf50?style=for-the-badge)

![EN supported](https://img.shields.io/badge/EN-supported-4caf50?style=flat-square) ![TH supported](https://img.shields.io/badge/EN-supported-4caf50?style=flat-square)

AscendMath is a lightweight, interactive web application designed to transform structured JSON-based mathematics content into a ✨ **beautiful learning dashboard** ✨
Perfect for students preparing for mathematical olympiads — making the exploration of theorems, definitions, proofs, and strategies feel *smooth, aesthetic, and fun*.

---

## Features

* 📂 **JSON-Based Content System**
  Drag, drop, and ✨ *boom* ✨ — your study board appears.

* 🧠 **Interactive Learning Dashboard**
  Turn boring theory into a clean, scrollable knowledge space.

* 🔍 **Smart Search**
  Find formulas, keywords, or LaTeX like a math wizard 🪄

* ⭐ **Favorites System**
  Save the topics you love (or fear 👀)

* 📊 **Progress Tracking**
  Watch yourself get smarter 📈 (yes, really)

* 🌐 **Multilingual UI**
  English 🇬🇧 / Thai 🇹🇭 supported

* 🧮 **Full LaTeX Rendering**
  Beautiful equations via MathJax (no ugly math here)

* 🧩 **Multiple Views**
  Switch between clean UI ✨ and raw JSON nerd mode 🤓

---

## 📁 Project Structure

```bash
.
├── public/                 # 🌍 Static assets (UI stuff lives here)
│   ├── css/
│   │   ├── mobile.css
│   │   └── style.css
│   ├─ script/
│   │   └── script.js
│   ├── index.html
│   └── languages.json
├── knowledge_db/           # 🧠 Your math knowledge vault
│   ├── 01_Set.json
│   ├── 02_Logic.json
│   └── 03_Real-Number.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (super easy)

### 1. Clone the repository

```bash
git clone https://github.com/korawitofficial/AscendMath.git
cd AscendMath
```

### 2. Open the app

```bash
code public/index.html
```

> 💡 No install. No build. No pain. Just vibes.

---

## 📦 JSON Database Format

Each topic is structured like this:

* `how` → definition / theorem
* `useTo` → usage / strategy
* `example` → example / proof

Example:

```json
{
  "Algebra": [
    {
      "id": "algebra-1",
      "index": 1,
      "title": "Quadratic Formula",
      "how": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "useTo": "Solve quadratic equations",
      "example": "Solve x^2 + 3x + 2 = 0"
    }
  ]
}
```

---

## 🎯 How to Use

1. Upload your `.json` file 📂
2. Explore your knowledge board 🧠
3. Search like a genius 🔍
4. Favorite important stuff ⭐
5. Become unstoppable 💅

---

## 🌍 Localization

Managed in `languages.json`:

* English (`en`)
* Thai (`th`)

> Add more languages if you're feeling global 🌏✨

---

## 🛠️ Tech Stack

* HTML5
* CSS3
* JavaScript (Vanilla)
* MathJax ✨

---

## 🌱 Future Ideas

* 🔐 Login & cloud sync
* 💾 Export / import progress
* 🏷️ Tag system + better filtering
* 📱 Mobile UI glow-up

---

## 🙌 Acknowledgements

Built for dreamers who love math and anyone who thinks:

> *"Maybe math can actually look… aesthetic?"*

---# AscendMath