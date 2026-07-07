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

app.get('/api/agents/:id/talents', async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Identifiant agent invalide.' });
  }

  const talents = await db.getAgentTalents(id);
  res.json(talents);
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = req.body;
    
    // Validation des types des champs requis
    if (!agent || typeof agent !== 'object') {
      return res.status(400).json({ success: false, message: 'Données agent invalides.' });
    }
    
    if (typeof agent.name !== 'string' || typeof agent.firstName !== 'string' || typeof agent.password !== 'string') {
      return res.status(400).json({ success: false, message: 'Nom, prénom et mot de passe doivent être des chaînes de caractères.' });
    }
    
    if (!agent.name || !agent.firstName || !agent.password) {
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
  } catch (error) {
    console.error('Erreur lors de la création de l\'agent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur lors de la création de l\'agent.' 
    });
  }
});

app.put('/api/agents/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const agent = req.body;
    
    // Validation des paramètres
    if (!id || typeof id !== 'number' || isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Identifiant agent invalide.' });
    }
    
    if (!agent || typeof agent !== 'object') {
      return res.status(400).json({ success: false, message: 'Données agent invalides.' });
    }
    
    // Validation des champs requis
    if (typeof agent.name !== 'string' || typeof agent.firstName !== 'string') {
      return res.status(400).json({ success: false, message: 'Nom et prénom doivent être des chaînes de caractères.' });
    }
    
    // S'assurer que les champs numériques sont bien des numbers
    if (agent.age !== undefined && typeof agent.age !== 'number') agent.age = Number(agent.age) || null;
    if (agent.inventoryCapacity !== undefined && typeof agent.inventoryCapacity !== 'number') agent.inventoryCapacity = Number(agent.inventoryCapacity) || 30;
    if (agent.lifePercent !== undefined && typeof agent.lifePercent !== 'number') agent.lifePercent = Number(agent.lifePercent) || 100;
    if (agent.availableStatsPoints !== undefined && typeof agent.availableStatsPoints !== 'number') agent.availableStatsPoints = Number(agent.availableStatsPoints) || 0;
    if (agent.availableAttributesPoints !== undefined && typeof agent.availableAttributesPoints !== 'number') agent.availableAttributesPoints = Number(agent.availableAttributesPoints) || 0;
    if (agent.availableTalentPoints !== undefined && typeof agent.availableTalentPoints !== 'number') agent.availableTalentPoints = Number(agent.availableTalentPoints) || 0;
    
    agent.id = id;

    const existing = await db.getAgentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Agent non trouvé.' });
    }

    const updated = await db.updateAgent(agent);
    res.json({ success: true, agent: updated });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'agent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur lors de la mise à jour de l\'agent.' 
    });
  }
});

// Skills endpoints
app.get('/api/skills/hierarchy/:agentId', async (req, res) => {
  const agentId = Number(req.params.agentId);
  if (!agentId) {
    return res.status(400).json({ success: false, message: 'Identifiant agent invalide.' });
  }
  
  const hierarchy = await db.getAgentSkillsHierarchy(agentId);
  res.json({ success: true, hierarchy });
});

app.post('/api/skills/attribute-group', async (req, res) => {
  const { agentId, groupId, value } = req.body;
  if (!agentId || !groupId || value === undefined) {
    return res.status(400).json({ success: false, message: 'Paramètres invalides.' });
  }
  
  const isValid = await db.validateHierarchy(agentId, 'attribute_group', groupId, value);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'La somme des enfants dépasse la valeur du parent.' });
  }
  
  await db.setAgentAttributeGroupValue(agentId, groupId, value);
  res.json({ success: true });
});

app.post('/api/skills/attribute', async (req, res) => {
  const { agentId, attributeId, value } = req.body;
  if (!agentId || !attributeId || value === undefined) {
    return res.status(400).json({ success: false, message: 'Paramètres invalides.' });
  }
  
  const isValid = await db.validateHierarchy(agentId, 'attribute', attributeId, value);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'La somme des enfants dépasse la valeur du parent.' });
  }
  
  await db.setAgentAttributeValue(agentId, attributeId, value);
  res.json({ success: true });
});

app.post('/api/skills/skill-group', async (req, res) => {
  const { agentId, groupId, value } = req.body;
  if (!agentId || !groupId || value === undefined) {
    return res.status(400).json({ success: false, message: 'Paramètres invalides.' });
  }
  
  const isValid = await db.validateHierarchy(agentId, 'skill_group', groupId, value);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'La somme des enfants dépasse la valeur du parent.' });
  }
  
  await db.setAgentSkillGroupValue(agentId, groupId, value);
  res.json({ success: true });
});

app.post('/api/skills/skill', async (req, res) => {
  const { agentId, skillId, value } = req.body;
  if (!agentId || !skillId || value === undefined) {
    return res.status(400).json({ success: false, message: 'Paramètres invalides.' });
  }
  
  await db.setAgentSkillValue(agentId, skillId, value);
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body || {};
    
    // Validation des types : s'assurer que name et password sont des strings
    if (typeof name !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Nom et mot de passe doivent être des chaînes de caractères.' 
      });
    }
    
    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'Nom ou mot de passe manquant.' });
    }

    const agent = await db.getAgentByName(name);
    if (!agent || agent.password !== password) {
      return res.status(401).json({ success: false, message: 'Authentification échouée.' });
    }

    res.json({ success: true, agent });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur lors de la connexion.' 
    });
  }
});

// Admin routes
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    
    // Validation des types
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Nom d\'utilisateur et mot de passe doivent être des chaînes de caractères.' 
      });
    }
    
    if (username === 'AdminAgent' && password === 'Takik_c_Makik') {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Accès refusé' });
    }
  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin/agent/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-agent-edit.html'));
});

// Middleware global pour attraper les erreurs non gérées
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur interne du serveur.' 
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Division Adventure server available at http://localhost:${port}`);
});
