const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/agents', async (req, res) => {
  const agents = await db.getAllAgents();
  res.json({ success: true, agents });
});

app.get('/api/agents/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, message: 'Identifiant agent invalide.' });
  }

  const agent = await db.getAgentById(id);
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent non trouvé.' });
  }
  res.json({ success: true, agent });
});

app.get('/api/effects', async (req, res) => {
  const effects = await db.getAllEffects();
  res.json({ success: true, effects });
});

app.get('/api/talents', async (req, res) => {
  const talents = await db.getAllTalents();
  res.json({ success: true, talents });
});

app.post('/api/agents', async (req, res) => {
  const agent = req.body;
  if (!agent || !agent.name || !agent.firstName || !agent.password) {
    return res.status(400).json({ success: false, message: 'Informations agent manquantes.' });
  }

  const allAgents = await db.getAllAgents();
  const exists = allAgents.some(
    (item) => item.name.toLowerCase() === agent.name.toLowerCase() && item.firstName.toLowerCase() === agent.firstName.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ success: false, message: 'Agent déjà existant.' });
  }

  const created = await db.createAgent(agent);
  res.json({ success: true, agent: created });
});

app.put('/api/agents/:id', async (req, res) => {
  const id = Number(req.params.id);
  const agent = req.body;
  if (!id || !agent) {
    return res.status(400).json({ success: false, message: 'Agent invalide.' });
  }
  agent.id = id;

  const existing = await db.getAgentById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Agent non trouvé.' });
  }

  const updated = await db.updateAgent(agent);
  res.json({ success: true, agent: updated });
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password) {
    return res.status(400).json({ success: false, message: 'Nom ou mot de passe manquant.' });
  }

  const agent = await db.getAgentByName(name);
  if (!agent || agent.password !== password) {
    return res.status(401).json({ success: false, message: 'Authentification échouée.' });
  }

  res.json({ success: true, agent });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Division Adventure server available at http://localhost:${port}`);
});
