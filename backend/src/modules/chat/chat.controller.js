const { askAssistant } = require("./chat.service");

function normalizeMessage(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function ask(req, res, next) {
  try {
    const message = normalizeMessage(req.body?.message);
    const imageUrl = normalizeMessage(req.body?.imageUrl);

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }
    if (message.length > 1000) {
      return res.status(400).json({ message: "message is too long (max 1000 chars)" });
    }

    const reply = await askAssistant(message, imageUrl || undefined);
    return res.json({ reply, format: "text" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { ask };
