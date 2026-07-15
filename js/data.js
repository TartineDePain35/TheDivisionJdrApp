/**
 * Module Data - Chargement des données depuis les fichiers JSON et l'API
 * Contient toutes les fonctions de chargement de données
 */

// ============================================================================
// IMPORTS - State
// ============================================================================
import {
  weaponsData,
  medicalData,
  equipmentData,
  competencesHierarchy,
  competencesState,
  currentAgent,
  currentAgentMessages,
  talents,
  talentIndex,
  selectedTalent,
} from './state.js';

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
  if (weaponsData.length) {
    return Promise.resolve(weaponsData);
  }
  return requestJson(WEAPONS_DATA_PATH)
    .then((data) => {
      // Mise à jour directe de la référence exportée
      const loadedData = Array.isArray(data) ? data : [];
      // On doit mutuer le tableau pour que les imports voient les changements
      weaponsData.length = 0;
      weaponsData.push(...loadedData);
      return weaponsData;
    })
    .catch(() => {
      weaponsData.length = 0;
      return weaponsData;
    });
}

/**
 * Charge les données médicales depuis le fichier JSON
 * @returns {Promise<Array>} - Tableau des items médicaux
 */
export async function loadMedicalData() {
  if (medicalData.length) {
    return Promise.resolve(medicalData);
  }
  return requestJson(MEDICAL_DATA_PATH)
    .then((data) => {
      const loadedData = Array.isArray(data) ? data : [];
      medicalData.length = 0;
      medicalData.push(...loadedData);
      return medicalData;
    })
    .catch(() => {
      medicalData.length = 0;
      return medicalData;
    });
}

/**
 * Charge les données d'équipement depuis le fichier JSON
 * @returns {Promise<Array>} - Tableau des équipements
 */
export async function loadEquipmentData() {
  if (equipmentData.length) {
    return Promise.resolve(equipmentData);
  }
  return requestJson(EQUIPMENT_DATA_PATH)
    .then((data) => {
      const loadedData = Array.isArray(data) ? data : [];
      equipmentData.length = 0;
      equipmentData.push(...loadedData);
      return equipmentData;
    })
    .catch(() => {
      equipmentData.length = 0;
      return equipmentData;
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
  if (!currentAgent?.id) {
    // Réinitialiser l'état
    competencesHierarchy.length = 0;
    Object.keys(competencesState).forEach(key => delete competencesState[key]);
    return;
  }

  try {
    const response = await fetch(`/api/skills/hierarchy/${currentAgent.id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    // Gérer les 2 formats (tableau direct ou objet {hierarchy: [...]})
    const hierarchy = Array.isArray(data) ? data : (data.hierarchy || []);
    
    // Mise à jour de la hiérarchie (utiliser splice pour éviter la réassignment)
    competencesHierarchy.splice(0, competencesHierarchy.length, ...hierarchy);

    // Reconstruire competencesState avec les IDs comme clés
    // Vider l'objet existant sans réassignment
    Object.keys(competencesState).forEach(key => delete competencesState[key]);
    for (const group of competencesHierarchy) {
      const groupKey = group.id;
      // Utiliser la valeur de l'agent pour les groupes principaux
      const normalizedGroupName = group.name.toLowerCase().replace(/\s+/g, '');
      const agentGroupValue = currentAgent.attributes?.[normalizedGroupName] || 
                               currentAgent.attributes?.[group.name] || 
                               group.value || 0;
      competencesState[groupKey] = { ...group, value: agentGroupValue };

      for (const attribute of group.attributes || []) {
        const attrKey = attribute.id;
        competencesState[groupKey][attrKey] = { ...attribute, value: attribute.value || 0 };

        for (const skillGroup of attribute.skillGroups || []) {
          const sgKey = skillGroup.id;
          competencesState[groupKey][attrKey][sgKey] = { ...skillGroup, value: skillGroup.value || 0 };

          for (const skill of skillGroup.skills || []) {
            const skillKey = skill.id;
            competencesState[groupKey][attrKey][sgKey][skillKey] = { ...skill, value: skill.value || 0 };
          }
        }
      }
    }

    // Fusionner avec les compétences éventuellement sauvegardées dans currentAgent
    if (currentAgent.skills) {
      deepMergeCompetences(currentAgent.skills);
    }

    return competencesHierarchy;
  } catch (error) {
    console.error('Error loading competences:', error);
    competencesHierarchy.splice(0, competencesHierarchy.length);
    Object.keys(competencesState).forEach(key => delete competencesState[key]);
    throw error;
  }
}

/**
 * Fusionne les compétences sauvegardées avec l'état actuel
 * @param {Object} saved - Compétences sauvegardées
 */
export function deepMergeCompetences(saved) {
  if (!saved || !competencesState) return;

  for (const attrKey in saved) {
    if (competencesState[attrKey]) {
      for (const subAttrKey in saved[attrKey]) {
        if (competencesState[attrKey][subAttrKey]) {
          for (const groupKey in saved[attrKey][subAttrKey]) {
            if (competencesState[attrKey][subAttrKey][groupKey]) {
              for (const skillKey in saved[attrKey][subAttrKey][groupKey]) {
                if (competencesState[attrKey][subAttrKey][groupKey][skillKey]) {
                  competencesState[attrKey][subAttrKey][groupKey][skillKey].value =
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

// ============================================================================
// CHARGEMENT DES MESSAGES
// ============================================================================

/**
 * Charge les messages pour l'agent courant
 * @returns {Promise<Array>} - Tableau des messages
 */
export async function loadMessagesForCurrentAgent() {
  if (!currentAgent?.id) return [];

  try {
    const result = await requestJson(`/api/messages/${currentAgent.id}`);
    const messages = Array.isArray(result?.messages) ? result.messages : [];
    const sortedMessages = messages.sort((a, b) => Number(b.id) - Number(a.id));
    
    // Mise à jour directe du tableau
    currentAgentMessages.length = 0;
    currentAgentMessages.push(...sortedMessages);
    
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
      talents.length = 0;
      return [];
    }
    
    // Mise à jour du tableau
    talents.length = 0;
    talents.push(...loadedTalents);
    
    console.log('Talents chargés dans le state:', talents.length);
    return talents;
  } catch (error) {
    console.error('Erreur lors du chargement des talents:', error);
    talents.length = 0;
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
