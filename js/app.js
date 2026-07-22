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
import { loadTalents, loadMessagesForCurrentAgent, loadAllEffects, requestJson } from './data.js';
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
  const loginFormEl = document.getElementById('loginForm');
  if (!loginFormEl) return;
  
  loginFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = loginFormEl.agentName.value.trim();
    const password = loginFormEl.agentPassword.value;
    
    if (!name || !password) {
      showToast('Entrez un nom et un mot de passe valides.');
      return;
    }
    
    const result = await loginAgent(name, password);
    
    if (!result || !result.success || !result.agent) {
      showToast('Agent non trouvé ou mot de passe incorrect.');
      return;
    }
    
    const { agent, adventure, pendingInvitation } = result;
    
    // Sauvegarder la session et l'agent
    saveSession(agent);
    store.setCurrentAgent(agent);
    
    // Sauvegarder l'aventure active si elle existe
    if (adventure) {
      store.setCurrentAdventure(adventure);
    }
    
    // Gérer le flux en fonction du statut de l'agent
    if (pendingInvitation) {
      // Invitation en attente → rediriger vers la page d'invitation
      window.location.href = `/agent/invitation?agentId=${agent.id}`;
      return;
    } else if (adventure) {
      // Aventure active → aller au tableau de bord
      // Charger les effets pour les détails
      try {
        await loadAllEffects();
      } catch (error) {
        console.error('Erreur chargement effets:', error);
      }
      
      // renderAgent sera appelé automatiquement via l'abonnement dans ui.js
      await renderAgent(agent);
      showSection('mainPage');
      openDashboardView();
      
      // Charger les messages
      try {
        const messages = await loadMessagesForCurrentAgent();
        // renderMessages sera appelé automatiquement via l'abonnement
        renderMessages(messages);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    } else {
      // Agent dormant (pas d'aventure, mais peut avoir une invitation)
      // Sauvegarder l'agent dans le store
      store.setCurrentAgent(agent);
      
      // Afficher l'écran d'attente
      showSection('agentWaitingScreen');
      
      // Charger et afficher le contenu approprié
      await renderAgentWaitingScreen(agent, pendingInvitation);
    }
  });
}

// ============================================================================
// GESTION DE L'ÉCRAN D'ATTENTE POUR AGENTS DORMANTS
// ============================================================================

/**
 * Affiche l'écran d'attente pour un agent dormant/invité
 * @param {Object} agent - L'agent connecté
 * @param {Object|null} pendingInvitation - Invitation en attente (si elle existe)
 */
async function renderAgentWaitingScreen(agent, pendingInvitation) {
  const waitingScreen = document.getElementById('agentWaitingScreen');
  if (!waitingScreen) return;

  const invitationView = document.getElementById('agentInvitationView');
  const dormantView = document.getElementById('agentDormantView');

  if (pendingInvitation) {
    // Afficher l'invitation
    invitationView.style.display = 'block';
    dormantView.style.display = 'none';

    // Remplir les données de l'invitation
    document.getElementById('agentInvitationAdventureName').textContent =
      pendingInvitation.adventureName || 'Aventure inconnue';
    document.getElementById('agentInvitationAdventureDescription').textContent =
      pendingInvitation.adventureDescription || 'Aucune description fournie.';

    // Configurer les actions
    document.getElementById('agentAcceptInvitationBtn').onclick = async () => {
      await acceptAgentInvitation(pendingInvitation.id, agent);
    };

    document.getElementById('agentRejectInvitationBtn').onclick = async () => {
      await rejectAgentInvitation(pendingInvitation.id, agent);
    };
  } else {
    // Afficher le message dormant
    invitationView.style.display = 'none';
    dormantView.style.display = 'block';
  }

  // Configurer le bouton retour
  document.getElementById('agentWaitingBackBtn').onclick = () => {
    // Déconnecter l'agent et revenir à l'écran de login
    clearSession();
    store.setCurrentAgent(null);
    showSection('landing');
  };
}

/**
 * Accepte une invitation
 * @param {number} invitationId - ID de l'invitation
 * @param {Object} agent - L'agent connecté
 */
async function acceptAgentInvitation(invitationId, agent) {
  try {
    const response = await fetch(`/api/agent/invitations/${invitationId}/accept`, {
      method: 'POST'
    });
    const data = await response.json();

    if (data.success) {
      showToast('Invitation acceptée avec succès !');
      // Recharger les données de l'agent
      const updatedAgent = await loadCurrentAgent();
      if (updatedAgent) {
        store.setCurrentAgent(updatedAgent);
        // Vérifier s'il a maintenant une aventure en rechargeant le statut
        const result = await requestJson('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: updatedAgent.name, password: '***unused***' })
        });
        
        if (result.success && result.adventure) {
          store.setCurrentAdventure(result.adventure);
          // Charger les effets
          try {
            await loadAllEffects();
          } catch (error) {
            console.error('Erreur chargement effets:', error);
          }
          // Aller au tableau de bord
          await renderAgent(updatedAgent);
          showSection('mainPage');
          openDashboardView();
          
          // Charger les messages
          try {
            const messages = await loadMessagesForCurrentAgent();
            renderMessages(messages);
          } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
          }
        } else {
          // Toujours pas d'aventure, revenir à l'écran d'attente
          showSection('agentWaitingScreen');
          await renderAgentWaitingScreen(updatedAgent, null);
        }
      }
    } else {
      showToast('Erreur: ' + (data.message || 'Impossible d\'accepter l\'invitation'));
    }
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error);
    showToast('Erreur réseau. Veuillez réessayer.');
  }
}

/**
 * Refuse une invitation
 * @param {number} invitationId - ID de l'invitation
 * @param {Object} agent - L'agent connecté
 */
async function rejectAgentInvitation(invitationId, agent) {
  if (!confirm('Voulez-vous vraiment refuser cette invitation ? Vous pourrez toujours être réinvité plus tard.')) {
    return;
  }

  try {
    const response = await fetch(`/api/agent/invitations/${invitationId}/reject`, {
      method: 'POST'
    });
    const data = await response.json();

    if (data.success) {
      showToast('Invitation refusée.');
      // Revenir à l'écran d'attente sans invitation
      await renderAgentWaitingScreen(agent, null);
    } else {
      showToast('Erreur: ' + (data.message || 'Impossible de refuser l\'invitation'));
    }
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    showToast('Erreur réseau. Veuillez réessayer.');
  }
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
  const logoutBtnEl = document.getElementById('logoutBtn');
  if (!logoutBtnEl) return;
  
  logoutBtnEl.addEventListener('click', async () => {
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
  const homeBtnEl = document.getElementById('homeBtn');
  if (!homeBtnEl) return;
  
  homeBtnEl.addEventListener('click', openDashboardView);
}

// ============================================================================
// BOUTON D'ACTIVATION (après création)
// ============================================================================

/**
 * Initialise le bouton d'activation
 */
function initActivateAgentButton() {
  const activateAgentBtnEl = document.getElementById('activateAgentBtn');
  if (!activateAgentBtnEl) return;
  
  activateAgentBtnEl.addEventListener('click', () => {
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
  renderAgentWaitingScreen,
  acceptAgentInvitation,
  rejectAgentInvitation,
};
