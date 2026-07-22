/**
 * Module Data - Chargement des données depuis les fichiers JSON et l'API
 * Contient toutes les fonctions de chargement de données
 */

// ============================================================================
// IMPORTS - Store Centralisé
// ============================================================================
import { store } from './store.js';

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import {
  WEAPONS_DATA_PATH,
  MEDICAL_DATA_PATH,
  EQUIPMENT_DATA_PATH,
} from './config.js';

// ============================================================================
// FONCTION DE BASE POUR LES REQUÊTES API
// ============================================================================

/**
 * Effectue une requête fetch et retourne le JSON
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de la requête
 * @returns {Promise<Object>} - Données JSON
 */
export async function requestJson(url, options) {
  const response = await fetch(url, options);
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = json?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return json;
}

// ============================================================================
// CHARGEMENT DES DONNÉES D'ÉQUIPEMENT
// ============================================================================

/**
 * Charge les données des armes depuis le fichier JSON
 * @returns {Promise<Array>} - Tableau des armes
 */
export async function loadWeaponsData() {
  // Vérifier si les données sont déjà chargées via le Store
  if (store.weaponsData.length) {
    return Promise.resolve(store.weaponsData);
  }
  return requestJson(WEAPONS_DATA_PATH)
    .then((data) => {
      // Utiliser le setter du Store
      const loadedData = Array.isArray(data) ? data : [];
      store.setWeaponsData(loadedData);
      return store.weaponsData;
    })
    .catch(() => {
      store.setWeaponsData([]);
      return store.weaponsData;
    });
}

/**
 * Charge les données médicales depuis le fichier JSON
 * @returns {Promise<Array>} - Tableau des items médicaux
 */
export async function loadMedicalData() {
  // Vérifier si les données sont déjà chargées via le Store
  if (store.medicalData.length) {
    return Promise.resolve(store.medicalData);
  }
  return requestJson(MEDICAL_DATA_PATH)
    .then((data) => {
      // Utiliser le setter du Store
      const loadedData = Array.isArray(data) ? data : [];
      store.setMedicalData(loadedData);
      return store.medicalData;
    })
    .catch(() => {
      store.setMedicalData([]);
      return store.medicalData;
    });
}

/**
 * Charge les données d'équipement depuis le fichier JSON
 * @returns {Promise<Array>} - Tableau des équipements
 */
export async function loadEquipmentData() {
  // Vérifier si les données sont déjà chargées via le Store
  if (store.equipmentData.length) {
    return Promise.resolve(store.equipmentData);
  }
  return requestJson(EQUIPMENT_DATA_PATH)
    .then((data) => {
      // Utiliser le setter du Store
      const loadedData = Array.isArray(data) ? data : [];
      store.setEquipmentData(loadedData);
      return store.equipmentData;
    })
    .catch(() => {
      store.setEquipmentData([]);
      return store.equipmentData;
    });
}

// ============================================================================
// CHARGEMENT DES COMPÉTENCES
// ============================================================================

/**
 * Charge la hiérarchie des compétences pour l'agent courant
 * @returns {Promise<Object>} - Hiérarchie des compétences
 */
export async function loadCompetencesData() {
  // Utiliser currentAgent depuis le Store
  const agent = store.currentAgent;
  
  if (!agent?.id) {
    // Réinitialiser l'état via le Store
    store.setCompetencesHierarchy([]);
    store.setCompetencesState({});
    return;
  }

  try {
    const response = await fetch(`/api/skills/hierarchy/${agent.id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    // Gérer les 2 formats (tableau direct ou objet {hierarchy: [...]})
    const hierarchy = Array.isArray(data) ? data : (data.hierarchy || []);
    
    // Reconstruire competencesState avec les IDs comme clés
    const newCompetencesState = {};
    for (const group of hierarchy) {
      const groupKey = group.id;
      // Utiliser la valeur de l'agent pour les groupes principaux
      const normalizedGroupName = group.name.toLowerCase().replace(/\s+/g, '');
      const agentGroupValue = agent.attributes?.[normalizedGroupName] || 
                               agent.attributes?.[group.name] || 
                               group.value || 0;
      newCompetencesState[groupKey] = { ...group, value: agentGroupValue };

      for (const attribute of group.attributes || []) {
        const attrKey = attribute.id;
        newCompetencesState[groupKey][attrKey] = { ...attribute, value: attribute.value || 0 };

        for (const skillGroup of attribute.skillGroups || []) {
          const sgKey = skillGroup.id;
          newCompetencesState[groupKey][attrKey][sgKey] = { ...skillGroup, value: skillGroup.value || 0 };

          for (const skill of skillGroup.skills || []) {
            const skillKey = skill.id;
            newCompetencesState[groupKey][attrKey][sgKey][skillKey] = { ...skill, value: skill.value || 0 };
          }
        }
      }
    }

    // Fusionner avec les compétences éventuellement sauvegardées dans currentAgent
    if (agent.skills) {
      const mergedState = { ...newCompetencesState };
      deepMergeCompetencesIntoState(mergedState, agent.skills);
      store.setCompetencesState(mergedState);
    } else {
      store.setCompetencesState(newCompetencesState);
    }

    // Mettre à jour la hiérarchie
    store.setCompetencesHierarchy(hierarchy);

    return hierarchy;
  } catch (error) {
    console.error('Error loading competences:', error);
    store.setCompetencesHierarchy([]);
    store.setCompetencesState({});
    throw error;
  }
}

/**
 * Fusionne les compétences sauvegardées dans l'état
 * @param {Object} state - État des compétences
 * @param {Object} saved - Compétences sauvegardées
 */
function deepMergeCompetencesIntoState(state, saved) {
  if (!saved || !state) return;

  for (const attrKey in saved) {
    if (state[attrKey]) {
      for (const subAttrKey in saved[attrKey]) {
        if (state[attrKey][subAttrKey]) {
          for (const groupKey in saved[attrKey][subAttrKey]) {
            if (state[attrKey][subAttrKey][groupKey]) {
              for (const skillKey in saved[attrKey][subAttrKey][groupKey]) {
                if (state[attrKey][subAttrKey][groupKey][skillKey]) {
                  state[attrKey][subAttrKey][groupKey][skillKey].value =
                    saved[attrKey][subAttrKey][groupKey][skillKey]?.value || 0;
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Fusionne les compétences sauvegardées avec l'état actuel
 * @param {Object} saved - Compétences sauvegardées
 * @deprecated Utiliser deepMergeCompetencesIntoState à la place
 */
export function deepMergeCompetences(saved) {
  // Cette fonction est conservée pour la compatibilité
  // Elle utilise maintenant le Store
  if (!saved) return;
  const currentState = store.competencesState;
  deepMergeCompetencesIntoState(currentState, saved);
}

// ============================================================================
// CHARGEMENT DES EFFETS
// ============================================================================

/**
 * Charge tous les effets disponibles
 * @returns {Promise<Array>} - Tableau de tous les effets
 */
export async function loadAllEffects() {
  // Vérifier si les données sont déjà chargées via le Store
  if (store.effectsData.length) {
    return Promise.resolve(store.effectsData);
  }
  return requestJson('/api/effects')
    .then((data) => {
      // Utiliser le setter du Store
      const loadedData = Array.isArray(data?.effects) ? data.effects : (Array.isArray(data) ? data : []);
      store.setEffectsData(loadedData);
      return store.effectsData;
    })
    .catch(() => {
      store.setEffectsData([]);
      return store.effectsData;
    });
}

// ============================================================================
// CHARGEMENT DES MESSAGES
// ============================================================================

/**
 * Charge les messages pour l'agent courant
 * @returns {Promise<Array>} - Tableau des messages
 */
export async function loadMessagesForCurrentAgent() {
  const agent = store.currentAgent;
  if (!agent?.id) return [];

  try {
    const result = await requestJson(`/api/messages/${agent.id}`);
    const messages = Array.isArray(result?.messages) ? result.messages : [];
    const sortedMessages = messages.sort((a, b) => Number(b.id) - Number(a.id));
    
    // Utiliser le setter du Store
    store.setCurrentAgentMessages(sortedMessages);
    
    return sortedMessages;
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    throw error;
  }
}

// ============================================================================
// CHARGEMENT DES TALENTS
// ============================================================================

/**
 * Charge la liste de tous les talents disponibles
 * @returns {Promise<Array>} - Tableau des talents
 */
export async function loadTalents() {
  try {
    console.log('Chargement des talents depuis /api/talents...');
    const result = await requestJson('/api/talents');
    console.log('Résultat brut de /api/talents:', result);
    const loadedTalents = Array.isArray(result) 
      ? result 
      : (result?.talents || result?.data || []);
    
    console.log('Talents extraits:', loadedTalents.length);
    
    // S'assurer que talents est un tableau d'objets avec id
    if (!Array.isArray(loadedTalents)) {
      store.setTalents([]);
      return [];
    }
    
    // Utiliser le setter du Store
    store.setTalents(loadedTalents);
    
    console.log('Talents chargés dans le state:', loadedTalents.length);
    return loadedTalents;
  } catch (error) {
    console.error('Erreur lors du chargement des talents:', error);
    store.setTalents([]);
    return [];
  }
}

// ============================================================================
// FONCTIONS DE CHARGEMENT COMBINÉ
// ============================================================================

/**
 * Charge toutes les données d'équipement en parallèle
 * @returns {Promise<Object>} - Objet contenant les trois tableaux
 */
export async function loadAllEquipmentData() {
  const [weapons, medical, equipment] = await Promise.all([
    loadWeaponsData(),
    loadMedicalData(),
    loadEquipmentData(),
  ]);
  
  return { weapons, medical, equipment };
}
