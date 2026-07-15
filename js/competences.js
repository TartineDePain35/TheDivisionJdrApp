/**
 * Module Competences - Gestion complète des compétences
 * Contient toute la logique de rendu, navigation et gestion des compétences
 */

// ============================================================================
// IMPORTS - State
// ============================================================================
import {
  currentAgent,
  competencesHierarchy,
  competencesState,
} from './state.js';

// ============================================================================
// IMPORTS - Data
// ============================================================================
import {
  loadCompetencesData,
  deepMergeCompetences,
} from './data.js';

// ============================================================================
// IMPORTS - Utils
// ============================================================================
import {
  showToast,
  sanitizeText,
} from './utils.js';

// ============================================================================
// IMPORTS - Elements
// ============================================================================
import {
  dashboardView,
  inventoryView,
  skillsView,
  attributesView,
  competencesView,
  talentsView,
  messagesView,
  heroMission,
  competencesContainer,
  saveCompetencesBtn,
  competenceDescModal,
  competenceDescContent,
  logoutBtn,
  homeBtn,
} from './elements.js';

// ============================================================================
// VARIABLES LOCALES D'ÉTAT POUR LES COMPÉTENCES
// (Gérées localement car ce sont des variables temporaires de navigation)
// ============================================================================

// État de navigation dans la hiérarchie des compétences
let currentAttributeGroup = null;
let currentAttributeGroupValue = 0;

// Modifications en cours (niveau 1 - attributs)
let attributeModifications = {};
let attributeBaseValues = {};
let currentAvailablePoints = 0;

// Modifications en cours (niveau 2 - groupes de compétences)
let skillGroupModifications = {};
let skillGroupBaseValues = {};
let currentSkillGroupAvailablePoints = 0;

// Modifications en cours (niveau 3 - compétences)
let skillModifications = {};
let skillBaseValues = {};
let currentSkillAvailablePoints = 0;

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Normalise une clé de nom pour correspondre aux clés d'objet
 * @param {string} name - Nom à normaliser
 * @returns {string} - Nom normalisé
 */
export function normalizeKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e');
}

/**
 * Affiche la description d'une compétence
 * @param {string} description - Description à afficher
 */
export function showCompetenceDescription(description) {
  if (!competenceDescModal || !competenceDescContent) return;
  competenceDescContent.textContent = description;
  competenceDescModal.classList.add('active');
}

/**
 * Masque la description d'une compétence
 */
export function hideCompetenceDescription() {
  if (competenceDescModal) {
    competenceDescModal.classList.remove('active');
  }
}

// ============================================================================
// FONCTIONS DE CALCUL DE POINTS DISPONIBLES
// ============================================================================

/**
 * Calcule le stock de points disponibles pour un groupe d'attributs
 * Stock = valeur du groupe - somme des valeurs des attributs enfants
 * @param {Object} group - Groupe d'attributs
 * @returns {number} - Points disponibles
 */
export function calculateAvailablePointsForGroup(group) {
  const groupValue = group.value || 0;
  let sum = 0;
  (group.attributes || []).forEach(attr => {
    sum += (attr.value || 0);
  });
  return groupValue - sum;
}

/**
 * Calcule le stock de points disponibles pour un groupe en tenant compte des modifications
 * @param {Object} group - Groupe d'attributs
 * @returns {number} - Points disponibles
 */
export function calculateAvailablePointsForGroupWithModifications(group) {
  const groupValue = group.value || 0;
  let sum = 0;
  (group.attributes || []).forEach(attr => {
    const attrId = attr.id;
    // Utiliser la valeur modifiée si elle existe, sinon la valeur de base
    const currentValue = attributeModifications[attrId] !== undefined 
      ? attributeModifications[attrId] 
      : (attr.value || 0);
    sum += currentValue;
  });
  return groupValue - sum;
}

/**
 * Calcule le stock de points disponibles pour les groupes de compétences
 * @param {Object} parentAttribute - Attribut parent
 * @returns {number} - Points disponibles
 */
export function calculateAvailablePointsForSkillGroups(parentAttribute) {
  const attributeValue = parentAttribute.value || 0;
  let sum = 0;
  (parentAttribute.skillGroups || []).forEach(sg => {
    const sgId = sg.id;
    const currentModification = skillGroupModifications[sgId];
    sum += currentModification !== undefined ? currentModification : (sg.value || 0);
  });
  return attributeValue - sum;
}

/**
 * Calcule le stock de points disponibles pour les compétences
 * @param {Object} parentSkillGroup - Groupe de compétences parent
 * @returns {number} - Points disponibles
 */
export function calculateAvailablePointsForSkills(parentSkillGroup) {
  const skillGroupValue = parentSkillGroup.value || 0;
  let sum = 0;
  (parentSkillGroup.skills || []).forEach(skill => {
    const skillId = skill.id;
    const currentModification = skillModifications[skillId];
    sum += currentModification !== undefined ? currentModification : (skill.value || 0);
  });
  return skillGroupValue - sum;
}

// ============================================================================
// FONCTIONS DE GESTION DES MODIFICATIONS
// ============================================================================

/**
 * Met à jour l'état du bouton Valider
 */
export function updateSaveButtonState() {
  if (!saveCompetencesBtn) return;
  
  // Activer le bouton s'il y a des modifications (niveau 2, 3 ou 4)
  const hasAttributeModifications = attributeModifications && Object.keys(attributeModifications).length > 0;
  const hasSkillGroupModifications = skillGroupModifications && Object.keys(skillGroupModifications).length > 0;
  const hasSkillModifications = skillModifications && Object.keys(skillModifications).length > 0;
  const hasModifications = hasAttributeModifications || hasSkillGroupModifications || hasSkillModifications;
  saveCompetencesBtn.disabled = !hasModifications;
}

/**
 * Met à jour l'état du bouton de sauvegarde des compétences
 * @param {boolean} hasModifications - Si des modifications existent
 * @deprecated Utiliser updateSaveButtonState() à la place
 */
export function updateSaveCompetencesButtonState(hasModifications) {
  if (!saveCompetencesBtn) return;
  saveCompetencesBtn.disabled = !hasModifications;
}

/**
 * Met à jour la valeur d'un attribut et recalcule le stock
 * @param {number} attributeId - ID de l'attribut
 * @param {number} change - Changement (-1 ou +1)
 * @param {Object} group - Groupe parent
 * @returns {boolean} - Si la modification a été appliquée
 */
export function handleAttributeValueChange(attributeId, change, group) {
  // Trouver l'attribut dans le groupe
  const attribute = group.attributes.find(a => a.id === attributeId);
  if (!attribute) return false;
  
  // Calculer la nouvelle valeur à partir de la valeur ACTUELLE (base + modifications)
  const currentValue = attributeModifications[attributeId] !== undefined
    ? attributeModifications[attributeId]
    : (attribute.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const groupValue = group.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur
  let totalSum = 0;
  group.attributes.forEach(attr => {
    const attrId = attr.id;
    const currentModification = attributeModifications[attrId];
    const currentValue = currentModification !== undefined ? currentModification : (attr.value || 0);
    
    if (attrId === attributeId) {
      totalSum += newValue;
    } else {
      totalSum += currentValue;
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur du groupe
  if (totalSum > groupValue) {
    return false;
  }
  
  // Stocker la modification
  attributeModifications[attributeId] = newValue;
  
  // Recalculer le stock disponible
  currentAvailablePoints = calculateAvailablePointsForGroupWithModifications(group);
  
  // Mettre à jour l'état du bouton Valider
  updateSaveButtonState();
  
  return true;
}

/**
 * Met à jour la valeur d'un groupe de compétences et recalcule le stock
 * @param {number} skillGroupId - ID du groupe de compétences
 * @param {number} change - Changement (-1 ou +1)
 * @param {Object} parentAttribute - Attribut parent
 * @param {number} attributeId - ID de l'attribut parent
 * @returns {boolean} - Si la modification a été appliquée
 */
export function handleSkillGroupValueChange(skillGroupId, change, parentAttribute, attributeId) {
  // Trouver le groupe de compétences dans l'attribut parent
  const skillGroup = parentAttribute.skillGroups.find(sg => sg.id === skillGroupId);
  if (!skillGroup) return false;
  
  // Calculer la nouvelle valeur
  const currentValue = skillGroupModifications[skillGroupId] !== undefined
    ? skillGroupModifications[skillGroupId]
    : (skillGroup.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const attributeValue = parentAttribute.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur
  let totalSum = 0;
  parentAttribute.skillGroups.forEach(sg => {
    const sgId = sg.id;
    const currentModification = skillGroupModifications[sgId];
    const currentSgValue = currentModification !== undefined ? currentModification : (sg.value || 0);
    
    if (sgId === skillGroupId) {
      totalSum += newValue;
    } else {
      totalSum += currentSgValue;
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur de l'attribut parent
  if (totalSum > attributeValue) {
    return false;
  }
  
  // Stocker la modification
  skillGroupModifications[skillGroupId] = newValue;
  
  // Recalculer le stock disponible
  currentSkillGroupAvailablePoints = calculateAvailablePointsForSkillGroups(parentAttribute);
  
  // Mettre à jour l'affichage du stock
  const reserveCountElement = document.getElementById('skillGroupReserveCount');
  if (reserveCountElement) {
    reserveCountElement.textContent = currentSkillGroupAvailablePoints;
  }
  
  // Mettre à jour l'état du bouton Valider
  updateSaveButtonState();
  
  return true;
}

/**
 * Met à jour la valeur d'une compétence et recalcule le stock
 * @param {number} skillId - ID de la compétence
 * @param {number} change - Changement (-1 ou +1)
 * @param {Object} parentSkillGroup - Groupe de compétences parent
 * @param {number} skillGroupId - ID du groupe de compétences parent
 * @returns {boolean} - Si la modification a été appliquée
 */
export function handleSkillValueChange(skillId, change, parentSkillGroup, skillGroupId) {
  // Trouver la compétence dans le groupe de compétences parent
  const skill = parentSkillGroup.skills.find(s => s.id === skillId);
  if (!skill) return false;
  
  // Calculer la nouvelle valeur
  const currentValue = skillModifications[skillId] !== undefined
    ? skillModifications[skillId]
    : (skill.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const skillGroupValue = parentSkillGroup.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur
  let totalSum = 0;
  parentSkillGroup.skills.forEach(s => {
    const sId = s.id;
    const currentModification = skillModifications[sId];
    const currentSValue = currentModification !== undefined ? currentModification : (s.value || 0);
    
    if (sId === skillId) {
      totalSum += newValue;
    } else {
      totalSum += currentSValue;
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur du groupe de compétences parent
  if (totalSum > skillGroupValue) {
    return false;
  }
  
  // Stocker la modification
  skillModifications[skillId] = newValue;
  
  // Recalculer le stock disponible
  currentSkillAvailablePoints = calculateAvailablePointsForSkills(parentSkillGroup);
  
  // Mettre à jour l'affichage du stock
  const reserveCountElement = document.getElementById('skillReserveCount');
  if (reserveCountElement) {
    reserveCountElement.textContent = currentSkillAvailablePoints;
  }
  
  // Mettre à jour l'état du bouton Valider
  updateSaveButtonState();
  
  return true;
}

// ============================================================================
// FONCTIONS DE SAUVEGARDE
// ============================================================================

/**
 * Sauvegarde les modifications des attributs pour un groupe
 * @param {number} groupId - ID du groupe
 * @returns {Promise<void>}
 */
export async function saveAttributeValuesForGroup(groupId) {
  if (!currentAgent?.id || !attributeModifications || Object.keys(attributeModifications).length === 0) {
    showToast('Aucune modification à sauvegarder.');
    return;
  }
  
  try {
    // Sauvegarder chaque attribut modifié
    for (const [attributeId, value] of Object.entries(attributeModifications)) {
      const response = await fetch('/api/skills/attribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          attributeId: Number(attributeId),
          value: Number(value)
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }
    }
    
    showToast('Modifications sauvegardées avec succès!');
    
    // Réinitialiser les modifications et les valeurs de base
    attributeModifications = {};
    attributeBaseValues = {};
    
    // Mettre à jour l'état du bouton
    updateSaveButtonState();
    
    // Recharger les données pour s'assurer que tout est synchronisé
    await loadCompetencesData();
    
    // Forcer la réinitialisation des valeurs de base
    const previousGroup = currentAttributeGroup;
    currentAttributeGroup = null;
    
    renderCompetencesLevel(1, groupId, []);
    
    // Restaurer currentAttributeGroup après le render
    currentAttributeGroup = previousGroup;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showToast('Erreur lors de la sauvegarde: ' + (error.message || 'Inconnu'));
  }
}

/**
 * Sauvegarde les modifications des groupes de compétences pour un attribut
 * @param {number} attributeId - ID de l'attribut
 * @returns {Promise<void>}
 */
export async function saveSkillGroupValuesForAttribute(attributeId) {
  if (!currentAgent?.id || !skillGroupModifications || Object.keys(skillGroupModifications).length === 0) {
    showToast('Aucune modification à sauvegarder.');
    return;
  }
  
  try {
    // Sauvegarder chaque groupe de compétences modifié
    for (const [skillGroupId, value] of Object.entries(skillGroupModifications)) {
      const response = await fetch('/api/skills/skill-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          groupId: Number(skillGroupId),
          value: Number(value)
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }
    }
    
    showToast('Modifications sauvegardées avec succès!');
    
    // Réinitialiser les modifications et les valeurs de base
    skillGroupModifications = {};
    skillGroupBaseValues = {};
    
    // Mettre à jour l'état du bouton
    updateSaveButtonState();
    
    // Recharger les données
    await loadCompetencesData();
    
    // Forcer la réinitialisation
    const previousGroup = currentAttributeGroup;
    currentAttributeGroup = null;
    
    // Trouver le groupe parent et l'attribut pour réafficher correctement
    const parentGroupId = Object.keys(competencesState).find(key => 
      competencesState[key].attributes?.some(attr => attr.id === attributeId)
    );
    if (parentGroupId) {
      renderCompetencesLevel(2, attributeId, [Number(parentGroupId)]);
    } else {
      renderCompetencesLevel(2, attributeId, []);
    }
    
    // Restaurer currentAttributeGroup
    currentAttributeGroup = previousGroup;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showToast('Erreur lors de la sauvegarde: ' + (error.message || 'Inconnu'));
  }
}

/**
 * Sauvegarde les modifications des compétences pour un groupe de compétences
 * @param {number} skillGroupId - ID du groupe de compétences
 * @returns {Promise<void>}
 */
export async function saveSkillValuesForGroup(skillGroupId) {
  if (!currentAgent?.id || !skillModifications || Object.keys(skillModifications).length === 0) {
    showToast('Aucune modification à sauvegarder.');
    return;
  }
  
  try {
    // Sauvegarder chaque compétence modifiée
    for (const [skillId, value] of Object.entries(skillModifications)) {
      const response = await fetch('/api/skills/skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          skillId: Number(skillId),
          value: Number(value)
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }
    }
    
    showToast('Modifications sauvegardées avec succès!');
    
    // Réinitialiser les modifications et les valeurs de base
    skillModifications = {};
    skillBaseValues = {};
    
    // Mettre à jour l'état du bouton
    updateSaveButtonState();
    
    // Recharger les données
    await loadCompetencesData();
    
    // Forcer la réinitialisation des valeurs de base
    const previousGroup = currentAttributeGroup;
    currentAttributeGroup = null;
    
    // Trouver le chemin complet pour réafficher correctement
    let parentGroupId = null;
    let parentAttributeId = null;
    for (const group of competencesHierarchy) {
      for (const attr of group.attributes || []) {
        if (attr.skillGroups?.some(sg => sg.id === skillGroupId)) {
          parentGroupId = group.id;
          parentAttributeId = attr.id;
          break;
        }
      }
      if (parentGroupId) break;
    }
    
    if (parentGroupId && parentAttributeId) {
      renderCompetencesLevel(3, skillGroupId, [Number(parentGroupId), Number(parentAttributeId)]);
    } else {
      renderCompetencesLevel(3, skillGroupId, []);
    }
    
    // Restaurer currentAttributeGroup
    currentAttributeGroup = previousGroup;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showToast('Erreur lors de la sauvegarde: ' + (error.message || 'Inconnu'));
  }
}

/**
 * Sauvegarde toutes les compétences (niveau 0 - groupes principaux)
 * @returns {Promise<void>}
 */
export async function saveCompetencesAllocation() {
  if (!currentAgent?.id) return;
  
  try {
    // Sauvegarder tous les niveaux de la hiérarchie
    for (const group of competencesHierarchy) {
      await fetch('/api/skills/attribute-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          groupId: group.id,
          value: group.value || 0
        })
      });
      
      for (const attribute of group.attributes || []) {
        // Utiliser la valeur modifiée si elle existe, sinon la valeur d'origine
        const modifiedValue = attributeModifications[attribute.id] !== undefined 
          ? attributeModifications[attribute.id] 
          : (attribute.value || 0);
        
        await fetch('/api/skills/attribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: currentAgent.id,
            attributeId: attribute.id,
            value: modifiedValue
          })
        });
        
        for (const skillGroup of attribute.skillGroups || []) {
          await fetch('/api/skills/skill-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId: currentAgent.id,
              groupId: skillGroup.id,
              value: skillGroup.value || 0
            })
          });
          
          for (const skill of skillGroup.skills || []) {
            await fetch('/api/skills/skill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agentId: currentAgent.id,
                skillId: skill.id,
                value: skill.value || 0
              })
            });
          }
        }
      }
    }
  } catch (error) {
      console.error('Error saving competences:', error);
      showToast('Erreur lors de la sauvegarde des compétences.');
      return;
    }
  
  showToast('Compétences mises à jour.');
  
  // Re-rendre l'agent (sera fait par le caller)
}

// ============================================================================
// FONCTIONS DE RENDU
// ============================================================================

/**
 * Ouvre l'écran des compétences détaillées
 * @returns {Promise<void>}
 */
export async function openCompetencesScreen() {
  if (!currentAgent) {
    showToast('Aucun agent sélectionné.');
    return;
  }
  
  // Charger les données des compétences
  try {
    await loadCompetencesData();
    
    if (!competencesHierarchy || !competencesHierarchy.length) {
      showToast('Aucune compétence trouvée pour cet agent.');
      return;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des compétences:', error);
    showToast('Impossible de charger les compétences. Vérifiez votre connexion.');
    return;
  }
  
  // Masquer les autres vues
  if (dashboardView) dashboardView.classList.add('hidden');
  if (inventoryView) inventoryView.classList.add('hidden');
  if (skillsView) skillsView?.classList.add('hidden');
  if (attributesView) attributesView?.classList.add('hidden');
  if (competencesView) competencesView?.classList.remove('hidden');
  if (talentsView) talentsView?.classList.add('hidden');
  if (messagesView) messagesView?.classList.add('hidden');
  
  if (heroMission) heroMission.textContent = 'Compétences';
  
  const logoutBtnEl = document.getElementById('logoutBtn');
  const homeBtnEl = document.getElementById('homeBtn');
  if (logoutBtnEl) logoutBtnEl.classList.remove('hidden');
  if (homeBtnEl) homeBtnEl.classList.remove('hidden');
  
  // Rendre le contenu des compétences (niveau 0)
  renderCompetencesScreen({ groups: competencesHierarchy });
}

/**
 * Rendu des compétences (niveau 0 - liste des groupes principaux)
 * @param {Object} data - Données pour le rendu
 */
export function renderCompetencesScreen(data) {
  if (!competencesContainer) return;
  
  const { groups = [] } = data || {};
  
  competencesContainer.innerHTML = '';
  
  groups.forEach(group => {
    const { name = 'Inconnu', value = 0, description = '' } = group;
    const groupKey = group.id !== undefined ? group.id : name;
    const attrDiv = document.createElement('div');
    attrDiv.className = 'competence-level';
    attrDiv.dataset.level = '1';
    attrDiv.dataset.key = groupKey;
    
    attrDiv.innerHTML = `
      <div class="competence-header">
        <span class="competence-name">${sanitizeText(name)}</span>
        <span class="competence-value">Niveau: ${value}</span>
        ${description ? '<button class="info-icon" title="Info">?</button>' : ''}
      </div>
    `;
    
    const infoBtn = attrDiv.querySelector('.info-icon');
    if (infoBtn) {
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCompetenceDescription(description);
      });
    }
    
    attrDiv.addEventListener('click', () => {
      renderCompetencesLevel(1, groupKey);
    });
    
    competencesContainer.appendChild(attrDiv);
  });
  
  // Masquer le bouton Valider au niveau 0
  if (saveCompetencesBtn) {
    saveCompetencesBtn.style.display = 'none';
  }
}

/**
 * Rendu d'un niveau spécifique de compétences
 * @param {number} level - Niveau à rendre (1-4)
 * @param {number|string} key - Clé de l'entité à rendre
 * @param {Array<number>} parentKeys - Clés des parents
 */
export function renderCompetencesLevel(level, key, parentKeys = []) {
  const path = [...parentKeys, key];
  let current = competencesState;
  for (const k of path) {
    current = current[k];
  }
  
  if (!current) {
    competencesContainer.innerHTML = '<div class="competence-empty">Données introuvables. Rechargez la page.</div>';
    return;
  }
  
  competencesContainer.innerHTML = '';
  
  // Add back button if not at root level
  if (level > 0) {
    const backDiv = document.createElement('div');
    backDiv.className = 'competence-back';
    backDiv.innerHTML = '<button type="button" class="btn btn-tertiary">← Retour</button>';
    backDiv.addEventListener('click', () => {
      if (level === 1) {
        // Back to root (list of main groups)
        renderCompetencesScreen({ groups: competencesHierarchy });
      } else {
        const backLevel = level - 1;
        const backPath = path.slice(0, backLevel);
        renderCompetencesLevel(backLevel, backPath[backLevel - 1], backPath.slice(0, backLevel - 1));
      }
    });
    competencesContainer.appendChild(backDiv);
  }
  
  if (level === 1) {
    // Niveau des attributs avec stock de points disponibles
    const groupKey = path[0];
    const group = competencesHierarchy.find(g => g.id == groupKey);
    
    if (!group) {
      console.warn('Group not found for groupKey:', groupKey);
      competencesContainer.innerHTML = '<div class="competence-empty">Groupe introuvable. Rechargez la page.</div>';
      return;
    }
    
    // Initialiser l'état pour ce groupe
    currentAttributeGroup = groupKey;
    currentAttributeGroupValue = group.value || 0;
    
    // Stocker les valeurs de base et réinitialiser les modifications
    if (Object.keys(attributeBaseValues).length === 0 || currentAttributeGroup !== groupKey) {
      attributeBaseValues = {};
      attributeModifications = {};
      (group.attributes || []).forEach(attr => {
        attributeBaseValues[attr.id] = attr.value || 0;
      });
    }
    
    // Recalculer le stock disponible
    currentAvailablePoints = calculateAvailablePointsForGroupWithModifications(group);
    
    // Afficher le stock de points disponibles
    const reserveDiv = document.createElement('div');
    reserveDiv.className = 'reserve-box';
    reserveDiv.innerHTML = `Points disponibles: <strong id="attributeReserveCount">${currentAvailablePoints}</strong>`;
    competencesContainer.appendChild(reserveDiv);
    
    // Ajouter un conteneur pour les attributs
    const attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    
    // Afficher chaque attribut avec boutons +/- et valeur
    (group.attributes || []).forEach((subAttr, index) => {
      const subAttrValue = attributeModifications[subAttr.id] !== undefined 
        ? attributeModifications[subAttr.id] 
        : (subAttr.value || 0);
      
      const subAttrDiv = document.createElement('div');
      subAttrDiv.className = 'competence-level';
      subAttrDiv.dataset.level = '2';
      subAttrDiv.dataset.key = subAttr.id;
      
      // Calculer les points disponibles pour cet attribut
      const availablePoints = calculateAvailablePointsForSkillGroups(subAttr);
      if (availablePoints > 0) {
        subAttrDiv.classList.add('has-available-points');
      }
      
      // Règles pour les boutons
      const baseValue = attributeBaseValues[subAttr.id] || 0;
      const showIncrease = currentAvailablePoints > 0;
      const showDecrease = subAttrValue > baseValue;
      const showAnyControls = showIncrease || showDecrease;
      
      subAttrDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${subAttr.name}</span>
          <span class="competence-value">Niveau: ${subAttrValue}</span>
          ${subAttr.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
        ${showAnyControls ? `
        <div class="competence-controls">
          ${showDecrease ? '<button type="button" class="icon-btn" data-action="decrease" data-attribute-id="' + subAttr.id + '">-</button>' : ''}
          <span>${subAttrValue}</span>
          ${showIncrease ? '<button type="button" class="icon-btn" data-action="increase" data-attribute-id="' + subAttr.id + '">+</button>' : ''}
        </div>
        ` : ''}
      `;
      
      const infoBtn = subAttrDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(subAttr.description);
        });
      }
      
      // Gérer les clics sur les boutons +/- pour les attributs
      const decreaseBtn = subAttrDiv.querySelector('[data-action="decrease"]');
      const increaseBtn = subAttrDiv.querySelector('[data-action="increase"]');
      
      if (decreaseBtn) {
        const currentSubAttr = subAttr;
        const currentGroup = group;
        decreaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleAttributeValueChange(currentSubAttr.id, -1, currentGroup);
          renderCompetencesLevel(1, key, parentKeys);
        });
      }
      
      if (increaseBtn) {
        const currentSubAttr = subAttr;
        const currentGroup = group;
        increaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleAttributeValueChange(currentSubAttr.id, 1, currentGroup);
          renderCompetencesLevel(1, key, parentKeys);
        });
      }
      
      // Navigation vers le niveau 2 (groupes de compétences) en cliquant sur l'attribut
      subAttrDiv.addEventListener('click', (e) => {
        if (!e.target.dataset.action && !e.target.classList.contains('info-icon')) {
          renderCompetencesLevel(2, subAttr.id, path);
        }
      });
      
      attributesContainer.appendChild(subAttrDiv);
    });
    
    competencesContainer.appendChild(attributesContainer);
    
    // Configurer le bouton Valider
    if (saveCompetencesBtn) {
      saveCompetencesBtn.style.display = 'block';
      saveCompetencesBtn.onclick = () => saveAttributeValuesForGroup(groupKey);
      updateSaveButtonState();
    }
    
  } else if (level === 2) {
    // Niveau des groupes de compétences pour un attribut
    const groupKey = path[0];
    const attributeKey = path[1];
    
    const parentGroup = competencesHierarchy.find(g => g.id == groupKey);
    if (!parentGroup) {
      console.warn('Groupe parent introuvable pour attributeId:', attributeKey);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentAttribute = parentGroup.attributes.find(attr => attr.id == attributeKey);
    if (!parentAttribute) {
      console.warn('Attribut parent introuvable pour attributeId:', attributeId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    // Initialiser l'état pour cet attribut
    const attributeValue = parentAttribute.value || 0;
    
    if (Object.keys(skillGroupBaseValues).length === 0 || currentAttributeGroup !== attributeKey) {
      skillGroupBaseValues = {};
      skillGroupModifications = {};
      (parentAttribute.skillGroups || []).forEach(sg => {
        skillGroupBaseValues[sg.id] = sg.value || 0;
      });
    }
    
    currentAttributeGroup = attributeKey;
    currentSkillGroupAvailablePoints = calculateAvailablePointsForSkillGroups(parentAttribute);
    
    // Afficher le stock de points disponibles
    const reserveDiv = document.createElement('div');
    reserveDiv.className = 'reserve-box';
    reserveDiv.innerHTML = `Points disponibles: <strong id="skillGroupReserveCount">${currentSkillGroupAvailablePoints}</strong>`;
    competencesContainer.appendChild(reserveDiv);
    
    // Ajouter un conteneur pour les groupes de compétences
    const skillGroupsContainer = document.createElement('div');
    skillGroupsContainer.className = 'skill-groups-container';
    
    // Afficher chaque groupe de compétences
    (parentAttribute.skillGroups || []).forEach((sg, index) => {
      const sgValue = skillGroupModifications[sg.id] !== undefined 
        ? skillGroupModifications[sg.id] 
        : (sg.value || 0);
      
      const sgDiv = document.createElement('div');
      sgDiv.className = 'competence-level';
      sgDiv.dataset.level = '3';
      sgDiv.dataset.key = sg.id;
      
      // Calculer les points disponibles pour ce groupe
      const availablePoints = calculateAvailablePointsForSkills(sg);
      if (availablePoints > 0) {
        sgDiv.classList.add('has-available-points');
      }
      
      // Règles pour les boutons
      const baseSgValue = skillGroupBaseValues[sg.id] || 0;
      const showIncrease = currentSkillGroupAvailablePoints > 0;
      const showDecrease = sgValue > baseSgValue;
      const showAnyControls = showIncrease || showDecrease;
      
      sgDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${sg.name}</span>
          <span class="competence-value">Niveau: ${sgValue}</span>
          ${sg.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
        ${showAnyControls ? `
        <div class="competence-controls">
          ${showDecrease ? '<button type="button" class="icon-btn" data-action="decrease" data-skill-group-id="' + sg.id + '">-</button>' : ''}
          <span>${sgValue}</span>
          ${showIncrease ? '<button type="button" class="icon-btn" data-action="increase" data-skill-group-id="' + sg.id + '">+</button>' : ''}
        </div>
        ` : ''}
      `;
      
      const infoBtn = sgDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(sg.description);
        });
      }
      
      // Gérer les clics sur les boutons +/- pour les groupes de compétences
      const decreaseBtn = sgDiv.querySelector('[data-action="decrease"]');
      const increaseBtn = sgDiv.querySelector('[data-action="increase"]');
      
      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillGroupValueChange(sg.id, -1, parentAttribute, attributeKey);
          renderCompetencesLevel(2, attributeKey, [groupKey]);
        });
      }
      
      if (increaseBtn) {
        increaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillGroupValueChange(sg.id, 1, parentAttribute, attributeKey);
          renderCompetencesLevel(2, attributeKey, [groupKey]);
        });
      }
      
      // Navigation vers le niveau 3 (compétences)
      sgDiv.addEventListener('click', (e) => {
        if (!e.target.dataset.action && !e.target.classList.contains('info-icon')) {
          renderCompetencesLevel(3, sg.id, path);
        }
      });
      
      skillGroupsContainer.appendChild(sgDiv);
    });
    
    competencesContainer.appendChild(skillGroupsContainer);
    
    // Configurer le bouton Valider pour ce niveau
    if (saveCompetencesBtn) {
      saveCompetencesBtn.style.display = 'block';
      saveCompetencesBtn.onclick = () => saveSkillGroupValuesForAttribute(attributeKey);
      updateSaveButtonState();
    }
    
  } else if (level === 3) {
    // Niveau des compétences pour un groupe de compétences
    const groupKey = path[0];
    const attributeKey = path[1];
    const skillGroupKey = path[2];
    
    const parentGroup = competencesHierarchy.find(g => g.id == groupKey);
    if (!parentGroup) {
      console.warn('Groupe parent introuvable pour skillGroupId:', skillGroupKey);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentAttribute = parentGroup.attributes.find(attr => attr.id == attributeKey);
    if (!parentAttribute) {
      console.warn('Attribut parent introuvable pour attributeId:', attributeKey);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentSkillGroup = parentAttribute.skillGroups.find(sg => sg.id == skillGroupKey);
    if (!parentSkillGroup) {
      console.warn('Groupe de compétences parent introuvable pour skillGroupId:', skillGroupKey);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    // Initialiser l'état pour ce groupe de compétences
    const skillGroupValue = parentSkillGroup.value || 0;
    
    if (Object.keys(skillBaseValues).length === 0 || currentAttributeGroup !== skillGroupKey) {
      skillBaseValues = {};
      skillModifications = {};
      (parentSkillGroup.skills || []).forEach(skill => {
        skillBaseValues[skill.id] = skill.value || 0;
      });
    }
    
    currentAttributeGroup = skillGroupKey;
    currentSkillAvailablePoints = calculateAvailablePointsForSkills(parentSkillGroup);
    
    // Afficher le stock de points disponibles
    const reserveDiv = document.createElement('div');
    reserveDiv.className = 'reserve-box';
    reserveDiv.innerHTML = `Points disponibles: <strong id="skillReserveCount">${currentSkillAvailablePoints}</strong>`;
    competencesContainer.appendChild(reserveDiv);
    
    // Ajouter un conteneur pour les compétences
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skills-container';
    
    // Afficher chaque compétence
    (parentSkillGroup.skills || []).forEach((skill, index) => {
      const skillValue = skillModifications[skill.id] !== undefined 
        ? skillModifications[skill.id] 
        : (skill.value || 0);
      
      const skillDiv = document.createElement('div');
      skillDiv.className = 'competence-level';
      skillDiv.dataset.level = '4';
      skillDiv.dataset.key = skill.id;
      
      // Règles pour les boutons
      const baseSkillValue = skillBaseValues[skill.id] || 0;
      const showIncrease = currentSkillAvailablePoints > 0;
      const showDecrease = skillValue > baseSkillValue;
      const showAnyControls = showIncrease || showDecrease;
      
      skillDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${skill.name}</span>
          <span class="competence-value">Niveau: ${skillValue}</span>
          ${skill.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
        ${showAnyControls ? `
        <div class="competence-controls">
          ${showDecrease ? '<button type="button" class="icon-btn" data-action="decrease" data-skill-id="' + skill.id + '">-</button>' : ''}
          <span>${skillValue}</span>
          ${showIncrease ? '<button type="button" class="icon-btn" data-action="increase" data-skill-id="' + skill.id + '">+</button>' : ''}
        </div>
        ` : ''}
      `;
      
      const infoBtn = skillDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(skill.description);
        });
      }
      
      // Gérer les clics sur les boutons +/- pour les compétences
      const decreaseBtn = skillDiv.querySelector('[data-action="decrease"]');
      const increaseBtn = skillDiv.querySelector('[data-action="increase"]');
      
      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillValueChange(skill.id, -1, parentSkillGroup, skillGroupKey);
          renderCompetencesLevel(3, skillGroupKey, [groupKey, attributeKey]);
        });
      }
      
      if (increaseBtn) {
        increaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillValueChange(skill.id, 1, parentSkillGroup, skillGroupKey);
          renderCompetencesLevel(3, skillGroupKey, [groupKey, attributeKey]);
        });
      }
      
      skillsContainer.appendChild(skillDiv);
    });
    
    competencesContainer.appendChild(skillsContainer);
    
    // Configurer le bouton Valider pour ce niveau
    if (saveCompetencesBtn) {
      saveCompetencesBtn.style.display = 'block';
      saveCompetencesBtn.onclick = () => saveSkillValuesForGroup(skillGroupKey);
      updateSaveButtonState();
    }
    
  }
}

// ============================================================================
// FIN DU MODULE
// ============================================================================

// Toutes les fonctions sont exportées directement avec 'export function' ou 'export async function'
