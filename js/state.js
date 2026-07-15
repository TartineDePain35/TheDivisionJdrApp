/**
 * Module State - Gestion centralisée de l'état global de l'application
 * Contient toutes les variables d'état mutables
 */

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import {
  DEFAULT_ATTRIBUTE_VALUES,
  DEFAULT_RESERVE_VALUES,
} from './config.js';

// ============================================================================
// ÉTAT GLOBAL - Variables d'état principales
// ============================================================================

// Données des équipements
let weaponsData = [];
let medicalData = [];
let equipmentData = [];

// Hiérarchie et état des compétences
let competencesHierarchy = [];
let competencesState = {};

// Agent courant et messages
let currentAgent = {};
let currentAgentMessages = [];

// État des messages (quels messages sont dépliés)
let expandedMessageIds = new Set();

// État des compétences (stats et attributs)
let baseStats = {};
let baseAttributes = {};
let skillsState = {
  reserve: 0,
  stats: {
    speed: 1,
    resilience: 1,
    vigor: 1,
  },
};
let attributesState = {
  reserve: 0,
  attributes: {
    conscience: 1,
    dexterity: 1,
    technique: 1,
  },
};

// État pour suivre les modifications dans la vue simple des attributs
let attributesViewModifications = {};
let attributesViewInitialValues = {};

// État pour la redistribution des points au niveau des attributs (niveau 1)
let currentAttributeGroup = null;
let currentAttributeGroupValue = 0;
let attributeModifications = {};
let attributeBaseValues = {};
let currentAvailablePoints = 0;

// Niveau 3 - Groupes de compétences
let skillGroupModifications = {};
let skillGroupBaseValues = {};
let currentSkillGroupAvailablePoints = 0;

// Niveau 4 - Compétences
let skillModifications = {};
let skillBaseValues = {};
let currentSkillAvailablePoints = 0;

// Index de l'item à supprimer
let pendingDeleteIndex = null;

// ============================================================================
// ÉTAT WIZARD - Création d'agent
// ============================================================================

let currentStep = 1;
let visitedStep = 1;
let talents = [];
let talentIndex = 0;
let selectedTalent = null;
let talentIdSelected = null;

// Valeurs des attributs pendant la création
let attributeValues = {
  speed: 1,
  resilience: 1,
  vigor: 1,
  conscience: 1,
  dexterity: 1,
  technique: 1,
};

// Valeurs de réserve pendant la création
let reserveValues = {
  stats: DEFAULT_RESERVE_VALUES.stats,
  attrs: DEFAULT_RESERVE_VALUES.attrs,
};

// ============================================================================
// ÉTAT TALENTS - Sélection des talents pour l'agent actuel
// ============================================================================

let selectedAgentTalent = null;
let selectedAgentTalentId = null;
let selectedAgentTalentTile = null;

// ============================================================================
// COMPTEURS DE STORIES
// ============================================================================

let storyCount = null; // Will be set from DOM

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Données
  weaponsData,
  medicalData,
  equipmentData,
  competencesHierarchy,
  competencesState,
  
  // Agent
  currentAgent,
  currentAgentMessages,
  expandedMessageIds,
  
  // État des compétences
  baseStats,
  baseAttributes,
  skillsState,
  attributesState,
  
  // Modifications des attributs (vue simple)
  attributesViewModifications,
  attributesViewInitialValues,
  
  // Redistribution des points (niveau 1)
  currentAttributeGroup,
  currentAttributeGroupValue,
  attributeModifications,
  attributeBaseValues,
  currentAvailablePoints,
  
  // Groupes de compétences (niveau 3)
  skillGroupModifications,
  skillGroupBaseValues,
  currentSkillGroupAvailablePoints,
  
  // Compétences (niveau 4)
  skillModifications,
  skillBaseValues,
  currentSkillAvailablePoints,
  
  // Inventaire
  pendingDeleteIndex,
  
  // Wizard
  currentStep,
  visitedStep,
  talents,
  talentIndex,
  selectedTalent,
  talentIdSelected,
  attributeValues,
  reserveValues,
  
  // Talents (agent actuel)
  selectedAgentTalent,
  selectedAgentTalentId,
  selectedAgentTalentTile,
  
  // Story count
  storyCount,
};

// ============================================================================
// FONCTIONS DE RÉINITIALISATION
// ============================================================================

/**
 * Réinitialise l'état du wizard de création d'agent
 */
export function resetWizardState() {
  currentStep = 1;
  visitedStep = 1;
  selectedTalent = null;
  talentIdSelected = null;
  talentIndex = 0;
  reserveValues.stats = DEFAULT_RESERVE_VALUES.stats;
  reserveValues.attrs = DEFAULT_RESERVE_VALUES.attrs;
  
  Object.keys(attributeValues).forEach((key) => {
    attributeValues[key] = DEFAULT_ATTRIBUTE_VALUES[key] || 1;
  });
}

/**
 * Réinitialise l'état global de l'application
 */
export function resetAppState() {
  currentAgent = {};
  currentAgentMessages = [];
  expandedMessageIds = new Set();
  weaponsData = [];
  medicalData = [];
  equipmentData = [];
  competencesHierarchy = [];
  competencesState = {};
  pendingDeleteIndex = null;
  
  // Réinitialiser l'état des compétences
  baseStats = {};
  baseAttributes = {};
  skillsState = {
    reserve: 0,
    stats: {
      speed: 1,
      resilience: 1,
      vigor: 1,
    },
  };
  attributesState = {
    reserve: 0,
    attributes: {
      conscience: 1,
      dexterity: 1,
      technique: 1,
    },
  };
  
  attributesViewModifications = {};
  attributesViewInitialValues = {};
  currentAttributeGroup = null;
  currentAttributeGroupValue = 0;
  attributeModifications = {};
  attributeBaseValues = {};
  currentAvailablePoints = 0;
  skillGroupModifications = {};
  skillGroupBaseValues = {};
  currentSkillGroupAvailablePoints = 0;
  skillModifications = {};
  skillBaseValues = {};
  currentSkillAvailablePoints = 0;
  
  resetWizardState();
  
  // Réinitialiser les talents
  selectedAgentTalent = null;
  selectedAgentTalentId = null;
  selectedAgentTalentTile = null;
  talents = [];
}
