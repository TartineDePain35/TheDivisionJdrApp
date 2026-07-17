/**
 * Module UI - Fonctions d'interface utilisateur
 * Contient toutes les fonctions d'affichage et de rendu
 */

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import { EFFECT_ICONS } from './config.js';

// ============================================================================
// IMPORTS - State
// ============================================================================
import { currentAgent, currentAgentMessages, expandedMessageIds, effectsData } from './state.js';

// ============================================================================
// IMPORTS - Data
// ============================================================================
import { loadMessagesForCurrentAgent, loadAllEffects } from './data.js';

// ============================================================================
// IMPORTS - Competences
// ============================================================================
import {
  openCompetencesScreen as openCompetencesScreenFromCompetences,
  renderCompetencesScreen,
  showCompetenceDescription,
  hideCompetenceDescription,
  updateSaveCompetencesButtonState,
} from './competences.js';

// ============================================================================
// IMPORTS - Utils
// ============================================================================
import {
  scrollToTop,
  showSection,
  showToast,
  showModal,
  hideModal,
  sanitizeText,
  getEffectIcon,
} from './utils.js';

// Export vers autres modules
export {
  scrollToTop,
  showSection,
  showToast,
  showModal,
  hideModal,
  sanitizeText,
  getEffectIcon,
};

// ============================================================================
// IMPORTS - Elements
// ============================================================================
import {
  sections,
  brandTag,
  heroName,
  heroLife,
  heroStatsPoints,
  heroAttrPoints,
  heroTalentPoint,
  heroMission,
  missionDescription,
  agentEffects,
  toast,
  createAgentModal,
  dashboardView,
  inventoryView,
  skillsView,
  attributesView,
  competencesView,
  talentsView,
  messagesView,
  inventoryList,
  inventoryCapacityLabel,
  inventoryWeight,
  inventoryFill,
  talentsContainer,
  talentsAvailableContainer,
  confirmTalentBtn,
  messagesList,
  competenceDescModal,
  competenceDescContent,
  skillsReserveCount,
  attributesReserveCount,
  messagesBtn,
  itemDetailsModal,
  itemDetailsContent,
} from './elements.js';

// ============================================================================
// FONCTIONS UTILITAIRES UI
// ============================================================================

/**
 * Affiche le popup de création d'agent
 */
export function showAgentCreatedPopup() {
  if (createAgentModal) {
    createAgentModal.classList.add('active');
  }
}

/**
 * Masque le popup de création d'agent
 */
export function closeAgentCreatedPopup() {
  if (createAgentModal) {
    createAgentModal.classList.remove('active');
  }
}

/**
 * Réinitialise le brand tag
 */
export function resetBrandTag() {
  const brandTag = document.getElementById('brandTag');
  if (brandTag) {
    brandTag.textContent = 'Aventure RPG Mobile';
  }
}

// ============================================================================
// FONCTIONS D'AFFICHAGE PRINCIPALES
// ============================================================================

/**
 * Rendu de l'agent courant dans l'UI
 * @param {Object} agent - Agent à afficher
 */
export async function renderAgent(agent) {
  const heroName = document.getElementById('heroName');
  const heroLife = document.getElementById('heroLife');
  const heroStatsPoints = document.getElementById('heroStatsPoints');
  const heroAttrPoints = document.getElementById('heroAttrPoints');
  const heroTalentPoint = document.getElementById('heroTalentPoint');
  const heroMission = document.getElementById('heroMission');
  const missionDescription = document.getElementById('missionDescription');
  const brandTag = document.getElementById('brandTag');
  const inventoryCapacityLabel = document.getElementById('inventoryCapacityLabel');
  
  if (heroName) heroName.textContent = `${agent.firstName} ${agent.name}`;
  if (heroLife) heroLife.textContent = `${agent.lifePercent ?? 100}%`;
  if (heroStatsPoints) heroStatsPoints.textContent = String(agent.availableStatsPoints ?? 0);
  if (heroAttrPoints) heroAttrPoints.textContent = String(agent.availableAttributesPoints ?? 0);
  if (heroTalentPoint) heroTalentPoint.textContent = String(agent.availableTalentPoints ?? 0);
  
  if (heroMission) heroMission.textContent = 'Tableau de bord de l’Aventure';
  if (missionDescription) missionDescription.textContent = agent.activeMission || agent.mission || 'Disponible, au QG';
  
  if (brandTag) {
    brandTag.textContent = `${agent.firstName} ${agent.name} - The DIVISION agent actif`;
  }
  
  // Rendu des effets
  const agentEffectsEl = document.getElementById('agentEffects');
  if (agentEffectsEl) {
    await renderAgentEffects(agent);
  }
  
  if (inventoryCapacityLabel) {
    inventoryCapacityLabel.textContent = String(agent.inventoryCapacity ?? 30);
  }
  
  openDashboardView();
}

/**
 * Rendu des effets de l'agent
 * @param {Object} agent - Agent dont les effets doivent être rendus
 */
async function renderAgentEffects(agent) {
  const agentEffectsEl = document.getElementById('agentEffects');
  if (!agentEffectsEl) return;
  
  agentEffectsEl.innerHTML = '';
  // Gérer les différentes sources d'effets (assignedEffects, effects, wounds)
  const rawEffects = [
    ...(agent.assignedEffects || []),
    ...(agent.effects || []),
    ...(agent.wounds || [])
  ].filter(Boolean);
  
  // Debug: afficher la structure des effets bruts
  if (rawEffects.length > 0) {
    console.log('Effets bruts de l\'agent (direct):', rawEffects);
    console.log('Premier effet:', rawEffects[0]);
    console.log('Premier effet - has name?', 'name' in rawEffects[0], rawEffects[0]?.name);
    console.log('Premier effet - has type?', 'type' in rawEffects[0], rawEffects[0]?.type);
  }

  if (rawEffects.length) {
    // Normalisation simple : s'assurer que chaque effet a toutes les propriétés nécessaires
    // On fait confiance à rawEffects qui devrait contenir les données complètes de la base
    const normalized = rawEffects.map((item, index) => {
      // Si c'est un objet, l'utiliser directement en garantissant les propriétés
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id,
          name: item.name || '',
          type: item.type || '',
          description: item.description || '',
          duration: item.duration || '',
          icon: item.icon || (item.name ? getEffectIcon(item.name) : '⚠️')
        };
      }
      
      // Si c'est une string, créer un objet basique
      if (typeof item === 'string') {
        return {
          id: null,
          name: item,
          type: '',
          description: '',
          duration: '',
          icon: getEffectIcon(item)
        };
      }
      
      // Si c'est un nombre, créer un objet avec ID
      if (typeof item === 'number') {
        return {
          id: item,
          name: `Effet #${item}`,
          type: '',
          description: '',
          duration: '',
          icon: '⚠️'
        };
      }
      
      // Fallback pour tout autre type
      return {
        id: null,
        name: `Effet #${index + 1}`,
        type: '',
        description: '',
        duration: '',
        icon: '⚠️'
      };
    });
    
    // Utiliser directement normalized au lieu de uniqueEffects (pas de déduplication pour l'instant)
    normalized.forEach((effect) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'effect-tile';
      tile.addEventListener('click', () => openEffectDetails(effect));

      const icon = document.createElement('span');
      icon.className = 'effect-tile-icon';
      const effectName = effect.name || effect.type || '';
      icon.textContent = effect.icon || (effectName ? getEffectIcon(effectName) : '⚠️') || '⚠️';
      
      const label = document.createElement('span');
      label.className = 'effect-tile-label';
      label.textContent = effect.name || effect.type || (effect.id ? `Effet #${effect.id}` : 'Effet inconnu');
      
      tile.append(icon, label);
      agentEffectsEl.appendChild(tile);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'effects-empty';
    empty.textContent = 'Aucun effet actif.';
    agentEffectsEl.appendChild(empty);
  }
}

/**
 * Ouvre les détails d'un effet
 * @param {Object} effect - Effet à afficher
 */
export function openEffectDetails(effect) {
  const itemDetailsModal = document.getElementById('itemDetailsModal');
  const itemDetailsContent = document.getElementById('itemDetailsContent');
  
  if (!effect || !itemDetailsContent || !itemDetailsModal) {
    console.warn('Cannot open effect details: missing required elements');
    return;
  }

  itemDetailsContent.innerHTML = `
    <div class="item-detail-card">
      <div class="item-detail-row"><strong>Type :</strong> ${sanitizeText(effect.type || '—')}</div>
      <div class="item-detail-row"><strong>Nom :</strong> ${sanitizeText(effect.name || '—')}</div>
      <div class="item-detail-row description-only">${sanitizeText(effect.description || 'Aucune description disponible.')}</div>
      <div class="item-detail-row"><strong>Durée :</strong> ${sanitizeText(effect.duration || 'Indéterminée')}</div>
    </div>
  `;
  showModal(itemDetailsModal);
}

// ============================================================================
// AFFICHAGE DES ÉCRANS
// ============================================================================

/**
 * Ouvre le tableau de bord
 */
export function openDashboardView() {
  if (dashboardView) dashboardView.classList.remove('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Tableau de bord de l’Aventure';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.add('hidden');
  
  updateMessagesButtonLabel();
}

/**
 * Ouvre l'écran d'inventaire
 */
export function openInventoryScreen() {
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.remove('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Inventaire';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
}

/**
 * Ouvre l'écran des stats (compétences principales)
 */
export function openSkillsScreen() {
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.remove('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Compétences';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
}

/**
 * Ouvre l'écran des attributs
 */
export function openAttributesScreen() {
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.remove('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Attributs';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
}

/**
 * Ouvre l'écran des talents
 */
export function openTalentsScreen() {
  if (!currentAgent) {
    showToast('Aucun agent sélectionné.');
    return;
  }
  
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.remove('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Talents';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
}

/**
 * Ouvre l'écran des compétences détaillées
 * Délégué au module competences.js
 */
export const openCompetencesScreen = openCompetencesScreenFromCompetences;

/**
 * Ouvre l'écran des messages
 */
export async function openMessagesScreen() {
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.add('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.remove('hidden');
  
  if (heroMission) heroMission.textContent = 'Messages';
  
  const logoutBtn = document.getElementById('logoutBtn');
  const homeBtn = document.getElementById('homeBtn');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  
  // Réinitialiser les messages dépliés
  expandedMessageIds.clear();
  
  // Charger et afficher les messages
  try {
    renderMessages([]);
    const messages = await loadMessagesForCurrentAgent();
    renderMessages(messages);
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    renderMessages([]);
  }
}

// ============================================================================
// RENDU DES COMPOSANTS
// ============================================================================

/**
 * Rendu de l'inventaire
 * @param {Object} agent - Agent dont l'inventaire doit être rendu
 */
export function renderInventory(agent) {
  if (!agent || !inventoryList) return;
  
  const capacity = Number(agent.inventoryCapacity ?? 30);
  const items = Array.isArray(agent.inventory) ? agent.inventory : [];
  const weight = items.reduce((total, item) => total + (Number(item.weight) || 0), 0);
  const fillPercent = capacity > 0 ? Math.round((weight / capacity) * 100) : 0;

  if (inventoryCapacityLabel) {
    inventoryCapacityLabel.textContent = String(capacity);
  }
  if (inventoryWeight) {
    inventoryWeight.textContent = `${weight} / ${capacity}`;
  }
  if (inventoryFill) {
    inventoryFill.textContent = `${Math.min(100, fillPercent)}%`;
  }

  inventoryList.innerHTML = items
    .map(
      (item, index) =>
        `<li class="inventory-row" data-index="${index}">
          <button type="button" class="inventory-item-button" data-index="${index}">
            <div>
              <div class="item-label">${sanitizeText(item.name)}</div>
              <div class="item-count">${sanitizeText(item.category)} • ${item.weight} kg</div>
            </div>
          </button>
          <button type="button" class="inventory-delete-btn" data-index="${index}" aria-label="Supprimer item">🗑️</button>
        </li>`
    )
    .join('');
}

/**
 * Met à jour le libellé du bouton Messages
 */
export function updateMessagesButtonLabel() {
  if (!messagesBtn || !currentAgentMessages) return;
  
  const unreadCount = currentAgentMessages.filter(m => m.is_read !== true).length;
  
  if (unreadCount > 0) {
    messagesBtn.textContent = `Messages (${unreadCount})`;
  } else {
    messagesBtn.textContent = 'Messages';
  }
}

/**
 * Rendu des messages
 * @param {Array} messages - Messages à afficher
 */
export function renderMessages(messages) {
  if (!messagesList) return;

  // Mettre à jour currentAgentMessages avec les messages reçus
  if (Array.isArray(messages)) {
    currentAgentMessages.length = 0;
    currentAgentMessages.push(...messages);
  }

  // Mettre à jour le libellé du bouton Messages
  updateMessagesButtonLabel();

  if (!currentAgentMessages || !currentAgentMessages.length) {
    messagesList.innerHTML = '<div class="messages-empty">Aucun message pour le moment.</div>';
    return;
  }

  messagesList.innerHTML = currentAgentMessages.map((message) => {
    const isExpanded = message.expanded || false;
    const fullContent = sanitizeText(String(message.value || '')).replace(/\n/g, '<br>');
    const isUnread = !message.is_read;

    return `
      <div class="message-card ${isUnread ? 'unread' : ''}">
        <button type="button" class="message-toggle" data-message-id="${message.id}">
          <span class="message-title">${isUnread ? '📩 Nouveau message' : '✅ Message lu'}</span>
        </button>
        <div class="message-body ${isExpanded ? 'expanded' : 'collapsed'}">${isExpanded ? fullContent : ''}</div>
      </div>
    `;
  }).join('');
}

/**
 * Rendu des talents
 * @param {Object} data - Données pour le rendu des talents
 */
export function renderTalents(data) {
  if (!talentsContainer || !talentsAvailableContainer) return;

  const {
    activeTalents = [],
    availableTalents = [],
    hasTalentPoints = true,
    selectedAgentTalentId = null
  } = data || {};

  if (confirmTalentBtn) {
    confirmTalentBtn.disabled = !selectedAgentTalentId;
    confirmTalentBtn.title = selectedAgentTalentId 
      ? 'Confirmer la sélection de ce talent' 
      : 'Sélectionnez un talent disponible pour activer.';
  }

  talentsContainer.innerHTML = '';
  talentsAvailableContainer.innerHTML = '';
  talentsAvailableContainer.classList.toggle('talents-available-disabled', !hasTalentPoints);

  if (!activeTalents || !activeTalents.length) {
    talentsContainer.innerHTML = '<div class="talents-empty">Aucun talent actif.</div>';
  } else {
    activeTalents.forEach((talent) => {
      talentsContainer.appendChild(createTalentTile(talent, false, false));
    });
  }

  if (!availableTalents.length) {
    talentsAvailableContainer.innerHTML = '<div class="talents-empty">Aucun talent disponible.</div>';
  } else {
    availableTalents.forEach((talent) => {
      talentsContainer.appendChild(createTalentTile(talent, true, !hasTalentPoints));
    });
  }
}

/**
 * Crée une tuile de talent
 * @param {Object} talent - Talent à afficher
 * @param {boolean} isAvailable - Si le talent est disponible
 * @param {boolean} isDisabled - Si le talent est désactivé
 * @returns {HTMLElement} - Élément DOM
 */
export function createTalentTile(talent, isAvailable = false, isDisabled = false) {
  const talentTile = document.createElement('div');
  talentTile.className = 'talent-tile';
  if (isAvailable) {
    talentTile.classList.add('talent-tile-available');
  }
  if (isDisabled) {
    talentTile.classList.add('talent-tile-disabled');
  }
  talentTile.dataset.talentId = talent.id;

  const talentName = document.createElement('span');
  talentName.className = 'talent-name';
  talentName.textContent = talent.title || 'Talent inconnu';

  const talentInfoBtn = document.createElement('button');
  talentInfoBtn.type = 'button';
  talentInfoBtn.className = 'talent-info-btn';
  talentInfoBtn.textContent = '?';
  talentInfoBtn.title = 'Voir la description';
  talentInfoBtn.dataset.talentId = talent.id;

  talentInfoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showTalentDescription(talent.description || 'Aucune description disponible.');
  });

  talentTile.appendChild(talentName);
  talentTile.appendChild(talentInfoBtn);
  return talentTile;
}

/**
 * Affiche la description d'un talent
 * @param {string} description - Description à afficher
 */
export function showTalentDescription(description) {
  if (!competenceDescModal || !competenceDescContent) return;
  competenceDescContent.textContent = description;
  competenceDescModal.classList.add('active');
}

/**
 * Affiche la description d'une compétence
 * Délégué au module competences.js
 */
export { showCompetenceDescription } from './competences.js';

/**
 * Masque la description d'une compétence
 * Délégué au module competences.js
 */
export { hideCompetenceDescription } from './competences.js';

/**
 * Rendu des stats (compétences principales)
 * @param {Object} data - Données pour le rendu
 */
export function renderSkillsScreen(data) {
  if (!skillsReserveCount) return;
  
  const { reserve = 0, stats = {} } = data || {};
  
  skillsReserveCount.textContent = String(reserve);
  ['speed', 'resilience', 'vigor'].forEach((stat) => {
    const element = document.getElementById(`${stat}SkillValue`);
    if (element) {
      element.textContent = String(stats[stat] || 1);
    }
  });
}

/**
 * Rendu des attributs
 * @param {Object} data - Données pour le rendu
 */
export function renderAttributesScreen(data) {
  if (!attributesReserveCount) return;
  
  const { reserve = 0, attributes = {} } = data || {};
  
  attributesReserveCount.textContent = String(reserve);
  ['conscience', 'dexterity', 'technique'].forEach((attr) => {
    const element = document.getElementById(`${attr}AttributeValue`);
    if (element) {
      element.textContent = String(attributes[attr] || 1);
    }
  });
}

/**
 * Met à jour les boutons des stats
 * @param {Object} data - Données pour les boutons
 */
export function updateSkillsButtons(data) {
  const { reserve = 0, stats = {}, baseStats = {} } = data || {};
  
  ['speed', 'resilience', 'vigor'].forEach((stat) => {
    const increaseBtn = document.querySelector(`#skillsView [data-stat="${stat}"][data-action="increase"]`);
    const decreaseBtn = document.querySelector(`#skillsView [data-stat="${stat}"][data-action="decrease"]`);
    
    if (increaseBtn) {
      increaseBtn.disabled = reserve <= 0;
    }
    
    if (decreaseBtn) {
      const currentValue = stats[stat] || 1;
      const baseValue = baseStats[stat] || 1;
      decreaseBtn.style.display = currentValue > baseValue ? 'inline-block' : 'none';
    }
  });
}

/**
 * Met à jour les boutons des attributs
 * @param {Object} data - Données pour les boutons
 */
export function updateAttributesButtons(data) {
  const { reserve = 0, attributes = {}, baseAttributes = {} } = data || {};
  
  ['conscience', 'dexterity', 'technique'].forEach((attr) => {
    const increaseBtn = document.querySelector(`#attributesView [data-attr="${attr}"][data-action="increase"]`);
    const decreaseBtn = document.querySelector(`#attributesView [data-attr="${attr}"][data-action="decrease"]`);
    
    if (increaseBtn) {
      increaseBtn.disabled = reserve <= 0;
    }
    
    if (decreaseBtn) {
      const currentValue = Number(attributes[attr]) || 0;
      const baseValue = Number(baseAttributes[attr]) || 1;
      decreaseBtn.style.display = currentValue > baseValue ? 'inline-block' : 'none';
    }
  });
}

/**
 * Met à jour l'état du bouton de sauvegarde des attributs
 * @param {boolean} hasModifications - Si des modifications existent
 */
export function updateSaveAttributesButtonState(hasModifications) {
  const saveAttributesBtn = document.getElementById('saveAttributesBtn');
  if (saveAttributesBtn) {
    saveAttributesBtn.disabled = !hasModifications;
  }
}

/**
 * Met à jour l'état du bouton de sauvegarde des compétences
 * Délégué au module competences.js
 */
export { updateSaveCompetencesButtonState } from './competences.js';

/**
 * Rendu des compétences (niveau 0 - liste des attributs principaux)
 * Délégué au module competences.js
 */
export { renderCompetencesScreen };
