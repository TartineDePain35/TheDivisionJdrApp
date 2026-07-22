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

    // Récupérer l'aventure active et les invitations de l'agent
    const adventure = agent.currentAdventureId ? await db.getAdventureById(agent.currentAdventureId) : null;
    const pendingInvitation = await db.getPendingInvitationByAgentId(agent.id);

    res.json({ 
      success: true, 
      agent, 
      adventure,          // Aventure active (null si dormant)
      pendingInvitation  // Invitation en attente (null si aucune)
    });
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

// Routes pour les pages d'aventures
app.get('/admin/adventures', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-adventures.html'));
});

app.get('/admin/adventures/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-adventure-create.html'));
});

app.get('/admin/adventures/:id/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-adventure-edit.html'));
});

// Route pour la page d'invitation des agents
app.get('/agent/invitation', (req, res) => {
  res.sendFile(path.join(__dirname, 'agent-invitation.html'));
});

// ============ MESSAGES ENDPOINTS ============

// POST /api/messages - Envoyer un message à un agent
app.post('/api/messages', async (req, res) => {
  try {
    const { agent_id, value } = req.body;
    
    if (!agent_id || typeof agent_id !== 'number' || !value || typeof value !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'agent_id et value sont requis et doivent être valides.' 
      });
    }

    // Vérifier que l'agent existe
    const agent = await db.getAgentById(agent_id);
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Agent non trouvé.' 
      });
    }

    await db.createMessage(agent_id, value);
    res.json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// GET /api/messages/:agentId - Récupérer les messages d'un agent
app.get('/api/messages/:agentId', async (req, res) => {
  try {
    const agentId = Number(req.params.agentId);
    
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant agent invalide.' 
      });
    }

    const messages = await db.getMessagesByAgentId(agentId);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// DELETE /api/messages/:id - Supprimer un message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant message invalide.' 
      });
    }

    await db.deleteMessage(id);
    res.json({ success: true, message: 'Message supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// PATCH /api/messages/:id/read - Marquer un message comme lu
app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant message invalide.' 
      });
    }

    await db.markMessageAsRead(id);
    res.json({ success: true, message: 'Message marqué comme lu.' });
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// ============ ADVENTURE ROUTES ============

// GET /api/admin/adventures - Liste des aventures de l'admin
app.get('/api/admin/adventures', async (req, res) => {
  try {
    // Dans cette implémentation, on suppose que l'admin est identifié par une session
    // Pour l'instant, on utilise adminId = 1 (AdminAgent par défaut)
    const adminId = 1; // TODO: Récupérer depuis la session
    const adventures = await db.getAdventuresByAdmin(adminId);
    res.json({ success: true, adventures });
  } catch (error) {
    console.error('Erreur lors de la récupération des aventures:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// POST /api/admin/adventures - Créer une nouvelle aventure
app.post('/api/admin/adventures', async (req, res) => {
  try {
    const { name, description } = req.body || {};
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom de l\'aventure est requis.' 
      });
    }
    
    const adminId = 1; // TODO: Récupérer depuis la session
    const adventureId = await db.createAdventure(name, description, adminId);
    
    res.json({ success: true, adventureId, message: 'Aventure créée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la création de l\'aventure:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// GET /api/admin/adventures/:id - Détails d'une aventure
app.get('/api/admin/adventures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    const adventure = await db.getAdventureById(id);
    if (!adventure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aventure introuvable.' 
      });
    }
    
    // Vérifier que l'admin est le propriétaire (pour l'instant, on saute cette vérif)
    res.json({ success: true, adventure });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'aventure:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// PUT /api/admin/adventures/:id - Mettre à jour une aventure
app.put('/api/admin/adventures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, isActive } = req.body || {};
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom de l\'aventure est requis.' 
      });
    }
    
    const adventure = await db.getAdventureById(id);
    if (!adventure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aventure introuvable.' 
      });
    }
    
    await db.updateAdventure(id, name, description, isActive !== undefined ? isActive : true);
    res.json({ success: true, message: 'Aventure mise à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'aventure:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// DELETE /api/admin/adventures/:id - Supprimer une aventure
app.delete('/api/admin/adventures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    const adventure = await db.getAdventureById(id);
    if (!adventure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aventure introuvable.' 
      });
    }
    
    // Quand on supprime une aventure, les invitations sont supprimées en cascade (FOREIGN KEY)
    // Mais on doit aussi mettre à jour les agents qui étaient dans cette aventure
    const agentsInAdventure = await db.getAgentsByAdventure(id);
    for (const agent of agentsInAdventure) {
      await db.removeAgentFromAdventure(agent.id);
    }
    
    await db.deleteAdventure(id);
    res.json({ success: true, message: 'Aventure supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'aventure:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// GET /api/admin/adventures/:id/agents - Liste des agents disponibles pour invitation
app.get('/api/admin/adventures/:id/agents', async (req, res) => {
  try {
    const adventureId = Number(req.params.id);
    
    if (!adventureId || isNaN(adventureId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    // Récupérer les agents sans aventure OU dans d'autres aventures
    const availableAgents = await db.getAgentsWithoutAdventure();
    
    // Filtrer pour ne pas inclure ceux déjà invités à cette aventure
    const invitations = await db.getInvitationsByAdventure(adventureId);
    const invitedAgentIds = new Set(invitations.map(i => i.agentId));
    
    const filteredAgents = availableAgents.filter(agent => !invitedAgentIds.has(agent.id));
    
    res.json({ success: true, agents: filteredAgents });
  } catch (error) {
    console.error('Erreur lors de la récupération des agents disponibles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// POST /api/admin/adventures/:id/invite - Inviter un ou plusieurs agents à une aventure
app.post('/api/admin/adventures/:id/invite', async (req, res) => {
  try {
    const adventureId = Number(req.params.id);
    const { agentIds } = req.body || {};
    
    if (!adventureId || isNaN(adventureId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun agent spécifié pour l\'invitation.' 
      });
    }
    
    // Vérifier que l'aventure existe
    const adventure = await db.getAdventureById(adventureId);
    if (!adventure) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aventure introuvable.' 
      });
    }
    
    // Créer les invitations
    const createdInvitations = [];
    for (const agentId of agentIds) {
      const agent = await db.getAgentById(agentId);
      if (agent) {
        // Vérifier que l'agent n'a pas déjà une aventure active
        const hasAdventure = await db.hasActiveAdventure(agentId);
        if (!hasAdventure) {
          const invitationId = await db.createInvitation(adventureId, agentId);
          createdInvitations.push(invitationId);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `${createdInvitations.length} invitation(s) créée(s).`,
      invitationIds: createdInvitations 
    });
  } catch (error) {
    console.error('Erreur lors de la création des invitations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// GET /api/admin/adventures/:id/invitations - Liste des invitations pour une aventure
app.get('/api/admin/adventures/:id/invitations', async (req, res) => {
  try {
    const adventureId = Number(req.params.id);
    
    if (!adventureId || isNaN(adventureId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant aventure invalide.' 
      });
    }
    
    const invitations = await db.getInvitationsByAdventure(adventureId);
    res.json({ success: true, invitations });
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// ============ AGENT INVITATION ROUTES ============

// GET /api/agent/invitations - Récupérer les invitations en attente pour l'agent connecté
app.get('/api/agent/invitations', async (req, res) => {
  try {
    // TODO: Récupérer l'agent depuis la session
    // Pour l'instant, on simulate avec un agentId passé en paramètre ou en header
    const agentId = Number(req.headers['x-agent-id']) || Number(req.query.agentId);
    
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant agent invalide.' 
      });
    }
    
    const invitation = await db.getPendingInvitationByAgentId(agentId);
    
    if (!invitation) {
      return res.json({ success: true, invitation: null, message: 'Aucune invitation en attente.' });
    }
    
    res.json({ success: true, invitation });
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// POST /api/agent/invitations/:id/accept - Accepter une invitation
app.post('/api/agent/invitations/:id/accept', async (req, res) => {
  try {
    const invitationId = Number(req.params.id);
    
    if (!invitationId || isNaN(invitationId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant invitation invalide.' 
      });
    }
    
    // TODO: Vérifier que l'agent connecté est bien le propriétaire de l'invitation
    const invitation = await db.getInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invitation introuvable.' 
      });
    }
    
    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette invitation a déjà été traitée.' 
      });
    }
    
    await db.acceptInvitation(invitationId);
    res.json({ success: true, message: 'Invitation acceptée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
});

// POST /api/agent/invitations/:id/reject - Refuser une invitation
app.post('/api/agent/invitations/:id/reject', async (req, res) => {
  try {
    const invitationId = Number(req.params.id);
    
    if (!invitationId || isNaN(invitationId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identifiant invitation invalide.' 
      });
    }
    
    const invitation = await db.getInvitationById(invitationId);
    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invitation introuvable.' 
      });
    }
    
    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette invitation a déjà été traitée.' 
      });
    }
    
    await db.rejectInvitation(invitationId);
    res.json({ success: true, message: 'Invitation refusée avec succès.' });
  } catch (error) {
    console.error('Erreur lors du refus de l\'invitation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur.' 
    });
  }
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
