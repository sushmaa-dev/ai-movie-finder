# 🎬 MovieFinder

AI-powered movie & TV discovery app built with React and Gemini API. Describe what you want to watch using mood, genre, language, or year — and get smart, personalized results.

## 🔗 Live Demo
https://ai-movie-finder.netlify.app

## 📖 About
MovieFinder is a personal project built to solve a real problem — spending more time deciding what to watch than actually watching. Instead of browsing endlessly, just describe what you're in the mood for in natural language. The Gemini API interprets your input and fetches the most relevant movies and TV shows from TMDB.

## ✨ Features
- 🤖 AI-powered search — type anything like "recently released thriller movies", "feel good movies", "rom-com movies", or "new releases" and get personalized results
- 🔥 Trending section — browse what's popular today or this week, filtered by movies or TV shows
- 🎬 Movies & TV Shows — browse both or filter by type
- 🃏 Movie cards — poster, title, release year, and rating at a glance
- 📋 Detail panel — click any card to see full overview, genres, streaming platforms where it's available, and an embedded YouTube trailer
- ⚠️ Error handling — friendly error message when Gemini API limit is reached, trending section remains accessible
- 📱 Fully responsive — works on mobile and desktop

## ⚙️ How It Works
1. User types a description of what they want to watch
2. Gemini API interprets the input and returns structured data — endpoint type (search or discover), genre, language, year, sort order etc.
3. Based on Gemini's response, the right TMDB endpoint is called — search for specific titles, discover for mood/genre/language based queries — using Promise.all to fetch movies and TV shows simultaneously
4. Results are displayed as movie cards, with full details loaded on click via `useEffect`

## 🛠 Tech Stack
- React
- Vite
- CSS
- Gemini API (natural language understanding)
- TMDB API (movie & TV data)

## 🚀 Getting Started

**Prerequisites**
- [Node.js](https://nodejs.org/)
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- TMDB API key from [themoviedb.org](https://www.themoviedb.org)

**Installation**

1. Clone the repo

```bash
git clone https://github.com/sushmaa-dev/ai-movie-finder.git
cd ai-movie-finder
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root and add your API keys

```
VITE_GEMINI_KEY=your_gemini_api_key
VITE_TMDB_TOKEN=your_tmdb_token
```

4. Run the app

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── MovieCard.jsx
│   ├── MovieDetail.jsx
│   ├── Navbar.jsx
│   ├── SearchBar.jsx
│   ├── SearchResults.jsx
│   └── TrendingSection.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## 🙏 Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.

## 📄 License
MIT