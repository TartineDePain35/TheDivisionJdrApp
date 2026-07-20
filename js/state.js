/**
 * Module State - Couche de compatibilité avec le Store centralisé
 * Ce module délègue maintenant toutes les opérations au Store (store.js)
 * Il est maintenu pour la compatibilité ascendante avec les modules existants.
 * 
 * NOUVEAU : Utilise le Store centralisé (store.js) comme unique source de vérité.
 */

// ============================================================================
// IMPORTS - Store Centralisé
// ============================================================================
import {
  // Agent
  currentAgent as storeCurrentAgent,
  currentAgentMessages as storeCurrentAgentMessages,
  expandedMessageIds as storeExpandedMessageIds,
  
  // Données de référence
  weaponsData as storeWeaponsData,
  medicalData as storeMedicalData,
  equipmentData as storeEquipmentData,
  effectsData as storeEffectsData,
  talents as storeDataTalents,
  
  // Compétences
  competencesHierarchy as storeCompetencesHierarchy,
  competencesState as storeCompetencesState,
  baseStats as storeBaseStats,
  baseAttributes as storeBaseAttributes,
  skillsState as storeSkillsState,
  attributesState as storeAttributesState,
  
  // Modifications - Vue simple
  attributesViewModifications as storeAttributesViewModifications,
  attributesViewInitialValues as storeAttributesViewInitialValues,
  
  // Redistribution - Niveau 1
  currentAttributeGroup as storeCurrentAttributeGroup,
  currentAttributeGroupValue as storeCurrentAttributeGroupValue,
  attributeModifications as storeAttributeModifications,
  attributeBaseValues as storeAttributeBaseValues,
  currentAvailablePoints as storeCurrentAvailablePoints,
  
  // Groupes de compétences - Niveau 3
  skillGroupModifications as storeSkillGroupModifications,
  skillGroupBaseValues as storeSkillGroupBaseValues,
  currentSkillGroupAvailablePoints as storeCurrentSkillGroupAvailablePoints,
  
  // Compétences - Niveau 4
  skillModifications as storeSkillModifications,
  skillBaseValues as storeSkillBaseValues,
  currentSkillAvailablePoints as storeCurrentSkillAvailablePoints,
  
  // Inventaire
  pendingDeleteIndex as storePendingDeleteIndex,
  
  // Wizard
  currentStep as storeCurrentStep,
  visitedStep as storeVisitedStep,
  talentIndex as storeTalentIndex,
  selectedTalent as storeSelectedTalent,
  talentIdSelected as storeTalentIdSelected,
  attributeValues as storeAttributeValues,
  reserveValues as storeReserveValues,
  // Wizard talents
  wizardTalents as storeWizardTalents,
  
  // Talents (agent actuel)
  selectedAgentTalent as storeSelectedAgentTalent,
  selectedAgentTalentId as storeSelectedAgentTalentId,
  selectedAgentTalentTile as storeSelectedAgentTalentTile,
  
  // UI
  storyCount as storeStoryCount,
  
  // Store complet pour les méthodes
  store,
} from './store.js';

// ============================================================================
// IMPORTS - Configuration (pour la compatibilité des fonctions)
// ============================================================================
import {
  DEFAULT_ATTRIBUTE_VALUES,
  DEFAULT_RESERVE_VALUES,
} from './config.js';

// ============================================================================
// EXPORTS - Variables d'état (réexportées depuis le Store)
// ============================================================================

// Agent
export const currentAgent = storeCurrentAgent;
export const currentAgentMessages = storeCurrentAgentMessages;
export const expandedMessageIds = storeExpandedMessageIds;

// Données de référence
export const weaponsData = storeWeaponsData;
export const medicalData = storeMedicalData;
export const equipmentData = storeEquipmentData;
export const effectsData = storeEffectsData;
export const talents = storeDataTalents;

// Compétences - Hiérarchie
export const competencesHierarchy = storeCompetencesHierarchy;
export const competencesState = storeCompetencesState;

// État des compétences - Base
export const baseStats = storeBaseStats;
export const baseAttributes = storeBaseAttributes;

// État des compétences - Réserves
export const skillsState = storeSkillsState;
export const attributesState = storeAttributesState;

// Modifications - Vue simple
export const attributesViewModifications = storeAttributesViewModifications;
export const attributesViewInitialValues = storeAttributesViewInitialValues;

// Redistribution - Niveau 1
export const currentAttributeGroup = storeCurrentAttributeGroup;
export const currentAttributeGroupValue = storeCurrentAttributeGroupValue;
export const attributeModifications = storeAttributeModifications;
export const attributeBaseValues = storeAttributeBaseValues;
export const currentAvailablePoints = storeCurrentAvailablePoints;

// Groupes de compétences - Niveau 3
export const skillGroupModifications = storeSkillGroupModifications;
export const skillGroupBaseValues = storeSkillGroupBaseValues;
export const currentSkillGroupAvailablePoints = storeCurrentSkillGroupAvailablePoints;

// Compétences - Niveau 4
export const skillModifications = storeSkillModifications;
export const skillBaseValues = storeSkillBaseValues;
export const currentSkillAvailablePoints = storeCurrentSkillAvailablePoints;

// Inventaire
export const pendingDeleteIndex = storePendingDeleteIndex;

// Wizard
export const currentStep = storeCurrentStep;
export const visitedStep = storeVisitedStep;
export const talentIndex = storeTalentIndex;
export const selectedTalent = storeSelectedTalent;
export const talentIdSelected = storeTalentIdSelected;
export const attributeValues = storeAttributeValues;
export const reserveValues = storeReserveValues;
export const wizardTalents = storeWizardTalents;

// Talents (agent actuel)
export const selectedAgentTalent = storeSelectedAgentTalent;
export const selectedAgentTalentId = storeSelectedAgentTalentId;
export const selectedAgentTalentTile = storeSelectedAgentTalentTile;

// UI
export const storyCount = storeStoryCount;

// ============================================================================
// EXPORTS - Fonctions Setter (délégation au Store)
// ============================================================================

// Setters pour les talents (agent actuel)
/**
 * Définit le talent sélectionné pour l'agent
 * @param {Object|null} talent - Talent sélectionné ou null
 */
export function setSelectedAgentTalent(talent) {
  store.setSelectedAgentTalent(talent);
}

/**
 * Définit l'ID du talent sélectionné pour l'agent
 * @param {string|null} id - ID du talent ou null
 */
export function setSelectedAgentTalentId(id) {
  store.setSelectedAgentTalentId(id);
}

/**
 * Définit l'élément DOM de la tuile du talent sélectionné
 * @param {HTMLElement|null} tile - Élément DOM ou null
 */
export function setSelectedAgentTalentTile(tile) {
  store.setSelectedAgentTalentTile(tile);
}

// Setters pour le wizard
/**
 * Définit l'étape courante du wizard
 * @param {number} step - Numéro de l'étape
 */
export function setCurrentStep(step) {
  store.setCurrentStep(step);
}

/**
 * Définit l'étape visitée maximale du wizard
 * @param {number} step - Numéro de l'étape
 */
export function setVisitedStep(step) {
  store.setVisitedStep(step);
}

/**
 * Définit l'index du talent courant dans le wizard
 * @param {number} index - Index du talent
 */
export function setTalentIndex(index) {
  store.setTalentIndex(index);
}

/**
 * Définit le talent sélectionné dans le wizard
 * @param {Object|null} talent - Talent sélectionné
 */
export function setSelectedTalent(talent) {
  store.setSelectedTalent(talent);
}

/**
 * Définit l'ID du talent sélectionné dans le wizard
 * @param {string|null} id - ID du talent
 */
export function setTalentIdSelected(id) {
  store.setTalentIdSelected(id);
}

// ============================================================================
// EXPORTS - Fonctions de réinitialisation (délégation au Store)
// ============================================================================

/**
 * Réinitialise la sélection des talents
 */
export function resetSelectedAgentTalent() {
  store.resetSelectedAgentTalent();
}

/**
 * Réinitialise l'état du wizard de création d'agent
 */
export function resetWizardState() {
  store.resetWizardState();
}

/**
 * Réinitialise l'état global de l'application
 */
export function resetAppState() {
  store.resetAppState();
}

// ============================================================================
// EXPORTS - Store complet (pour les modules qui veulent l'utiliser directement)
// ============================================================================
export { store };

// ============================================================================
// EXPORTS - Fonctions utilitaires du Store
// ============================================================================
export {
  // S'abonner aux changements
  subscribe: store.subscribe,
  unsubscribe: store.unsubscribe,
  // Accès complet à l'état
  getState: store.getState,
  // Setters pour l'agent
  setCurrentAgent: store.setCurrentAgent,
  setCurrentAgentMessages: store.setCurrentAgentMessages,
  setExpandedMessageIds: store.setExpandedMessageIds,
  addAgentMessages: store.addAgentMessages,
  addExpandedMessageId: store.addExpandedMessageId,
  removeExpandedMessageId: store.removeExpandedMessageId,
  updateCurrentAgent: store.updateCurrentAgent,
  // Setters pour les données
  setWeaponsData: store.setWeaponsData,
  setMedicalData: store.setMedicalData,
  setEquipmentData: store.setEquipmentData,
  setEffectsData: store.setEffectsData,
  setTalents: store.setTalents,
  setWizardTalents: store.setWizardTalents,
  // Setters pour les compétences
  setCompetencesHierarchy: store.setCompetencesHierarchy,
  setCompetencesState: store.setCompetencesState,
  setBaseStats: store.setBaseStats,
  setBaseAttributes: store.setBaseAttributes,
  setSkillsState: store.setSkillsState,
  setAttributesState: store.setAttributesState,
  // Setters pour les modifications
  setAttributesViewModifications: store.setAttributesViewModifications,
  setAttributesViewInitialValues: store.setAttributesViewInitialValues,
  // Setters pour la redistribution
  setCurrentAttributeGroup: store.setCurrentAttributeGroup,
  setCurrentAttributeGroupValue: store.setCurrentAttributeGroupValue,
  setAttributeModifications: store.setAttributeModifications,
  setAttributeBaseValues: store.setAttributeBaseValues,
  setCurrentAvailablePoints: store.setCurrentAvailablePoints,
  // Setters pour les groupes de compétences
  setSkillGroupModifications: store.setSkillGroupModifications,
  setSkillGroupBaseValues: store.setSkillGroupBaseValues,
  setCurrentSkillGroupAvailablePoints: store.setCurrentSkillGroupAvailablePoints,
  // Setters pour les compétences niveau 4
  setSkillModifications: store.setSkillModifications,
  setSkillBaseValues: store.setSkillBaseValues,
  setCurrentSkillAvailablePoints: store.setCurrentSkillAvailablePoints,
  // Setters pour l'inventaire
  setPendingDeleteIndex: store.setPendingDeleteIndex,
  // Setters pour le wizard
  setAttributeValues: store.setAttributeValues,
  setReserveValues: store.setReserveValues,
  // Setters pour les talents
  setSelectedAgentTalent: store.setSelectedAgentTalent,
  setSelectedAgentTalentId: store.setSelectedAgentTalentId,
  setSelectedAgentTalentTile: store.setSelectedAgentTalentTile,
  // Setter pour UI
  setStoryCount: store.setStoryCount,
};
