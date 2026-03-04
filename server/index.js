const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT_ID = process.env.TG_CHAT_ID || "";
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

// ── Middleware ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// ── Telegram ───────────────────────────────────────────────────────────────

async function sendToTelegram({ name, phone, message }) {
  const text =
    `📋 *Нова заявка з сайту*\n\n` +
    `👤 Ім'я: ${name}\n` +
    `📞 Телефон: ${phone}` +
    (message ? `\n💬 Повідомлення: ${message}` : "");

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Telegram: ${err.description}`);
  }
}

// ── Google Sheets (via Apps Script Web App) ────────────────────────────────

async function appendToSheets({ name, phone, message }) {
  const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, message: message || "" }),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Google Sheets: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Google Sheets: ${data.error}`);
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/submit", async (req, res) => {
  const { name, phone, message } = req.body ?? {};

  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Ім'я та телефон обов'язкові" });
  }

  try {
    await Promise.all([
      sendToTelegram({ name: name.trim(), phone: phone.trim(), message: message?.trim() }),
      appendToSheets({ name: name.trim(), phone: phone.trim(), message: message?.trim() }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error.message);
    res.status(500).json({ error: "Помилка сервера. Спробуйте пізніше." });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
