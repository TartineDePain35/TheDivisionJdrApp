/**
 * Store Centralisé - Gestion d'état global de l'application
 * Pattern : Singleton + Observer
 * 
 * ============================================================================
 * MIGRATION : Ce module est maintenant le système principal de gestion d'état
 * ============================================================================
 * 
 * Historique :
 * - Avant : L'état était géré via state.js avec des variables let globales
 * - Phase 1 : Création de ce Store avec encapsulation complète
 * - Phase 2 : Migration de tous les modules pour utiliser store.js directement
 * - Phase 3 : state.js a été renommé en state-deprecated.js puis supprimé
 * - Phase 4 : Tous les modules utilisent maintenant store.js directement
 * 
 * Ce module fournit un store unique pour toute l'application avec :
 * - Encapsulation de l'état (tout est privé via #state)
 * - Système de souscription aux changements (Pattern Observer)
 * - Getters/Setters contrôlés avec notification automatique
 * - Réinitialisation centralisée (resetAppState, resetWizardState)
 * 
 * ============================================================================
 * UTILISATION
 * ============================================================================
 * 
 * Import :
 *   import { store } from './store.js';
 * 
 * Accès à l'état :
 *   store.currentAgent      // Getter pour l'agent courant
 *   store.weaponsData       // Getter pour les données des armes
 *   store.competencesState  // Getter pour l'état des compétences
 * 
 * Modification de l'état :
 *   store.setCurrentAgent(agent);
 *   store.setWeaponsData(data);
 *   store.updateCurrentAgent('inventory', newInventory);
 * 
 * Abonnement aux changements :
 *   const unsubscribe = store.subscribe((state) => {
 *     console.log('État mis à jour:', state);
 *   });
 *   
 *   // Abonnement à une section spécifique :
 *   const unsubscribe = store.subscribe((agent) => {
 *     console.log('Agent mis à jour:', agent);
 *   }, 'agent');
 *   
 *   // Se désabonner :
 *   unsubscribe();
 * 
 * Réinitialisation :
 *   store.resetAppState();      // Réinitialise tout l'état
 *   store.resetWizardState();   // Réinitialise seulement le wizard
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import {
  DEFAULT_ATTRIBUTE_VALUES,
  DEFAULT_RESERVE_VALUES,
} from './config.js';

// ============================================================================
// CLASSE APPSTORE
// ============================================================================
class AppStore {
  // État privé - toutes les données d'application sont stockées ici
  #state = {
    // ==========================================================================
    // AGENT - État de l'agent courant
    // ==========================================================================
    agent: {
      current: {},
      messages: [],
      expandedMessageIds: new Set(),
    },

    // ==========================================================================
    // DONNÉES DE RÉFÉRENCE - Équipements, effets, talents
    // ==========================================================================
    data: {
      weapons: [],
      medical: [],
      equipment: [],
      effects: [],
      talents: [],
    },

    // ==========================================================================
    // COMPÉTENCES - Hiérarchie et état complet
    // ==========================================================================
    competences: {
      hierarchy: [],
      state: {},
    },

    // ==========================================================================
    // ÉTAT DES COMPÉTENCES - Stats et attributs de base
    // ==========================================================================
    base: {
      stats: {},
      attributes: {},
    },

    // ==========================================================================
    // ÉTAT DES COMPÉTENCES - Réserves et valeurs courantes
    // ==========================================================================
    skillsState: {
      reserve: 0,
      stats: {
        speed: 1,
        resilience: 1,
        vigor: 1,
      },
    },

    attributesState: {
      reserve: 0,
      attributes: {
        conscience: 1,
        dexterity: 1,
        technique: 1,
      },
    },

    // ==========================================================================
    // MODIFICATIONS - Vue simple des attributs
    // ==========================================================================
    attributesViewModifications: {},
    attributesViewInitialValues: {},

    // ==========================================================================
    // REDISTRIBUTION - Niveau 1 (Attributs principaux)
    // ==========================================================================
    attributeRedistribution: {
      currentAttributeGroup: null,
      currentAttributeGroupValue: 0,
      attributeModifications: {},
      attributeBaseValues: {},
      currentAvailablePoints: 0,
    },

    // ==========================================================================
    // GROUPES DE COMPÉTENCES - Niveau 3
    // ==========================================================================
    skillGroups: {
      skillGroupModifications: {},
      skillGroupBaseValues: {},
      currentSkillGroupAvailablePoints: 0,
    },

    // ==========================================================================
    // COMPÉTENCES - Niveau 4
    // ==========================================================================
    skills: {
      skillModifications: {},
      skillBaseValues: {},
      currentSkillAvailablePoints: 0,
    },

    // ==========================================================================
    // INVENTAIRE
    // ==========================================================================
    inventory: {
      pendingDeleteIndex: null,
    },

    // ==========================================================================
    // WIZARD - Création d'agent
    // ==========================================================================
    wizard: {
      currentStep: 1,
      visitedStep: 1,
      talentIndex: 0,
      selectedTalent: null,
      talentIdSelected: null,
      attributeValues: { ...DEFAULT_ATTRIBUTE_VALUES },
      reserveValues: { ...DEFAULT_RESERVE_VALUES },
    },

    // ==========================================================================
    // TALENTS - Sélection pour l'agent actuel
    // ==========================================================================
    talentsSelection: {
      selectedAgentTalent: null,
      selectedAgentTalentId: null,
      selectedAgentTalentTile: null,
    },

    // ==========================================================================
    // UI - État de l'interface
    // ==========================================================================
    ui: {
      storyCount: null,
    },
  };

  // ==========================================================================
  // LISTENERS - Système de souscription (Pattern Observer)
  // ==========================================================================
  #listeners = new Set();

  // ==========================================================================
  // GETTERS - Accès à l'état
  // ==========================================================================

  // Agent
  get currentAgent() {
    return this.#state.agent.current;
  }
  get currentAgentMessages() {
    return this.#state.agent.messages;
  }
  get expandedMessageIds() {
    return this.#state.agent.expandedMessageIds;
  }
  get currentAdventure() {
    return this.#state.agent.adventure;
  }

  // Données de référence
  get weaponsData() {
    return this.#state.data.weapons;
  }
  get medicalData() {
    return this.#state.data.medical;
  }
  get equipmentData() {
    return this.#state.data.equipment;
  }
  get effectsData() {
    return this.#state.data.effects;
  }
  get talents() {
    return this.#state.data.talents;
  }
  
  // Compétences - Hiérarchie
  get competencesHierarchy() {
    return this.#state.competences.hierarchy;
  }
  get competencesState() {
    return this.#state.competences.state;
  }

  // État des compétences - Base
  get baseStats() {
    return this.#state.base.stats;
  }
  get baseAttributes() {
    return this.#state.base.attributes;
  }

  // État des compétences - Réserves
  get skillsState() {
    return this.#state.skillsState;
  }
  get attributesState() {
    return this.#state.attributesState;
  }

  // Modifications - Vue simple
  get attributesViewModifications() {
    return this.#state.attributesViewModifications;
  }
  get attributesViewInitialValues() {
    return this.#state.attributesViewInitialValues;
  }

  // Redistribution - Niveau 1
  get currentAttributeGroup() {
    return this.#state.attributeRedistribution.currentAttributeGroup;
  }
  get currentAttributeGroupValue() {
    return this.#state.attributeRedistribution.currentAttributeGroupValue;
  }
  get attributeModifications() {
    return this.#state.attributeRedistribution.attributeModifications;
  }
  get attributeBaseValues() {
    return this.#state.attributeRedistribution.attributeBaseValues;
  }
  get currentAvailablePoints() {
    return this.#state.attributeRedistribution.currentAvailablePoints;
  }

  // Groupes de compétences - Niveau 3
  get skillGroupModifications() {
    return this.#state.skillGroups.skillGroupModifications;
  }
  get skillGroupBaseValues() {
    return this.#state.skillGroups.skillGroupBaseValues;
  }
  get currentSkillGroupAvailablePoints() {
    return this.#state.skillGroups.currentSkillGroupAvailablePoints;
  }

  // Compétences - Niveau 4
  get skillModifications() {
    return this.#state.skills.skillModifications;
  }
  get skillBaseValues() {
    return this.#state.skills.skillBaseValues;
  }
  get currentSkillAvailablePoints() {
    return this.#state.skills.currentSkillAvailablePoints;
  }

  // Inventaire
  get pendingDeleteIndex() {
    return this.#state.inventory.pendingDeleteIndex;
  }

  // Wizard
  get currentStep() {
    return this.#state.wizard.currentStep;
  }
  get visitedStep() {
    return this.#state.wizard.visitedStep;
  }
  get talentIndex() {
    return this.#state.wizard.talentIndex;
  }
  get selectedTalent() {
    return this.#state.wizard.selectedTalent;
  }
  get talentIdSelected() {
    return this.#state.wizard.talentIdSelected;
  }
  get attributeValues() {
    return this.#state.wizard.attributeValues;
  }
  get reserveValues() {
    return this.#state.wizard.reserveValues;
  }

  // Talents - Agent actuel
  get selectedAgentTalent() {
    return this.#state.talentsSelection.selectedAgentTalent;
  }
  get selectedAgentTalentId() {
    return this.#state.talentsSelection.selectedAgentTalentId;
  }
  get selectedAgentTalentTile() {
    return this.#state.talentsSelection.selectedAgentTalentTile;
  }

  // UI
  get storyCount() {
    return this.#state.ui.storyCount;
  }

  // ==========================================================================
  // SETTERS - Modification de l'état avec notification
  // ==========================================================================

  // Agent
  setCurrentAgent(agent) {
    this.#state.agent.current = agent ? { ...agent } : {};
    this.notify();
  }

  setCurrentAgentMessages(messages) {
    this.#state.agent.messages = Array.isArray(messages) ? [...messages] : [];
    this.notify();
  }

  setExpandedMessageIds(ids) {
    this.#state.agent.expandedMessageIds = new Set(ids);
    this.notify();
  }

  setCurrentAdventure(adventure) {
    this.#state.agent.adventure = adventure ? { ...adventure } : null;
    this.notify();
  }

  // Données de référence
  setWeaponsData(data) {
    this.#state.data.weapons = Array.isArray(data) ? [...data] : [];
    this.notify();
  }

  setMedicalData(data) {
    this.#state.data.medical = Array.isArray(data) ? [...data] : [];
    this.notify();
  }

  setEquipmentData(data) {
    this.#state.data.equipment = Array.isArray(data) ? [...data] : [];
    this.notify();
  }

  setEffectsData(data) {
    this.#state.data.effects = Array.isArray(data) ? [...data] : [];
    this.notify();
  }

  setTalents(data) {
    this.#state.data.talents = Array.isArray(data) ? [...data] : [];
    this.notify();
  }
  
  // Compétences - Hiérarchie
  setCompetencesHierarchy(data) {
    this.#state.competences.hierarchy = Array.isArray(data) ? [...data] : [];
    this.notify();
  }

  setCompetencesState(data) {
    this.#state.competences.state = data ? { ...data } : {};
    this.notify();
  }

  // État des compétences - Base
  setBaseStats(data) {
    this.#state.base.stats = data ? { ...data } : {};
    this.notify();
  }

  setBaseAttributes(data) {
    this.#state.base.attributes = data ? { ...data } : {};
    this.notify();
  }

  // État des compétences - Réserves
  setSkillsState(data) {
    this.#state.skillsState = data ? { ...data } : { reserve: 0, stats: {} };
    this.notify();
  }

  setAttributesState(data) {
    this.#state.attributesState = data ? { ...data } : { reserve: 0, attributes: {} };
    this.notify();
  }

  // Modifications - Vue simple
  setAttributesViewModifications(data) {
    this.#state.attributesViewModifications = data ? { ...data } : {};
    this.notify();
  }

  setAttributesViewInitialValues(data) {
    this.#state.attributesViewInitialValues = data ? { ...data } : {};
    this.notify();
  }

  // Redistribution - Niveau 1
  setCurrentAttributeGroup(value) {
    this.#state.attributeRedistribution.currentAttributeGroup = value;
    this.notify();
  }

  setCurrentAttributeGroupValue(value) {
    this.#state.attributeRedistribution.currentAttributeGroupValue = value;
    this.notify();
  }

  setAttributeModifications(data) {
    this.#state.attributeRedistribution.attributeModifications = data ? { ...data } : {};
    this.notify();
  }

  setAttributeBaseValues(data) {
    this.#state.attributeRedistribution.attributeBaseValues = data ? { ...data } : {};
    this.notify();
  }

  setCurrentAvailablePoints(value) {
    this.#state.attributeRedistribution.currentAvailablePoints = value;
    this.notify();
  }

  // Groupes de compétences - Niveau 3
  setSkillGroupModifications(data) {
    this.#state.skillGroups.skillGroupModifications = data ? { ...data } : {};
    this.notify();
  }

  setSkillGroupBaseValues(data) {
    this.#state.skillGroups.skillGroupBaseValues = data ? { ...data } : {};
    this.notify();
  }

  setCurrentSkillGroupAvailablePoints(value) {
    this.#state.skillGroups.currentSkillGroupAvailablePoints = value;
    this.notify();
  }

  // Compétences - Niveau 4
  setSkillModifications(data) {
    this.#state.skills.skillModifications = data ? { ...data } : {};
    this.notify();
  }

  setSkillBaseValues(data) {
    this.#state.skills.skillBaseValues = data ? { ...data } : {};
    this.notify();
  }

  setCurrentSkillAvailablePoints(value) {
    this.#state.skills.currentSkillAvailablePoints = value;
    this.notify();
  }

  // Inventaire
  setPendingDeleteIndex(value) {
    this.#state.inventory.pendingDeleteIndex = value;
    this.notify();
  }

  // Wizard
  setCurrentStep(step) {
    this.#state.wizard.currentStep = step;
    this.notify();
  }

  setVisitedStep(step) {
    this.#state.wizard.visitedStep = Math.max(this.#state.wizard.visitedStep, step);
    this.notify();
  }

  setTalentIndex(index) {
    this.#state.wizard.talentIndex = index;
    this.notify();
  }

  setSelectedTalent(talent) {
    this.#state.wizard.selectedTalent = talent;
    this.notify();
  }

  setTalentIdSelected(id) {
    this.#state.wizard.talentIdSelected = id;
    this.notify();
  }

  setAttributeValues(data) {
    this.#state.wizard.attributeValues = data ? { ...data } : { ...DEFAULT_ATTRIBUTE_VALUES };
    this.notify();
  }

  setReserveValues(data) {
    this.#state.wizard.reserveValues = data ? { ...data } : { ...DEFAULT_RESERVE_VALUES };
    this.notify();
  }

  // Talents - Agent actuel
  setSelectedAgentTalent(talent) {
    this.#state.talentsSelection.selectedAgentTalent = talent;
    this.notify();
  }

  setSelectedAgentTalentId(id) {
    this.#state.talentsSelection.selectedAgentTalentId = id;
    this.notify();
  }

  setSelectedAgentTalentTile(tile) {
    this.#state.talentsSelection.selectedAgentTalentTile = tile;
    this.notify();
  }

  // UI
  setStoryCount(count) {
    this.#state.ui.storyCount = count;
    this.notify();
  }

  // ==========================================================================
  // MÉTHODES DE MUTATION DIRECTE (pour les tableaux/objets existants)
  // ==========================================================================

  /**
   * Ajoute des messages à la liste actuelle
   * @param {Array} newMessages - Nouveaux messages à ajouter
   */
  addAgentMessages(newMessages) {
    if (Array.isArray(newMessages)) {
      this.#state.agent.messages.push(...newMessages);
      this.notify();
    }
  }

  /**
   * Ajoute un message unique à expandedMessageIds
   * @param {string|number} id - ID du message
   */
  addExpandedMessageId(id) {
    this.#state.agent.expandedMessageIds.add(id);
    this.notify();
  }

  /**
   * Retire un message de expandedMessageIds
   * @param {string|number} id - ID du message
   */
  removeExpandedMessageId(id) {
    this.#state.agent.expandedMessageIds.delete(id);
    this.notify();
  }

  /**
   * Met à jour une propriété spécifique de currentAgent
   * @param {string} key - Clé de la propriété
   * @param {*} value - Nouvelle valeur
   */
  updateCurrentAgent(key, value) {
    if (this.#state.agent.current) {
      this.#state.agent.current[key] = value;
      this.notify();
    }
  }

  // ==========================================================================
  // PATTERN OBSERVER - Système de souscription
  // ==========================================================================

  /**
   * S'abonne aux changements d'état
   * @param {Function} callback - Fonction appelée lors des changements
   * @param {string|null} section - Section spécifique à observer (null = tout l'état)
   * @returns {Function} - Fonction pour se désabonner
   */
  subscribe(callback, section = null) {
    if (typeof callback !== 'function') {
      console.warn('Store.subscribe: callback must be a function');
      return () => {};
    }

    const wrappedCallback = section
      ? () => {
          const sectionData = this.getState()[section];
          if (sectionData !== undefined) {
            callback(sectionData);
          }
        }
      : () => callback(this.getState());

    this.#listeners.add(wrappedCallback);

    // Appeler une première fois avec l'état actuel
    try {
      wrappedCallback();
    } catch (error) {
      console.error('Erreur lors de l\'appel initial du listener:', error);
    }

    // Retourner une fonction pour se désabonner
    return () => this.#listeners.delete(wrappedCallback);
  }

  /**
   * Se désabonne des changements d'état
   * @param {Function} callback - Fonction de callback à retirer
   */
  unsubscribe(callback) {
    this.#listeners.delete(callback);
  }

  /**
   * Notifie tous les listeners
   */
  notify() {
    this.#listeners.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Erreur dans un listener du store:', error);
      }
    });
  }

  // ==========================================================================
  // FONCTIONS DE RÉINITIALISATION
  // ==========================================================================

  /**
   * Réinitialise l'état du wizard de création d'agent
   */
  resetWizardState() {
    this.#state.wizard = {
      currentStep: 1,
      visitedStep: 1,
      talents: [],
      talentIndex: 0,
      selectedTalent: null,
      talentIdSelected: null,
      attributeValues: { ...DEFAULT_ATTRIBUTE_VALUES },
      reserveValues: { ...DEFAULT_RESERVE_VALUES },
    };
    this.notify();
  }

  /**
   * Réinitialise la sélection des talents
   */
  resetSelectedAgentTalent() {
    this.#state.talentsSelection.selectedAgentTalent = null;
    this.#state.talentsSelection.selectedAgentTalentId = null;
    this.#state.talentsSelection.selectedAgentTalentTile = null;
    this.notify();
  }

  /**
   * Réinitialise l'état global de l'application
   */
  resetAppState() {
    this.#state = {
      agent: {
        current: {},
        messages: [],
        expandedMessageIds: new Set(),
        adventure: null,
      },
      data: {
        weapons: [],
        medical: [],
        equipment: [],
        effects: [],
        talents: [],
      },
      competences: {
        hierarchy: [],
        state: {},
      },
      base: {
        stats: {},
        attributes: {},
      },
      skillsState: {
        reserve: 0,
        stats: {
          speed: 1,
          resilience: 1,
          vigor: 1,
        },
      },
      attributesState: {
        reserve: 0,
        attributes: {
          conscience: 1,
          dexterity: 1,
          technique: 1,
        },
      },
      attributesViewModifications: {},
      attributesViewInitialValues: {},
      attributeRedistribution: {
        currentAttributeGroup: null,
        currentAttributeGroupValue: 0,
        attributeModifications: {},
        attributeBaseValues: {},
        currentAvailablePoints: 0,
      },
      skillGroups: {
        skillGroupModifications: {},
        skillGroupBaseValues: {},
        currentSkillGroupAvailablePoints: 0,
      },
      skills: {
        skillModifications: {},
        skillBaseValues: {},
        currentSkillAvailablePoints: 0,
      },
      inventory: {
        pendingDeleteIndex: null,
      },
      wizard: {
        currentStep: 1,
        visitedStep: 1,
        talentIndex: 0,
        selectedTalent: null,
        talentIdSelected: null,
        attributeValues: { ...DEFAULT_ATTRIBUTE_VALUES },
        reserveValues: { ...DEFAULT_RESERVE_VALUES },
      },
      talentsSelection: {
        selectedAgentTalent: null,
        selectedAgentTalentId: null,
        selectedAgentTalentTile: null,
      },
      ui: {
        storyCount: null,
      },
    };
    this.notify();
  }

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  /**
   * Retourne l'état complet (copie profonde pour éviter les mutations)
   * @returns {Object} - Copie profonde de l'état
   */
  getState() {
    return this.#deepClone(this.#state);
  }

  /**
   * Clone profond d'un objet
   * @param {*} obj - Objet à cloner
   * @returns {*} - Copie profonde
   */
  #deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Set) {
      return new Set(Array.from(obj));
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.#deepClone(item));
    }

    if (obj instanceof Date) {
      return new Date(obj);
    }

    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.#deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

// ============================================================================
// EXPORT - Singleton
// ============================================================================
export const store = new AppStore();
