import express from "express";
import cors from "cors";

const app = express();
app.use(cors());          // permite llamadas desde GitHub Pages
app.use(express.json());

// Estado en memoria (luego puedes leer de DB o MQTT)
let metrics = {
  temperature: 22.1,
  home_power: 540,
  voltage: 229.7,
  last_charge_kwh: 15.6,
  battery_percent: 78,
  updated_at: new Date().toISOString()
};

// GET: devuelve métricas para el panel
app.get("/metrics", (req, res) => res.json(metrics));

// POST: ingesta para actualizar (simuladores / sensores)
const TOKEN = process.env.ECOVOLT_TOKEN || "dev-token";
app.post("/ingest", (req, res) => {
  const auth = req.headers["x-ecovolt-token"];
  if (auth !== TOKEN) return res.status(401).json({ ok: false, error: "unauthorized" });

  const allowed = ["temperature","home_power","voltage","last_charge_kwh","battery_percent"];
  for (const k of Object.keys(req.body)) if (allowed.includes(k)) metrics[k] = req.body[k];
  metrics.updated_at = new Date().toISOString();
  res.json({ ok: true, metrics });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Ecovolt API listening on ${PORT}`));
