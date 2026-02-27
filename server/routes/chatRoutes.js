const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ reply: "Please send a message." });
  }
  const userMessage = req.body.message.toLowerCase();

  let reply = "Sorry, I didn't understand.";

  if (userMessage.includes("chicken")) {
    reply = "You can try Grilled Chicken recipe!";
  }
  else if (userMessage.includes("veg")) {
    reply = "Try Paneer Butter Masala!";
  }
  else if (userMessage.includes("rice")) {
    reply = "You can make Curd Rice!";
  }

  res.json({ reply });
});

module.exports = router;