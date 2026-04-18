const express = require("express");
const path = require("path");
const { phases, days } = require("./data/course");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function getPhase(phaseId) {
  return phases.find((p) => p.id === phaseId);
}

app.get("/", (req, res) => {
  res.render("index", { phases, days, getPhase });
});

app.get("/day/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const day = days.find((d) => d.id === id);
  if (!day) return res.redirect("/");
  const phase = getPhase(day.phase);
  const prev = days.find((d) => d.id === id - 1) || null;
  const next = days.find((d) => d.id === id + 1) || null;
  res.render("day", { day, phase, prev, next, days, phases });
});

app.get("/day/:id/deep-dive", (req, res) => {
  const id = parseInt(req.params.id);
  const day = days.find((d) => d.id === id);
  if (!day) return res.redirect("/");
  const phase = getPhase(day.phase);
  res.render("deep-dive", { day, phase, days, phases });
});

app.post("/api/deep-dive", async (req, res) => {
  const { question, dayId } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided" });
  const day = days.find((d) => d.id === dayId);
  const systemPrompt = `You are an expert Terraform and Azure instructor...`; // (truncated for brevity)
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY },
      body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1500, system: systemPrompt, messages: [{ role: "user", content: question }] }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "No response.";
    res.json({ answer: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
