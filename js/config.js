/**
 * Configuration globale de l'application
 * Contient toutes les constantes et configurations statiques
 */

// 🎨 Icons pour les effets
export const EFFECT_ICONS = {
  blessure: '🩸',
  brulure: '🔥',
  brûlure: '🔥',
  froid: '❄️',
  brouillard: '🌫️',
  hypothermie: '🧊',
  inflammation: '🔥',
  empoisonnement: '☠️',
  etourdissement: '💫',
  saignement: '🩸',
  fatigue: '😴',
  panique: '😰',
  gel: '❄️',
};

// 🗃️ Clés de stockage local
export const STORAGE_KEY = 'divisionAdventureAgents';
export const SESSION_KEY = 'divisionAdventureSession';

// 🌐 Chemins API
export const API_AGENTS_PATH = '/api/agents';
export const API_MESSAGES_PATH = '/api/messages';
export const API_TALENTS_PATH = '/api/talents';
export const API_SKILLS_PATH = '/api/skills';

// 📦 Chemins des données statiques
export const WEAPONS_DATA_PATH = '/json/Equipement/armes.json';
export const MEDICAL_DATA_PATH = '/json/Equipement/medical.json';
export const EQUIPMENT_DATA_PATH = '/json/Equipement/equipement.json';

// 🎭 Noms des sections/vues
export const SECTIONS = {
  LANDING: 'landing',
  CREATE_AGENT: 'createAgent',
  MAIN_PAGE: 'mainPage',
  COMPETENCES: 'competences',
};

// 📝 Libellés des étapes du wizard
export const WIZARD_STEP_LABELS = [
  'Informations civiles',
  'Couverture avant activation',
  'Caractéristiques',
  'Attributs',
  'Talents',
  'Background',
  'Validation',
];

// 🎯 Valeurs par défaut pour un nouvel agent
export const DEFAULT_ATTRIBUTE_VALUES = {
  speed: 1,
  resilience: 1,
  vigor: 1,
  conscience: 1,
  dexterity: 1,
  technique: 1,
};

export const DEFAULT_RESERVE_VALUES = {
  stats: 2,
  attrs: 1,
};
