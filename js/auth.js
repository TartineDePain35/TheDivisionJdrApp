/**
 * Module Auth - Gestion de l'authentification et des agents
 * Contient les fonctions de login, session, création et persistance des agents
 */

// ============================================================================
// IMPORTS - State
// ============================================================================
import {
  currentAgent,
  resetAppState,
} from './state.js';

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import {
  STORAGE_KEY,
  SESSION_KEY,
  API_AGENTS_PATH,
  DEFAULT_ATTRIBUTE_VALUES,
} from './config.js';

// ============================================================================
// IMPORTS - Data
// ============================================================================
import { requestJson } from './data.js';

// ============================================================================
// FONCTIONS DE STOCKAGE LOCAL
// ============================================================================

/**
 * Récupère la liste des agents depuis le localStorage
 * @returns {Array} - Tableau des agents
 */
export function getAgents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * Sauvegarde la liste des agents dans le localStorage
 * @param {Array} agents - Tableau des agents à sauvegarder
 */
export function saveAgents(agents) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

/**
 * Récupère la session courante depuis le localStorage
 * @returns {Object|null} - Objet de session ou null
 */
export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

/**
 * Sauvegarde la session courante dans le localStorage
 * @param {Object} agent - Agent à sauvegarder dans la session
 */
export function saveSession(agent) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ 
      agentId: agent.id, 
      agentName: agent.name, 
      timestamp: Date.now() 
    })
  );
}

/**
 * Supprime la session courante
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ============================================================================
// FONCTIONS DE RECHERCHE ET CRÉATION D'AGENTS
// ============================================================================

/**
 * Trouve un agent par son nom (et éventuellement prénom)
 * @param {string} name - Nom de l'agent
 * @param {string} [firstName] - Prénom de l'agent (optionnel)
 * @returns {Object|null} - Agent trouvé ou null
 */
export function findAgent(name, firstName) {
  const agents = getAgents();
  return agents.find((agent) => {
    const matchesName = agent.name.toLowerCase() === name.toLowerCase();
    const matchesFirst = firstName ? agent.firstName.toLowerCase() === firstName.toLowerCase() : true;
    return matchesName && matchesFirst;
  });
}

/**
 * Crée un agent avec les valeurs par défaut
 * @param {Object} data - Données de l'agent
 * @returns {Object} - Agent créé
 */
export function createDefaultAgent(data) {
  return {
    id: Date.now(),
    name: data.name,
    firstName: data.firstName,
    age: data.age,
    profession: data.profession,
    sex: data.sex,
    familyStatus: data.familyStatus,
    children: data.children,
    story: data.story,
    talents: (data.talents && Array.isArray(data.talents)) 
      ? data.talents.map(t => ({...t, id: String(t.id)})) // Garder comme string pour correspondre aux IDs du JSON
      : [],
    stats: data.stats || { speed: 1, resilience: 1, vigor: 1 },
    attributes: data.attributes,
    password: data.password,
    availableStatsPoints: 0,
    availableAttributesPoints: 0,
    availableTalentPoints: 0,
    lifePercent: 100,
    activeMission: 'Aucune affectation en cours. Agent disponible.',
    wounds: [],
    effects: [],
    inventoryCapacity: 30,
    inventory: [],
  };
}

// ============================================================================
// SAUVEGARDE LOCALE DES AGENTS
// ============================================================================

/**
 * Sauvegarde un agent localement (sans API)
 * @param {Object} agent - Agent à sauvegarder
 */
export function saveAgentLocally(agent) {
  const agents = getAgents();
  agents.push(agent);
  saveAgents(agents);
}

/**
 * Met à jour un agent localement (sans API)
 * @param {Object} agent - Agent à mettre à jour
 */
export function updateAgentLocally(agent) {
  const agents = getAgents();
  const index = agents.findIndex((storedAgent) => 
    storedAgent.id === agent.id || storedAgent.name === agent.name
  );
  if (index >= 0) {
    agents[index] = agent;
  } else {
    agents.push(agent);
  }
  saveAgents(agents);
}

// ============================================================================
// FONCTIONS API
// ============================================================================

/**
 * Connecte un agent via l'API
 * @param {string} name - Nom de l'agent
 * @param {string} password - Mot de passe
 * @returns {Promise<Object|null>} - Agent authentifié ou null
 */
export async function loginAgent(name, password) {
  try {
    const result = await requestJson('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    return result.agent;
  } catch {
    // Fallback vers la connexion locale
    return loginAgentLocally(name, password);
  }
}

/**
 * Connecte un agent localement (sans API)
 * @param {string} name - Nom de l'agent
 * @param {string} password - Mot de passe
 * @returns {Object|null} - Agent authentifié ou null
 */
export function loginAgentLocally(name, password) {
  const agent = findAgent(name);
  if (!agent) {
    return null;
  }
  if (agent.password !== password) {
    return null;
  }
  return agent;
}

/**
 * Crée un nouvel agent via l'API ou localement
 * @param {Object} agentData - Données de l'agent
 * @returns {Promise<Object>} - Agent créé
 */
export async function createAgent(agentData) {
  const agent = createDefaultAgent(agentData);
  
  try {
    const result = await requestJson(API_AGENTS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    return result.agent || agent;
  } catch (error) {
    if (error.status === 409) {
      // Agent existe déjà
      throw error;
    }
    // Fallback : sauvegarde locale
    saveAgentLocally(agent);
    return agent;
  }
}

// ============================================================================
// CHARGEMENT DE L'AGENT COURANT
// ============================================================================

/**
 * Charge l'agent courant depuis la session
 * @returns {Promise<void>}
 */
export async function loadCurrentAgent() {
  const session = getSession();
  if (!session) {
    return null;
  }

  // Essayer de charger depuis l'API si on a un agentId
  if (session.agentId) {
    try {
      const result = await requestJson(`/api/agents/${session.agentId}`);
      if (result?.agent) {
        return result.agent;
      }
    } catch {
      // Fallback vers la session locale
    }
  }

  // Essayer de trouver l'agent localement
  const agent = findAgent(session.agentName);
  if (!agent) {
    clearSession();
    return null;
  }
  
  return agent;
}

/**
 * Persiste l'agent courant (via API ou localement)
 * @returns {Promise<void>}
 */
export async function persistCurrentAgent() {
  if (!currentAgent || !currentAgent.id) return;
  
  try {
    // Protégeons contre les objets non sérialisables
    let agentData;
    try {
      agentData = JSON.parse(JSON.stringify(currentAgent));
    } catch (e) {
      console.error('Erreur de sérialisation de currentAgent:', e);
      throw e;
    }
    
    const response = await requestJson(`/api/agents/${currentAgent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    });
    
    if (!response || !response.success) {
      console.error('Erreur lors de la persistence:', response?.message || 'Réponse invalide');
    }
  } catch (error) {
    console.error('Erreur complète dans persistCurrentAgent:', error);
    // Fallback : sauvegarde locale
    updateAgentLocally(currentAgent);
  }
}

// ============================================================================
// FONCTIONS DE DÉCONNEXION
// ============================================================================

/**
 * Déconnecte l'utilisateur
 * @returns {Promise<void>}
 */
export async function logout() {
  await persistCurrentAgent();
  clearSession();
  resetAppState();
}
