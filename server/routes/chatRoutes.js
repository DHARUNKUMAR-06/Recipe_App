const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

router.post("/", async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ reply: "Please send a message." });
  }
  const userMessage = req.body.message.toLowerCase();

  // 1. Open Recipe intent
  const openMatch = userMessage.match(/open\s+(.+)/);
  if (openMatch && openMatch[1]) {
    const query = openMatch[1].trim().replace(/[^a-z0-9 ]/g, '');
    if (query) {
      try {
        // Try precise title match first
        const regexTerm = new RegExp('^' + query, 'i');
        let match = await Recipe.findOne({ title: regexTerm });

        // Try wildcard title match
        if (!match) {
          const wildcardRegex = new RegExp(query, 'i');
          match = await Recipe.findOne({ title: wildcardRegex });
        }

        // --- NEW: Smart Fallback for Typos/Keywords ---
        if (!match) {
          const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
          if (keywords.length > 0) {
            // Find recipes that match ANY keyword to start with
            const candidates = await Recipe.find({
              title: { $regex: keywords.join('|'), $options: 'i' }
            }).limit(10);

            if (candidates.length > 0) {
              let bestCandidate = null;
              let highestScore = 0;

              candidates.forEach(cand => {
                let score = 0;
                const titleLower = cand.title.toLowerCase();
                const titleWords = titleLower.split(/\s+/);

                keywords.forEach(kw => {
                  // Direct match
                  if (titleLower.includes(kw)) {
                    score += 10;
                  } else {
                    // Fuzzy match: Anagram check (handles "briyani" vs "biryani")
                    const kwSorted = kw.split('').sort().join('');
                    titleWords.forEach(tw => {
                      const twSorted = tw.split('').sort().join('');
                      if (twSorted === kwSorted && Math.abs(tw.length - kw.length) <= 1) {
                        score += 8;
                      } else if (tw.startsWith(kw.substring(0, 3)) && kw.length > 3) {
                        score += 3;
                      }
                    });
                  }
                });

                // Penalty for long titles to favor exact matches
                score -= (cand.title.length / 20);

                if (score > highestScore) {
                  highestScore = score;
                  bestCandidate = cand;
                }
              });

              // Threshold to avoid random matches
              if (bestCandidate && highestScore > 7) {
                match = bestCandidate;
              }
            }
          }
        }
        // --- End of Smart Fallback ---

        if (match) {
          return res.json({
            reply: `Opening ${match.title}...`,
            redirect: `/recipe.html?id=${match._id}`
          });
        } else {
          return res.json({ reply: `I couldn't find a recipe named "${query}" to open.` });
        }
      } catch (err) {
        console.error("Error finding recipe to open:", err);
        return res.status(500).json({ reply: "An error occurred while finding the recipe." });
      }
    }
  }

  // 2. Navigation intents
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