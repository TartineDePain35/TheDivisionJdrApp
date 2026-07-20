/**
 * Point d'entrée principal de l'application
 * Ce fichier importe les modules et initialise l'application
 */

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import {
  STORAGE_KEY,
  SESSION_KEY,
  API_AGENTS_PATH,
} from './config.js';

// ============================================================================
// IMPORTS - Éléments DOM
// ============================================================================
import {
  sections,
  loginForm,
  logoutBtn,
  homeBtn,
  activateAgentBtn,
} from './elements.js';

// ============================================================================
// IMPORTS - Modules fonctionnels
// ============================================================================
import { showSection, showToast, showModal, hideModal, renderAgent, resetBrandTag, openDashboardView, renderMessages } from './ui.js';
import { loadCurrentAgent, loginAgent, createAgent, saveSession, clearSession, logout } from './auth.js';
import { loadTalents, loadMessagesForCurrentAgent, loadAllEffects } from './data.js';
import { initEventListeners, resetWizard, getWizardData } from './game.js';
import { findAgent } from './auth.js';

// ============================================================================
// IMPORTS - Store Centralisé
// ============================================================================
import { store } from './store.js';

// Obtenir createAgentBtn directement pour éviter les problèmes de timing des modules
const createAgentBtn = document.getElementById('createAgentBtn');

// ============================================================================
// INITIALISATION DE L'APPLICATION
// ============================================================================

/**
 * Initialise l'application
 */
async function initApp() {
  // Initialiser les écouteurs d'événements
  initEventListeners();
  
  // Charger l'agent courant si une session existe
  const agent = await loadCurrentAgent();
  
  if (agent) {
    // Un agent est connecté - utiliser le Store
    store.setCurrentAgent(agent);
    
    // Charger les effets pour les détails
    try {
      await loadAllEffects();
    } catch (error) {
      console.error('Erreur chargement effets:', error);
    }
    
    // renderAgent sera appelé automatiquement via l'abonnement dans ui.js
    // Mais on l'appelle aussi ici au cas où l'abonnement n'est pas encore initialisé
    await renderAgent(agent);
    showSection('mainPage');
    
    // Charger les messages
    try {
      const messages = await loadMessagesForCurrentAgent();
      // renderMessages sera appelé automatiquement via l'abonnement
      renderMessages(messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  } else {
    // Aucun agent connecté, afficher l'écran de login
    showSection('landing');
  }
  
  // Initialiser les écouteurs du formulaire de login
  initLoginForm();
  
  // Initialiser les écouteurs de création d'agent
  initCreateAgentButton();
  
  // Initialiser les écouteurs de déconnexion
  initLogoutButton();
  
  // Initialiser le bouton retour tableau de bord
  initHomeButton();
  
  // Initialiser le bouton de la pop-up de création d'agent
  initActivateAgentButton();
}

// ============================================================================
// FORMULAIRE DE LOGIN
// ============================================================================

/**
 * Initialise le formulaire de login
 */
function initLoginForm() {
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = loginForm.agentName.value.trim();
    const password = loginForm.agentPassword.value;
    
    if (!name || !password) {
      showToast('Entrez un nom et un mot de passe valides.');
      return;
    }
    
    const agent = await loginAgent(name, password);
    if (!agent) {
      showToast('Agent non trouvé ou mot de passe incorrect.');
      return;
    }
    
    // Sauvegarder la session et afficher l'agent
    saveSession(agent);
    store.setCurrentAgent(agent);
    
    // Charger les effets pour les détails
    try {
      await loadAllEffects();
    } catch (error) {
      console.error('Erreur chargement effets:', error);
    }
    
    // renderAgent sera appelé automatiquement via l'abonnement dans ui.js
    await renderAgent(agent);
    showSection('mainPage');
    
    // Charger les messages
    try {
      const messages = await loadMessagesForCurrentAgent();
      // renderMessages sera appelé automatiquement via l'abonnement
      renderMessages(messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  });
}

// ============================================================================
// CRÉATION D'AGENT
// ============================================================================

/**
 * Initialise le bouton de création d'agent
 */
function initCreateAgentButton() {
  if (!createAgentBtn) return;
  
  createAgentBtn.addEventListener('click', async () => {
    console.log('Clic sur Créer un nouvel agent');
    showSection('createAgent');
    console.log('Chargement des talents...');
    await loadTalents();  // Charger les talents EN PREMIER
    console.log('Talents chargés, réinitialisation du wizard...');
    resetWizard();      // Ensuite réinitialiser le wizard (renderTalent utilisera les talents chargés)
    console.log('Wizard réinitialisé');
  });
}

// ============================================================================
// DÉCONNEXION
// ============================================================================

/**
 * Initialise le bouton de déconnexion
 */
function initLogoutButton() {
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async () => {
    await logout();
    resetBrandTag();
    showSection('landing');
    showToast('Déconnexion réussie.');
  });
}

// ============================================================================
// BOUTON RETOUR TABLEAU DE BORD
// ============================================================================

/**
 * Initialise le bouton retour tableau de bord
 */
function initHomeButton() {
  if (!homeBtn) return;
  
  homeBtn.addEventListener('click', openDashboardView);
}

// ============================================================================
// BOUTON D'ACTIVATION (après création)
// ============================================================================

/**
 * Initialise le bouton d'activation
 */
function initActivateAgentButton() {
  if (!activateAgentBtn) return;
  
  activateAgentBtn.addEventListener('click', () => {
    hideModal(document.getElementById('createAgentModal'));
    showSection('landing');
    showToast('Retour à l\'écran de connexion.');
  });
}

// ============================================================================
// DÉMARRAGE DE L'APPLICATION
// ============================================================================

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initApp);

// Exporter pour les tests
window.App = {
  initApp,
  loadCurrentAgent,
  loginAgent,
  createAgent,
  saveSession,
  clearSession,
};
