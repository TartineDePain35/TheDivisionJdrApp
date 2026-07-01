// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: '*',  // ✅ Autoriser toutes les origines (pour le développement)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// ✅ Servir les fichiers statiques depuis la racine du projet
app.use(express.static(path.join(__dirname)));

// ✅ Servir index.html pour la racine /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ ROUTES ADMIN ============

// ✅ Route pour l'admin - login (page)
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// ✅ Route pour l'admin - dashboard (page)
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// ✅ Route pour l'admin - edit agent (page)
app.get('/admin/agent-edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-agent-edit.html'));
});

// ✅ Route pour l'admin - view/edit agent (redirige vers agent-edit avec l'ID)
app.get('/admin/agent/:id', (req, res) => {
  // Si on veut afficher la page d'édition directement
  res.sendFile(path.join(__dirname, 'admin-agent-edit.html'));
});

// ============ ROUTES API ADMIN ============

// ✅ Login admin (API)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // TODO: Implémenter la vérification admin (à adapter selon votre base)
    // Pour l'instant, on retourne un succès par défaut
    res.json({ success: true, message: 'Connexion admin réussie' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Liste des agents pour l'admin (API)
app.get('/api/admin/agents', async (req, res) => {
  try {
    const agents = await db.getAllAgentsAsync();
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Récupérer un agent spécifique pour l'admin (API)
app.get('/api/admin/agents/:id', async (req, res) => {
  try {
    const agent = await db.getAgentByIdAsync(req.params.id);
    res.json({ agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ROUTES API ============

// Agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await db.getAllAgentsAsync();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const agent = await db.getAgentByIdAsync(req.params.id);
    res.json({ agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = await db.createAgentAsync(req.body);
    res.status(201).json({ agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const agent = await db.updateAgentAsync(req.body);
    res.json({ agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const agent = await db.getAgentByNameAsync(name);
    if (agent && agent.password === password) {
      res.json({ agent });
    } else {
      res.status(401).json({ error: 'Identifiants invalides' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ ROUTE MANQUANTE : Hiérarchie des compétences
app.get('/api/skills/hierarchy/:agentId', async (req, res) => {
  try {
    const hierarchy = await db.getAgentSkillsHierarchy(req.params.agentId);
    res.json(hierarchy);
  } catch (error) {
    console.error('Erreur /api/skills/hierarchy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Effects
app.get('/api/effects', async (req, res) => {
  try {
    const effects = await db.getAllEffectsAsync();
    res.json({ success: true, effects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Talents
app.get('/api/talents', async (req, res) => {
  try {
    const talents = await db.getAllTalentsAsync();
    res.json(talents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DÉMARRAGE ============
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log('✅ Routes disponibles :');
  console.log('   === ADMIN ===');
  console.log(`   - GET  /admin/login`);
  console.log(`   - GET  /admin/dashboard`);
  console.log(`   - GET  /admin/agent-edit`);
  console.log(`   - GET  /admin/agent/:id`);
  console.log(`   - POST /api/admin/login`);
  console.log(`   - GET  /api/admin/agents`);
  console.log(`   - GET  /api/admin/agents/:id`);
  console.log('   === API ===');
  console.log(`   - GET  /api/agents`);
  console.log(`   - GET  /api/agents/:id`);
  console.log(`   - POST /api/agents`);
  console.log(`   - PUT  /api/agents/:id`);
  console.log(`   - POST /api/login`);
  console.log(`   - GET  /api/effects`);
  console.log(`   - GET  /api/skills/hierarchy/:agentId`);
  console.log(`   - GET  /api/talents`);
});