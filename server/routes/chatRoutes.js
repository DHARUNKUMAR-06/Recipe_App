const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

router.post("/", async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ reply: "Please send a message." });
  }
  const userMessage = req.body.message.toLowerCase();

  // 1. Navigation intents
  if (userMessage.includes("dashboard")) {
    return res.json({ reply: "Taking you to the dashboard...", redirect: "/admin-dashboard.html" });
  }
  if (userMessage.includes("add")) {
    return res.json({ reply: "Taking you to add a new recipe...", redirect: "/add-recipe.html" });
  }
  if (userMessage.includes("home")) {
    return res.json({ reply: "Taking you home...", redirect: "/" });
  }
  if (userMessage.includes("favorite")) {
    return res.json({ reply: "Taking you to your favorites...", redirect: "/favorites.html" });
  }
  if (userMessage.includes("login") || userMessage.includes("sign in")) {
    return res.json({ reply: "Taking you to the login page...", redirect: "/landing.html" });
  }
  if (userMessage.includes("logout") || userMessage.includes("sign out")) {
    return res.json({ reply: "Logging you out...", redirect: "LOGOUT_TRIGGER" });
  }

  // 2. Recipe Search
  // Extract relevant keywords while dropping common words/stopwords
  const stopWords = ['i', 'want', 'need', 'recipe', 'give', 'show', 'except', 'the', 'a', 'an', 'for', 'how', 'to', 'make', 'some', 'any', 'please', 'can', 'you', 'tell', 'me', 'about', 'and', 'or', 'with', 'without'];
  const searchTerms = userMessage.split(/\s+/)
    .map(word => word.replace(/[^a-z0-9]/gi, ''))
    .filter(word => word.length > 2 && !stopWords.includes(word));

  if (searchTerms.length > 0) {
    try {
      // Build regex maps 
      // Build regex maps against multiple fields (title, cuisine, diet)
      const regexConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { cuisine: { $regex: term, $options: 'i' } },
          { dietType: { $regex: term, $options: 'i' } }
        ]
      }));

      // Try strict matching first ($and)
      let recipes = await Recipe.find({ $and: regexConditions }).limit(3);

      // If not found, fall back to loose matching ($or)
      if (recipes.length === 0) {
        recipes = await Recipe.find({ $or: regexConditions }).limit(3);
      }

      if (recipes.length > 0) {
        let reply = `Here are some matching recipes I found:<br><ul style="padding-top: 8px; padding-left: 0; list-style-type: none;">`;
        recipes.forEach(r => {
          reply += `<li style="margin-bottom: 5px;">🍳 <a href="/recipe.html?id=${r._id}" style="color: var(--primary); font-weight: bold; text-decoration: underline;">${r.title}</a></li>`;
        });
        reply += `</ul>`;
        return res.json({ reply });
      }
    } catch (err) {
      console.error("Chatbot query error:", err);
    }
  }

  // Default fallback
  res.json({ reply: "I couldn't find a specific recipe for that. Try searching with dish names like 'Biryani', 'Chicken', or 'Paneer'!" });
});

module.exports = router;