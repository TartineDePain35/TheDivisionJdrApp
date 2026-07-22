/**
 * Module Game - Logique métier principale de l'application
 * Contient : Wizard, Inventaire, Talents, Compétences, Messages
 */

// ============================================================================
// IMPORTS - Store Centralisé
// ============================================================================
import { store } from './store.js';

// ============================================================================
// IMPORTS - Configuration
// ============================================================================
import { WIZARD_STEP_LABELS } from './config.js';

// ============================================================================
// IMPORTS - Elements
// ============================================================================
import {
  agentInputs,
  wizardStepNav,
  wizardContent,
  wizardBreadcrumb,
  wizardBack,
  wizardNext,
  chooseTalentBtn,
  talentPrev,
  talentNext,
  talentCard,
  inventoryBtn,
  skillsBtn,
  attributesBtn,
  competencesBtn,
  talentsBtn,
  messagesBtn,
  saveSkillsBtn,
  saveAttributesBtn,
  saveCompetencesBtn,
  closeCompetenceDescBtn,
  competenceDescModal,
  inventoryList,
  addInventoryItemBtn,
  closeAddItemModalBtn,
  addItemTypeSelect,
  weaponTypeSelect,
  weaponCategorySelect,
  weaponClassSelect,
  weaponNameSelect,
  confirmAddInventoryItemBtn,
  weaponSelectorSection,
  medicalTypeSelect,
  medicalCategorySelect,
  medicalNameSelect,
  medicalSelectorSection,
  equipmentTypeSelect,
  equipmentCategorySelect,
  equipmentNameSelect,
  equipmentSelectorSection,
  otherItemName,
  otherItemDescription,
  otherItemWeight,
  otherSelectorSection,
  deleteItemModal,
  confirmDeleteBtn,
  cancelDeleteBtn,
  itemDetailsModal,
  closeItemDetailsBtn,
  itemDetailsContent,
  messagesView,
  talentsContainer,
  talentsAvailableContainer,
  confirmTalentBtn,
} from './elements.js';

// ============================================================================
// IMPORTS - UI
// ============================================================================
import {
  showToast,
  showModal,
  hideModal,
  sanitizeText,
  scrollToTop,
  showAgentCreatedPopup,
  openEffectDetails,
  renderInventory,
  updateMessagesButtonLabel,
  renderMessages,
  showTalentDescription,
  showCompetenceDescription,
  hideCompetenceDescription,
  openDashboardView,
  openInventoryScreen,
  openSkillsScreen,
  openAttributesScreen,
  openTalentsScreen,
  openCompetencesScreen,
  openMessagesScreen,
  createTalentTile,
  renderSkillsScreen,
  updateSkillsButtons,
  renderAttributesScreen,
  updateAttributesButtons,
  updateSaveAttributesButtonState,
  renderAgent,
  showSection,
} from './ui.js';

// ============================================================================
// IMPORTS - Data & Auth
// ============================================================================
import {
  loadWeaponsData,
  loadMedicalData,
  loadEquipmentData,
  loadMessagesForCurrentAgent,
  requestJson,
} from './data.js';

import {
  persistCurrentAgent,
  createAgent as createAgentAPI,
  findAgent,
} from './auth.js';

// ============================================================================
// VARIABLES LOCALES
// ============================================================================

// ==========================================================================
// WIZARD - CRÉATION D'AGENT
// ============================================================================

/**
 * Réinitialise le wizard
 */
export function resetWizard() {
  store.resetWizardState();
  
  Object.values(agentInputs).forEach((input) => {
    if (input) input.value = '';
  });
  
  if (storyCount) storyCount.textContent = '0';
  updateReserveDisplay();
  updatePointButtons();
  renderTalent();
  buildWizardStepNav();
  showWizardStep(1);
  
  // Pré-sélectionner le premier talent par défaut
  if (store.talents.length > 0) {
    store.setSelectedTalent(store.talents[0]);
    store.setTalentIdSelected(String(store.talents[0].id));
  }
}

/**
 * Construit la navigation des étapes du wizard
 */
function buildWizardStepNav() {
  if (!wizardStepNav) return;
  
  wizardStepNav.innerHTML = WIZARD_STEP_LABELS
    .map(
      (label, index) =>
        `<button type="button" data-step="${index + 1}" class="${index === 0 ? 'active-step-nav' : ''}">${index + 1}. ${label}</button>`
    )
    .join('');
}

/**
 * Met à jour la navigation des étapes
 */
function updateWizardStepNav() {
  if (!wizardStepNav) return;
  
  const buttons = Array.from(wizardStepNav.querySelectorAll('button[data-step]'));
  buttons.forEach((button) => {
    const step = Number(button.dataset.step);
    button.classList.toggle('active-step-nav', step === store.currentStep);
    button.disabled = step > store.visitedStep;
  });
}

/**
 * Met à jour l'affichage de la réserve
 */
function updateReserveDisplay() {
  const statReserve = document.getElementById('statReserve');
  const attrReserve = document.getElementById('attrReserve');
  if (statReserve) statReserve.textContent = String(store.reserveValues.stats);
  if (attrReserve) attrReserve.textContent = String(store.reserveValues.attrs);
}

/**
 * Met à jour les boutons de points
 */
function updatePointButtons() {
  const plusButtons = Array.from(document.querySelectorAll('[data-action="increase"]'));
  const minusButtons = Array.from(document.querySelectorAll('[data-action="decrease"]'));

  plusButtons.forEach((button) => {
    const attr = button.dataset.attr;
    if (!attr) return;
    const reserveKey = ['speed', 'resilience', 'vigor'].includes(attr) ? 'stats' : 'attrs';
    button.disabled = store.reserveValues[reserveKey] <= 0;
  });

  minusButtons.forEach((button) => {
    const attr = button.dataset.attr;
    if (!attr) return;
    button.disabled = store.attributeValues[attr] <= 1;
  });
}

/**
 * Change la valeur d'un attribut
 * @param {string} attr - Attribut à modifier
 * @param {string} action - Action (increase/decrease)
 */
export function changeAttribute(attr, action) {
  const reserveKey = ['speed', 'resilience', 'vigor'].includes(attr) ? 'stats' : 'attrs';
  if (action === 'increase') {
    if (store.reserveValues[reserveKey] <= 0) return;
    const newReserveValues = { ...store.reserveValues };
    newReserveValues[reserveKey] -= 1;
    const newAttributeValues = { ...store.attributeValues };
    newAttributeValues[attr] += 1;
    store.setReserveValues(newReserveValues);
    store.setAttributeValues(newAttributeValues);
  } else {
    if (store.attributeValues[attr] <= 1) return;
    const newAttributeValues = { ...store.attributeValues };
    newAttributeValues[attr] -= 1;
    const newReserveValues = { ...store.reserveValues };
    newReserveValues[reserveKey] += 1;
    store.setAttributeValues(newAttributeValues);
    store.setReserveValues(newReserveValues);
  }
  const element = document.getElementById(`${attr}Value`);
  if (element) element.textContent = String(store.attributeValues[attr]);
  updateReserveDisplay();
  updatePointButtons();
  updateWizardButton();
}

/**
 * Valide une étape du wizard
 * @param {number} step - Étape à valider
 * @returns {boolean} - Si l'étape est valide
 */
function validateStep(step) {
  if (step === 1) {
    return (
      agentInputs.lastName.value.trim() &&
      agentInputs.firstName.value.trim() &&
      Number(agentInputs.age.value) >= 16 &&
      agentInputs.sex.value
    );
  }
  if (step === 2) {
    return (
      agentInputs.profession.value.trim() &&
      agentInputs.familyStatus.value &&
      agentInputs.children.value !== '' &&
      agentInputs.children.value !== null
    );
  }
  if (step === 3) {
    return store.reserveValues.stats === 0;
  }
  if (step === 4) {
    return store.reserveValues.attrs === 0;
  }
  if (step === 5) {
    return store.talentIdSelected !== null;
  }
  if (step === 6) {
    return agentInputs.story.value.trim().length > 0;
  }
  if (step === 7) {
    return validatePasswordStep();
  }
  return false;
}

/**
 * Valide l'étape du mot de passe
 * @returns {boolean} - Si l'étape est valide
 */
function validatePasswordStep() {
  const password = agentInputs.password.value.trim();
  return password.length > 0;
}

/**
 * Met à jour le bouton du wizard
 */
function updateWizardButton() {
  if (!wizardNext) return;
  
  wizardNext.disabled = !validateStep(store.currentStep);
  wizardNext.textContent = store.currentStep === 7 ? 'Valider votre agent' : 'Suivant';
}

/**
 * Affiche une étape du wizard
 * @param {number} step - Étape à afficher
 */
function showWizardStep(step) {
  const allSteps = Array.from(wizardContent.querySelectorAll('.wizard-step'));
  store.setCurrentStep(step);
  store.setVisitedStep(step);
  allSteps.forEach((element) => {
    element.classList.toggle('active-step', Number(element.dataset.step) === step);
  });
  if (wizardBreadcrumb) {
    wizardBreadcrumb.textContent = `Étape ${step} / 7 · ${WIZARD_STEP_LABELS[step - 1]}`;
  }
  updateWizardStepNav();
  updateWizardButton();
  scrollToTop();
}


/**
 * Rendu du talent courant dans le wizard
 */
function renderTalent() {
  // Utiliser les getters du Store
  const talents = store.talents;
  const index = store.talentIndex;
  const selected = store.selectedTalent;
  
  console.log('renderTalent() appelé - talentIndex:', index, 'talents.length:', talents.length, 'selectedTalent:', selected);
  
  // Obtenir les éléments directement pour éviter les problèmes de timing des modules
  const talentTitle = document.getElementById('talentTitle');
  const talentDescription = document.getElementById('talentDescription');
  
  if (!talentTitle || !talentDescription) {
    console.log('Erreur: talentTitle ou talentDescription non trouvé dans le DOM');
    return;
  }
  const talent = talents[index] || selected;
  console.log('Talent à afficher:', talent);
  if (!talent) {
    talentTitle.textContent = 'Chargement des talents...';
    talentDescription.textContent = 'Veuillez patienter pendant le chargement des talents.';
    return;
  }
  talentTitle.textContent = talent.title;
  talentDescription.textContent = talent.description;
}

/**
 * Navigue entre les talents
 * @param {number} direction - Direction (1 ou -1)
 */
export function navigateTalent(direction) {
  if (!store.talents.length) return;
  store.setTalentIndex((store.talentIndex + direction + store.talents.length) % store.talents.length);
  renderTalent();
}

/**
 * Sélectionne un talent
 */
export function chooseTalent() {
  if (!store.talents.length) return;
  const talent = store.talents[store.talentIndex];
  if (!talent || talent.id === null || talent.id === undefined) return;
  store.setSelectedTalent(talent);
  store.setTalentIdSelected(String(talent.id));
  showWizardStep(6);
}

/**
 * Récupère les données du wizard
 * @returns {Object} - Données de l'agent
 */
export function getWizardData() {
  return {
    name: agentInputs.lastName.value.trim(),
    firstName: agentInputs.firstName.value.trim(),
    age: Number(agentInputs.age.value),
    profession: agentInputs.profession.value.trim(),
    sex: agentInputs.sex.value,
    familyStatus: agentInputs.familyStatus.value,
    children: Number(agentInputs.children.value),
    stats: {
      speed: store.attributeValues.speed,
      resilience: store.attributeValues.resilience,
      vigor: store.attributeValues.vigor,
    },
    attributes: {
      conscience: store.attributeValues.conscience,
      dexterity: store.attributeValues.dexterity,
      technique: store.attributeValues.technique,
    },
    talents: store.selectedTalent ? [{...store.selectedTalent}] : [],
    story: agentInputs.story.value.trim(),
    password: agentInputs.password.value,
  };
}

// ============================================================================
// INVENTAIRE
// ============================================================================

/**
 * Réinitialise le modal d'ajout d'item
 */
export function resetAddItemModal() {
  if (!addItemTypeSelect || !weaponTypeSelect || !weaponCategorySelect || !weaponClassSelect || 
      !weaponNameSelect || !confirmAddInventoryItemBtn || !weaponSelectorSection || 
      !medicalTypeSelect || !medicalCategorySelect || !medicalNameSelect || !medicalSelectorSection ||
      !equipmentTypeSelect || !equipmentCategorySelect || !equipmentNameSelect || !equipmentSelectorSection ||
      !otherItemName || !otherItemDescription || !otherItemWeight || !otherSelectorSection) {
    return;
  }
  
  addItemTypeSelect.value = '';
  weaponTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponTypeSelect.disabled = true;
  weaponCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponCategorySelect.disabled = true;
  weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponClassSelect.disabled = true;
  weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponNameSelect.disabled = true;
  weaponSelectorSection.classList.add('hidden');
  medicalTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalTypeSelect.disabled = true;
  medicalCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalCategorySelect.disabled = true;
  medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalNameSelect.disabled = true;
  medicalSelectorSection.classList.add('hidden');
  equipmentTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentTypeSelect.disabled = true;
  equipmentCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentCategorySelect.disabled = true;
  equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentNameSelect.disabled = true;
  equipmentSelectorSection.classList.add('hidden');
  otherItemName.value = '';
  otherItemDescription.value = '';
  otherItemWeight.value = '';
  otherSelectorSection.classList.add('hidden');
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

/**
 * Construit les options de type d'arme
 */
function buildWeaponTypeOptions() {
  const types = [...new Set(store.weaponsData.map((weapon) => weapon.type))].filter(Boolean);
  if (weaponTypeSelect) {
    weaponTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
    weaponTypeSelect.disabled = false;
  }
  if (weaponCategorySelect) {
    weaponCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponCategorySelect.disabled = true;
  }
  if (weaponClassSelect) {
    weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponClassSelect.disabled = true;
  }
  if (weaponNameSelect) {
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de catégorie d'arme
 * @param {string} type - Type d'arme
 */
function buildWeaponCategoryOptions(type) {
  const categories = [
    ...new Set(store.weaponsData.filter((weapon) => weapon.type === type).map((weapon) => weapon.category))
  ].filter(Boolean);
  if (weaponCategorySelect) {
    weaponCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
    weaponCategorySelect.disabled = false;
  }
  if (weaponClassSelect) {
    weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponClassSelect.disabled = true;
  }
  if (weaponNameSelect) {
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de classe d'arme
 * @param {string} type - Type d'arme
 * @param {string} category - Catégorie d'arme
 */
function buildWeaponClassOptions(type, category) {
  const classes = [
    ...new Set(store.weaponsData.filter((weapon) => weapon.type === type && weapon.category === category).map((weapon) => weapon.class))
  ].filter(Boolean);
  if (weaponClassSelect) {
    weaponClassSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...classes.map((className) => `<option value="${className}">${className}</option>`)].join('');
    weaponClassSelect.disabled = false;
  }
  if (weaponNameSelect) {
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de nom d'arme
 * @param {string} type - Type d'arme
 * @param {string} category - Catégorie d'arme
 * @param {string} className - Classe d'arme
 */
function buildWeaponNameOptions(type, category, className) {
  const names = [
    ...new Set(store.weaponsData.filter((weapon) => weapon.type === type && weapon.category === category && weapon.class === className).map((weapon) => weapon.name))
  ].filter(Boolean);
  if (weaponNameSelect) {
    weaponNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
    weaponNameSelect.disabled = false;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de type médical
 */
function buildMedicalTypeOptions() {
  const types = [...new Set(store.medicalData.map((item) => item.type))].filter(Boolean);
  if (medicalTypeSelect) {
    medicalTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
    medicalTypeSelect.disabled = false;
  }
  if (medicalCategorySelect) {
    medicalCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalCategorySelect.disabled = true;
  }
  if (medicalNameSelect) {
    medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de catégorie médicale
 * @param {string} type - Type médical
 */
function buildMedicalCategoryOptions(type) {
  const categories = [...new Set(store.medicalData.filter((item) => item.type === type).map((item) => item.category))].filter(Boolean);
  if (medicalCategorySelect) {
    medicalCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
    medicalCategorySelect.disabled = false;
  }
  if (medicalNameSelect) {
    medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de nom médical
 * @param {string} type - Type médical
 * @param {string} category - Catégorie médicale
 */
function buildMedicalNameOptions(type, category) {
  const names = store.medicalData.filter((item) => item.type === type && item.category === category).map((item) => item.name);
  if (medicalNameSelect) {
    medicalNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
    medicalNameSelect.disabled = false;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de type d'équipement
 */
function buildEquipmentTypeOptions() {
  const types = [...new Set(store.equipmentData.map((item) => item.type))].filter(Boolean);
  if (equipmentTypeSelect) {
    equipmentTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
    equipmentTypeSelect.disabled = false;
  }
  if (equipmentCategorySelect) {
    equipmentCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentCategorySelect.disabled = true;
  }
  if (equipmentNameSelect) {
    equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de catégorie d'équipement
 * @param {string} type - Type d'équipement
 */
function buildEquipmentCategoryOptions(type) {
  const categories = [...new Set(store.equipmentData.filter((item) => item.type === type).map((item) => item.category))].filter(Boolean);
  if (equipmentCategorySelect) {
    equipmentCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
    equipmentCategorySelect.disabled = false;
  }
  if (equipmentNameSelect) {
    equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentNameSelect.disabled = true;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Construit les options de nom d'équipement
 * @param {string} type - Type d'équipement
 * @param {string} category - Catégorie d'équipement
 */
function buildEquipmentNameOptions(type, category) {
  const names = store.equipmentData.filter((item) => item.type === type && item.category === category).map((item) => item.name);
  if (equipmentNameSelect) {
    equipmentNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
    equipmentNameSelect.disabled = false;
  }
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Met à jour l'état du bouton d'ajout d'item
 */
function updateAddItemButtonState() {
  if (!confirmAddInventoryItemBtn || !weaponNameSelect || !medicalNameSelect || 
      !equipmentNameSelect || !otherItemName || !otherItemWeight) return;
  
  const weaponVisible = weaponNameSelect.value !== '';
  const medicalVisible = medicalNameSelect.value !== '';
  const equipmentVisible = equipmentNameSelect.value !== '';
  const otherVisible = otherItemName.value.trim() !== '' && 
                     otherItemWeight.value !== '' && 
                     parseFloat(otherItemWeight.value) > 0;
  const visible = weaponVisible || medicalVisible || equipmentVisible || otherVisible;
  
  confirmAddInventoryItemBtn.classList.toggle('hidden', !visible);
  confirmAddInventoryItemBtn.disabled = !visible;
}

/**
 * Gère le changement de type d'item à ajouter
 */
function onAddItemTypeChange() {
  if (!weaponSelectorSection || !medicalSelectorSection || !equipmentSelectorSection || 
      !otherSelectorSection || !addItemTypeSelect) return;
  
  const selected = addItemTypeSelect.value;
  
  if (weaponSelectorSection) weaponSelectorSection.classList.toggle('hidden', selected !== 'Armes');
  if (medicalSelectorSection) medicalSelectorSection.classList.toggle('hidden', selected !== 'Medical');
  if (equipmentSelectorSection) equipmentSelectorSection.classList.toggle('hidden', selected !== 'Equipement');
  if (otherSelectorSection) otherSelectorSection.classList.toggle('hidden', selected !== 'Autre');
  
  if (selected === 'Armes') {
    loadWeaponsData().then(() => {
      buildWeaponTypeOptions();
    });
  } else if (selected === 'Medical') {
    loadMedicalData().then(() => {
      buildMedicalTypeOptions();
    });
  } else if (selected === 'Equipement') {
    loadEquipmentData().then(() => {
      buildEquipmentTypeOptions();
    });
  } else if (selected === 'Autre') {
    if (otherItemName) otherItemName.value = '';
    if (otherItemDescription) otherItemDescription.value = '';
    if (otherItemWeight) otherItemWeight.value = '';
    updateAddItemButtonState();
  } else {
    // Réinitialiser tous
    resetAllSelectors();
  }
}

/**
 * Réinitialise tous les sélecteurs
 */
function resetAllSelectors() {
  const selectors = [
    weaponTypeSelect, weaponCategorySelect, weaponClassSelect, weaponNameSelect,
    medicalTypeSelect, medicalCategorySelect, medicalNameSelect,
    equipmentTypeSelect, equipmentCategorySelect, equipmentNameSelect
  ];
  
  selectors.forEach(select => {
    if (select) {
      select.innerHTML = '<option value="">Sélectionnez</option>';
      select.disabled = true;
    }
  });
  
  if (otherItemName) otherItemName.value = '';
  if (otherItemDescription) otherItemDescription.value = '';
  if (otherItemWeight) otherItemWeight.value = '';
  if (otherSelectorSection) otherSelectorSection.classList.add('hidden');
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

/**
 * Ouvre le modal d'ajout d'item
 */
export function openAddItemModal() {
  resetAddItemModal();
  showModal(addItemModal);
}

// ============================================================================
// FONCTIONS D'AJOUT D'ITEMS À L'INVENTAIRE
// ============================================================================

/**
 * Ajoute une arme à l'inventaire
 * @returns {Promise<void>}
 */
async function addSelectedWeaponToInventory() {
  if (!store.currentAgent || !addItemTypeSelect || !weaponTypeSelect || !weaponCategorySelect || 
      !weaponClassSelect || !weaponNameSelect) return;
  if (addItemTypeSelect.value !== 'Armes') return;
  
  const selectedType = weaponTypeSelect.value;
  const selectedCategory = weaponCategorySelect.value;
  const selectedClass = weaponClassSelect.value;
  const selectedName = weaponNameSelect.value;
  
  const weapon = store.weaponsData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.class === selectedClass &&
      item.name === selectedName
  );
  
  if (!weapon) return;
  
  const currentAgent = store.currentAgent;
  const newInventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { 
      name: weapon.name, 
      category: weapon.category, 
      weight: Number(weapon.weight), 
      type: weapon.type, 
      class: weapon.class 
    },
  ];
  store.updateCurrentAgent('inventory', newInventory);
  
  renderInventory(store.currentAgent);
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet "${weapon.name}" ajouté à l'inventaire.`);
}

/**
 * Ajoute un item médical à l'inventaire
 * @returns {Promise<void>}
 */
async function addSelectedMedicalToInventory() {
  if (!store.currentAgent || !addItemTypeSelect || !medicalTypeSelect || !medicalCategorySelect || !medicalNameSelect) return;
  if (addItemTypeSelect.value !== 'Medical') return;
  
  const selectedType = medicalTypeSelect.value;
  const selectedCategory = medicalCategorySelect.value;
  const selectedName = medicalNameSelect.value;
  
  const medical = store.medicalData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.name === selectedName
  );
  
  if (!medical) return;
  
  const currentAgent = store.currentAgent;
  const newInventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { 
      name: medical.name, 
      category: medical.category, 
      weight: Number(medical.weight), 
      type: medical.type 
    },
  ];
  store.updateCurrentAgent('inventory', newInventory);
  
  renderInventory(store.currentAgent);
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet "${medical.name}" ajouté à l'inventaire.`);
}

/**
 * Ajoute un équipement à l'inventaire
 * @returns {Promise<void>}
 */
async function addSelectedEquipmentToInventory() {
  if (!store.currentAgent || !addItemTypeSelect || !equipmentTypeSelect || !equipmentCategorySelect || !equipmentNameSelect) return;
  if (addItemTypeSelect.value !== 'Equipement') return;
  
  const selectedType = equipmentTypeSelect.value;
  const selectedCategory = equipmentCategorySelect.value;
  const selectedName = equipmentNameSelect.value;
  
  const equipment = store.equipmentData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.name === selectedName
  );
  
  if (!equipment) return;
  
  const currentAgent = store.currentAgent;
  const newInventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { 
      name: equipment.name, 
      category: equipment.category, 
      weight: Number(equipment.weight), 
      type: equipment.type 
    },
  ];
  store.updateCurrentAgent('inventory', newInventory);
  
  renderInventory(store.currentAgent);
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet "${equipment.name}" ajouté à l'inventaire.`);
}

/**
 * Ajoute un item personnalisé à l'inventaire
 * @returns {Promise<void>}
 */
async function addSelectedOtherToInventory() {
  if (!store.currentAgent || !otherItemName || !otherItemWeight) return;
  
  const name = otherItemName.value.trim();
  const description = otherItemDescription?.value?.trim() || '';
  const weight = parseFloat(otherItemWeight.value);
  
  if (!name || isNaN(weight) || weight <= 0) {
    showToast('Veuillez saisir un nom valide et un poids supérieur à 0.');
    return;
  }
  
  const currentAgent = store.currentAgent;
  const newInventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { name, description, weight: Number(weight), category: 'Autre' },
  ];
  store.updateCurrentAgent('inventory', newInventory);
  
  renderInventory(store.currentAgent);
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet "${name}" ajouté à l'inventaire.`);
}

// ============================================================================
// SUPPRESSION D'ITEMS
// ============================================================================

/**
 * Ouvre la confirmation de suppression
 * @param {number} index - Index de l'item
 */
export function openDeleteItem(index) {
  store.setPendingDeleteIndex(index);
  showModal(deleteItemModal);
}

/**
 * Confirme la suppression d'un item
 * @returns {Promise<void>}
 */
async function confirmDeleteItem() {
  if (store.pendingDeleteIndex === null || !store.currentAgent) return;
  
  const currentAgent = store.currentAgent;
  const newInventory = currentAgent.inventory.filter((_, index) => index !== store.pendingDeleteIndex);
  store.setPendingDeleteIndex(null);
  store.updateCurrentAgent('inventory', newInventory);
  
  hideModal(deleteItemModal);
  renderInventory(store.currentAgent);
  await persistCurrentAgent();
  showToast('Objet supprimé de votre inventaire.');
}

/**
 * Annule la suppression
 */
export function cancelDeleteItem() {
  store.setPendingDeleteIndex(null);
  hideModal(deleteItemModal);
}

// ============================================================================
// DÉTAILS D'ITEM
// ============================================================================

/**
 * Ouvre les détails d'un item
 * @param {number} index - Index de l'item
 * @returns {Promise<void>}
 */
export async function openItemDetails(index) {
  const item = store.currentAgent?.inventory?.[index];
  if (!item || !itemDetailsContent) return;

  let source = item;
  let isWeapon = false;
  let isMedical = false;
  let isEquipment = false;

  // Chercher dans les armes
  if (item.class || item.type === 'Armes légères' || item.category?.includes('Armes')) {
    await loadWeaponsData();
    const weapon = store.weaponsData.find((weaponItem) => {
      const sameName = weaponItem.name === item.name;
      const sameType = !item.type || weaponItem.type === item.type;
      const sameCategory = !item.category || weaponItem.category === item.category;
      const sameClass = !item.class || weaponItem.class === item.class;
      return sameName && sameType && sameCategory && sameClass;
    });
    if (weapon) {
      source = weapon;
      isWeapon = true;
    }
  }

  // Chercher dans le médical
  if (!isWeapon && (item.range || ['Injection', 'Electronique', 'Application'].includes(item.category))) {
    await loadMedicalData();
    const medical = store.medicalData.find((medicalItem) => {
      const sameName = medicalItem.name === item.name;
      const sameType = !item.type || medicalItem.type === item.type;
      const sameCategory = !item.category || medicalItem.category === item.category;
      return sameName && sameType && sameCategory;
    });
    if (medical) {
      source = medical;
      isMedical = true;
    }
  }

  // Chercher dans l'équipement
  if (!isWeapon && !isMedical && item.effect && ['Armure'].includes(item.category)) {
    await loadEquipmentData();
    const equipment = store.equipmentData.find((equipmentItem) => {
      const sameName = equipmentItem.name === item.name;
      const sameType = !item.type || equipmentItem.type === item.type;
      const sameCategory = !item.category || equipmentItem.category === item.category;
      return sameName && sameType && sameCategory;
    });
    if (equipment) {
      source = equipment;
      isEquipment = true;
    }
  }

  let details = '';
  let fallback = '';

  if (isEquipment && source.effect) {
    details = `
      <div class="item-detail-row"><strong>Nom :</strong> ${sanitizeText(source.name || '—')}</div>
      <div class="item-detail-row description-only">${sanitizeText(source.description || 'Aucune description disponible.')}</div>
      <div class="item-detail-row"><strong>Effet :</strong> ${sanitizeText(source.effect || '—')}</div>
      <div class="item-detail-row"><strong>Poids :</strong> ${sanitizeText(source.weight ? `${source.weight} kg` : '—')}</div>
    `;
  } else if (isMedical && source.range) {
    details = `
      <div class="item-detail-row"><strong>Nom :</strong> ${sanitizeText(source.name || '—')}</div>
      <div class="item-detail-row"><strong>Portée :</strong> ${sanitizeText(source.range || '—')}</div>
      <div class="item-detail-row description-only">${sanitizeText(source.description || 'Aucune description disponible.')}</div>
      <div class="item-detail-row"><strong>Poids :</strong> ${sanitizeText(source.weight ? `${source.weight} kg` : '—')}</div>
    `;
  } else if (item.category === 'Autre' && item.name) {
    details = `
      <div class="item-detail-row"><strong>Nom :</strong> ${sanitizeText(item.name || '—')}</div>
      ${item.description ? `<div class="item-detail-row description-only">${sanitizeText(item.description)}</div>` : ''}
      <div class="item-detail-row"><strong>Poids :</strong> ${sanitizeText(item.weight ? `${item.weight} kg` : '—')}</div>
    `;
  } else if (isWeapon || (!isMedical && !isEquipment)) {
    details = Object.entries(source)
      .filter(([key, value]) => value !== undefined && value !== null && key !== 'id')
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (chr) => chr.toUpperCase());
        return `<div class="item-detail-row"><strong>${label} :</strong> ${String(value)}</div>`;
      })
      .join('');
    fallback = isWeapon
      ? ''
      : '<div class="item-detail-row">Aucune information supplémentaire disponible.</div>';
  }

  itemDetailsContent.innerHTML = `
    <div class="item-detail-card">
      ${details}
      ${fallback}
    </div>
  `;
  showModal(itemDetailsModal);
}

/**
 * Ferme les détails d'un item
 */
export function closeItemDetails() {
  hideModal(itemDetailsModal);
}

// ============================================================================
// TALENTS
// ============================================================================

/**
 * Sélectionne un talent disponible
 * @param {Object} talent - Talent sélectionné
 * @param {HTMLElement} tile - Élément DOM de la tuile
 */
export function selectAvailableTalent(talent, tile) {
  if (!talent || !talent.id) return;

  if (store.selectedAgentTalentId === String(talent.id)) {
    if (store.selectedAgentTalentTile) {
      store.selectedAgentTalentTile.classList.remove('selected');
    }
    store.resetSelectedAgentTalent();
  } else {
    if (store.selectedAgentTalentTile) {
      store.selectedAgentTalentTile.classList.remove('selected');
    }
    store.setSelectedAgentTalent(talent);
    store.setSelectedAgentTalentId(String(talent.id));
    store.setSelectedAgentTalentTile(tile);
    tile.classList.add('selected');
  }

  const confirmTalentBtnEl = document.getElementById('confirmTalentBtn');
  if (confirmTalentBtnEl) {
    confirmTalentBtnEl.disabled = !store.selectedAgentTalentId;
  }
}

/**
 * Confirme la sélection d'un talent
 * @returns {Promise<void>}
 */
export async function confirmTalentSelection() {
  if (!store.currentAgent) {
    showToast('Aucun agent sélectionné.');
    return;
  }
  if (!store.selectedAgentTalent || !store.selectedAgentTalent.id) {
    showToast('Veuillez sélectionner un talent valide.');
    return;
  }
  if (Number(store.currentAgent.availableTalentPoints ?? 0) <= 0) {
    showToast('Aucun point de talent disponible.');
    return;
  }

  const currentAgent = { ...store.currentAgent };
  currentAgent.availableTalentPoints = Math.max(0, Number(currentAgent.availableTalentPoints ?? 0) - 1);
  currentAgent.availableStatsPoints = Math.max(0, Number(currentAgent.availableStatsPoints ?? 0) - 1);
  
  // Sauvegarder le titre avant réinitialisation
  const talentTitle = store.selectedAgentTalent.title;
  
  // Utiliser l'ID du talent directement depuis selectedAgentTalent
  currentAgent.talents = Array.isArray(currentAgent.talents)
    ? [...currentAgent.talents, { ...store.selectedAgentTalent, id: String(store.selectedAgentTalent.id) }]
    : [{ ...store.selectedAgentTalent, id: String(store.selectedAgentTalent.id) }];
  
  store.setCurrentAgent(currentAgent);

  // Re-rendre l'agent pour mettre à jour les points
  const { renderAgent } = await import('./ui.js');
  await renderAgent(store.currentAgent);
  
  await persistCurrentAgent();
  await renderTalentsScreen();
  showToast(`Talent activé : ${talentTitle}`);
}

/**
 * Rendu de l'écran des talents
 * @returns {Promise<void>}
 */
export async function renderTalentsScreen() {
  const talentsContainerEl = document.getElementById('talentsContainer');
  const talentsAvailableContainerEl = document.getElementById('talentsAvailableContainer');
  const confirmTalentBtnEl = document.getElementById('confirmTalentBtn');
  
  if (!talentsContainerEl || !talentsAvailableContainerEl || !store.currentAgent) return;

  // Réinitialiser la sélection
  store.resetSelectedAgentTalent();
  
  if (confirmTalentBtnEl) {
    confirmTalentBtnEl.disabled = true;
    confirmTalentBtnEl.title = 'Sélectionnez un talent disponible pour activer.';
  }

  try {
    const [activeResponse, allResponse] = await Promise.all([
      fetch(`/api/agents/${store.currentAgent.id}/talents`),
      fetch('/api/talents'),
    ]);

    if (!activeResponse.ok) {
      throw new Error(`Erreur lors du chargement des talents actifs: ${activeResponse.status}`);
    }
    if (!allResponse.ok) {
      throw new Error(`Erreur lors du chargement des talents disponibles: ${allResponse.status}`);
    }

    const activeTalents = await activeResponse.json();
    const allTalentsPayload = await allResponse.json();
    const allTalents = Array.isArray(allTalentsPayload)
      ? allTalentsPayload
      : Array.isArray(allTalentsPayload.talents)
      ? allTalentsPayload.talents
      : [];

    const activeIds = new Set((activeTalents || []).map((talent) => talent.id));
    const availableTalents = allTalents.filter((talent) => !activeIds.has(talent.id));
    const hasTalentPoints = Number(store.currentAgent.availableTalentPoints ?? 0) > 0;

    talentsContainerEl.innerHTML = '';
    talentsAvailableContainerEl.innerHTML = '';
    talentsAvailableContainerEl.classList.toggle('talents-available-disabled', !hasTalentPoints);

    if (!activeTalents || !activeTalents.length) {
      talentsContainerEl.innerHTML = '<div class="talents-empty">Aucun talent actif.</div>';
    } else {
      activeTalents.forEach((talent) => {
        const tile = createTalentTile(talent, false, false);
        talentsContainerEl.appendChild(tile);
      });
    }

    if (!availableTalents.length) {
      talentsAvailableContainerEl.innerHTML = '<div class="talents-empty">Aucun talent disponible.</div>';
    } else {
      availableTalents.forEach((talent) => {
        const tile = createTalentTile(talent, true, !hasTalentPoints);
        if (!hasTalentPoints) {
          tile.style.cursor = 'not-allowed';
        } else {
          tile.style.cursor = 'pointer';
          tile.addEventListener('click', () => selectAvailableTalent(talent, tile));
        }
        talentsAvailableContainerEl.appendChild(tile);
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des talents:', error);
    talentsContainerEl.innerHTML = '<div class="talents-empty">Erreur de chargement des talents.</div>';
    talentsAvailableContainerEl.innerHTML = '<div class="talents-empty">Erreur de chargement des talents.</div>';
  }
}

// ============================================================================
// COMPÉTENCES
// ============================================================================

// Note: La logique des compétences est complexe et sera ajoutée dans une prochaine itération
// Pour l'instant, on garde une fonction vide qui sera implémentée plus tard

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Gère le clic sur un message pour le déployer/réduire
 * @param {Event} event - Événement click
 */
export async function handleMessageToggle(event) {
  const button = event.target.closest('.message-toggle');
  if (!button) return;
  const messageId = Number(button.dataset.messageId);
  if (!messageId) return;

  if (store.expandedMessageIds.has(messageId)) {
    store.expandedMessageIds.delete(messageId);
  } else {
    store.expandedMessageIds.add(messageId);
    // Marquer le message comme lu
    const message = store.currentAgentMessages.find(m => m.id == messageId);
    if (message && message.is_read !== true) {
      try {
        await requestJson(`/api/messages/${messageId}/read`, { method: 'PATCH' });
        message.is_read = true;
        updateMessagesButtonLabel();
      } catch (error) {
        console.error('Erreur lors du marquage du message comme lu:', error);
      }
    }
  }

  // Re-rendre les messages
  const messages = store.currentAgentMessages.map(m => ({
    ...m,
    expanded: store.expandedMessageIds.has(m.id)
  }));
  renderMessages(messages);
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise tous les écouteurs d'événements
 */
export function initEventListeners() {
  // Boutons de navigation principale
  const inventoryBtnEl = document.getElementById('inventoryBtn');
  const skillsBtnEl = document.getElementById('skillsBtn');
  const attributesBtnEl = document.getElementById('attributesBtn');
  const competencesBtnEl = document.getElementById('competencesBtn');
  const talentsBtnEl = document.getElementById('talentsBtn');
  const messagesBtnEl = document.getElementById('messagesBtn');
  
  if (inventoryBtnEl) inventoryBtnEl.addEventListener('click', () => {
    openInventoryScreen();
    renderInventory(store.currentAgent);
  });
  
  if (skillsBtnEl) skillsBtnEl.addEventListener('click', () => {
    initializeSkillsState();
    openSkillsScreen();
    updateSkillsScreen();
  });
  
  if (attributesBtnEl) attributesBtnEl.addEventListener('click', () => {
    initializeAttributesState();
    openAttributesScreen();
    updateAttributesScreen();
  });
  
  if (competencesBtnEl) competencesBtnEl.addEventListener('click', openCompetencesScreen);
  if (talentsBtnEl) talentsBtnEl.addEventListener('click', async () => {
    openTalentsScreen();
    await renderTalentsScreen();
  });
  if (messagesBtnEl) messagesBtnEl.addEventListener('click', async () => {
    await openMessagesScreen();
  });
  
  // Inventaire
  if (addInventoryItemBtn) addInventoryItemBtn.addEventListener('click', openAddItemModal);
  if (closeAddItemModalBtn) closeAddItemModalBtn.addEventListener('click', () => hideModal(addItemModal));
  if (closeItemDetailsBtn) closeItemDetailsBtn.addEventListener('click', closeItemDetails);
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeleteItem);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', cancelDeleteItem);
  
  // Sélecteurs d'items
  if (addItemTypeSelect) addItemTypeSelect.addEventListener('change', onAddItemTypeChange);
  if (weaponTypeSelect) weaponTypeSelect.addEventListener('change', () => {
    if (weaponTypeSelect.value) buildWeaponCategoryOptions(weaponTypeSelect.value);
  });
  if (weaponCategorySelect) weaponCategorySelect.addEventListener('change', () => {
    if (weaponTypeSelect.value && weaponCategorySelect.value) {
      buildWeaponClassOptions(weaponTypeSelect.value, weaponCategorySelect.value);
    }
  });
  if (weaponClassSelect) weaponClassSelect.addEventListener('change', () => {
    if (weaponTypeSelect.value && weaponCategorySelect.value && weaponClassSelect.value) {
      buildWeaponNameOptions(weaponTypeSelect.value, weaponCategorySelect.value, weaponClassSelect.value);
    }
  });
  if (weaponNameSelect) weaponNameSelect.addEventListener('change', updateAddItemButtonState);
  
  if (medicalTypeSelect) medicalTypeSelect.addEventListener('change', () => {
    if (medicalTypeSelect.value) buildMedicalCategoryOptions(medicalTypeSelect.value);
  });
  if (medicalCategorySelect) medicalCategorySelect.addEventListener('change', () => {
    if (medicalTypeSelect.value && medicalCategorySelect.value) {
      buildMedicalNameOptions(medicalTypeSelect.value, medicalCategorySelect.value);
    }
  });
  if (medicalNameSelect) medicalNameSelect.addEventListener('change', updateAddItemButtonState);
  
  if (equipmentTypeSelect) equipmentTypeSelect.addEventListener('change', () => {
    if (equipmentTypeSelect.value) buildEquipmentCategoryOptions(equipmentTypeSelect.value);
  });
  if (equipmentCategorySelect) equipmentCategorySelect.addEventListener('change', () => {
    if (equipmentTypeSelect.value && equipmentCategorySelect.value) {
      buildEquipmentNameOptions(equipmentTypeSelect.value, equipmentCategorySelect.value);
    }
  });
  if (equipmentNameSelect) equipmentNameSelect.addEventListener('change', updateAddItemButtonState);
  
  // Champs personnalisés
  if (otherItemName) otherItemName.addEventListener('input', updateAddItemButtonState);
  if (otherItemDescription) otherItemDescription.addEventListener('input', updateAddItemButtonState);
  if (otherItemWeight) otherItemWeight.addEventListener('input', updateAddItemButtonState);
  
  // Bouton de confirmation d'ajout
  if (confirmAddInventoryItemBtn) {
    confirmAddInventoryItemBtn.addEventListener('click', () => {
      if (addItemTypeSelect.value === 'Armes') {
        addSelectedWeaponToInventory();
      } else if (addItemTypeSelect.value === 'Medical') {
        addSelectedMedicalToInventory();
      } else if (addItemTypeSelect.value === 'Equipement') {
        addSelectedEquipmentToInventory();
      } else if (addItemTypeSelect.value === 'Autre') {
        addSelectedOtherToInventory();
      }
    });
  }
  
  // Clic sur les items de l'inventaire
  if (inventoryList) {
    inventoryList.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.inventory-delete-btn');
      const itemButton = event.target.closest('.inventory-item-button');
      if (deleteButton) {
        const index = Number(deleteButton.dataset.index);
        openDeleteItem(index);
        return;
      }
      if (itemButton) {
        const index = Number(itemButton.dataset.index);
        openItemDetails(index);
      }
    });
  }
  
  // Messages
  if (messagesView) {
    messagesView.addEventListener('click', handleMessageToggle);
  }
  
  // Talents
  if (confirmTalentBtn) {
    confirmTalentBtn.addEventListener('click', confirmTalentSelection);
  }
  
  // Compétences
  if (closeCompetenceDescBtn) closeCompetenceDescBtn.addEventListener('click', hideCompetenceDescription);
  if (competenceDescModal) {
    competenceDescModal.addEventListener('click', (e) => {
      if (e.target === competenceDescModal) hideCompetenceDescription();
    });
  }
  
  // Stats et attributs
  if (skillsView) {
    skillsView.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stat]');
      if (!button) return;
      const stat = button.dataset.stat;
      const action = button.dataset.action || 'increase';
      if (stat) {
        changeSkillStat(stat, action);
      }
    });
  }
  
  if (attributesView) {
    attributesView.addEventListener('click', (event) => {
      const button = event.target.closest('[data-attr]');
      if (!button) return;
      const attr = button.dataset.attr;
      const action = button.dataset.action || 'increase';
      if (attr) {
        changeAttributeStat(attr, action);
      }
    });
  }
  
  // Boutons de sauvegarde
  if (saveSkillsBtn) saveSkillsBtn.addEventListener('click', saveSkillsAllocation);
  if (saveAttributesBtn) saveAttributesBtn.addEventListener('click', saveAttributesAllocation);
  
  // Wizard
  if (wizardBack) {
    wizardBack.addEventListener('click', () => {
      if (store.currentStep === 1) {
        showSection('landing');
        return;
      }
      showWizardStep(store.currentStep - 1);
    });
  }
  
  if (wizardNext) {
    wizardNext.addEventListener('click', async () => {
      if (store.currentStep === 7) {
        const data = getWizardData();
        if (!validateStep(7)) {
          showToast('Vérifiez que le mot de passe est renseigné.');
          return;
        }
        if (findAgent(data.name, data.firstName)) {
          showToast('Cet agent existe déjà. Choisissez un autre nom.');
          return;
        }
        try {
          await createAgentAPI(data);
          showAgentCreatedPopup();
          resetWizard();
        } catch (error) {
          console.log('Erreur lors de la création dans game.js:', error);
          if (error.status === 409) {
            showToast('Cet agent existe déjà. Choisissez un autre nom.');
          } else {
            showToast('Erreur lors de la création de l\'agent.');
          }
        }
        return;
      }
      if (!validateStep(store.currentStep)) {
        showToast('Complétez cette étape avant de continuer.');
        return;
      }
      showWizardStep(store.currentStep + 1);
    });
  }
  
  if (wizardStepNav) {
    wizardStepNav.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-step]');
      if (!button) return;
      const targetStep = Number(button.dataset.step);
      if (targetStep > visitedStep) {
        showToast('Complétez les étapes précédentes avant de passer ici.');
        return;
      }
      showWizardStep(targetStep);
    });
  }
  
  // Talents dans le wizard
  if (talentPrev) talentPrev.addEventListener('click', () => navigateTalent(-1));
  if (talentNext) talentNext.addEventListener('click', () => navigateTalent(1));
  if (chooseTalentBtn) chooseTalentBtn.addEventListener('click', chooseTalent);
  
  // Champs du wizard
  if (agentInputs.lastName) agentInputs.lastName.addEventListener('input', updateWizardButton);
  if (agentInputs.firstName) agentInputs.firstName.addEventListener('input', updateWizardButton);
  if (agentInputs.age) agentInputs.age.addEventListener('input', updateWizardButton);
  if (agentInputs.sex) agentInputs.sex.addEventListener('change', updateWizardButton);
  if (agentInputs.profession) agentInputs.profession.addEventListener('input', updateWizardButton);
  if (agentInputs.familyStatus) agentInputs.familyStatus.addEventListener('change', updateWizardButton);
  if (agentInputs.children) agentInputs.children.addEventListener('change', updateWizardButton);
  if (agentInputs.story) {
    agentInputs.story.addEventListener('input', () => {
      if (storyCount) storyCount.textContent = String(agentInputs.story.value.length);
      updateWizardButton();
    });
  }
  if (agentInputs.password) agentInputs.password.addEventListener('input', updateWizardButton);
  
  // Boutons +/- du wizard
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const attr = button.dataset.attr;
    const action = button.dataset.action;
    if (attr && action) {
      changeAttribute(attr, action);
    }
  });
}

// ============================================================================
// FONCTIONS DE STATS ET ATTRIBUTS
// ============================================================================

/**
 * Initialise l'état des stats
 */
export function initializeSkillsState() {
  const agentStats = store.currentAgent?.stats || { speed: 1, resilience: 1, vigor: 1 };
  
  Object.assign(store.baseStats, {
    speed: Number(agentStats.speed ?? 1),
    resilience: Number(agentStats.resilience ?? 1),
    vigor: Number(agentStats.vigor ?? 1),
  });
  
  Object.assign(store.skillsState, {
    reserve: Number(store.currentAgent?.availableStatsPoints ?? 0),
    stats: {
      speed: Number(agentStats.speed ?? 1),
      resilience: Number(agentStats.resilience ?? 1),
      vigor: Number(agentStats.vigor ?? 1),
    },
  });
}

/**
 * Initialise l'état des attributs
 */
export function initializeAttributesState() {
  const agentAttributes = store.currentAgent?.attributes || { conscience: 1, dexterity: 1, technique: 1 };
  
  Object.assign(store.baseAttributes, {
    conscience: Number(agentAttributes.conscience ?? 1),
    dexterity: Number(agentAttributes.dexterity ?? 1),
    technique: Number(agentAttributes.technique ?? 1),
  });
  
  Object.assign(store.attributesState, {
    reserve: Number(store.currentAgent?.availableAttributesPoints ?? 0),
    attributes: {
      conscience: Number(agentAttributes.conscience ?? 1),
      dexterity: Number(agentAttributes.dexterity ?? 1),
      technique: Number(agentAttributes.technique ?? 1),
    },
  });
  
  // Stocker les valeurs initiales
  Object.assign(store.attributesViewInitialValues, {
    conscience: store.attributesState.attributes.conscience,
    dexterity: store.attributesState.attributes.dexterity,
    technique: store.attributesState.attributes.technique,
  });
  
  // Réinitialiser les modifications
  Object.keys(store.attributesViewModifications).forEach(key => delete store.attributesViewModifications[key]);
}

/**
 * Met à jour l'écran des stats
 */
export function updateSkillsScreen() {
  renderSkillsScreen({
    reserve: store.skillsState.reserve,
    stats: store.skillsState.stats,
    baseStats: store.baseStats
  });
  updateSkillsButtons({ reserve: store.skillsState.reserve, stats: store.skillsState.stats, baseStats: store.baseStats });
}

/**
 * Met à jour l'écran des attributs
 */
export function updateAttributesScreen() {
  renderAttributesScreen({
    reserve: store.attributesState.reserve,
    attributes: store.attributesState.attributes,
    baseAttributes: store.baseAttributes
  });
  
  updateAttributesButtons({ reserve: store.attributesState.reserve, attributes: store.attributesState.attributes, baseAttributes: store.baseAttributes });
  
  // Vérifier si des modifications existent
  const hasModifications = Object.keys(store.attributesViewModifications).length > 0;
  updateSaveAttributesButtonState(hasModifications);
}

/**
 * Change la valeur d'une stat
 * @param {string} stat - Stat à modifier
 * @param {string} action - Action (increase/decrease)
 */
export function changeSkillStat(stat, action) {
  if (typeof store.skillsState.reserve !== 'number' || isNaN(store.skillsState.reserve)) {
    store.skillsState.reserve = Number(store.skillsState.reserve) || 0;
  }
  
  if (action === 'increase') {
    if (store.skillsState.reserve <= 0) return;
    store.skillsState.stats[stat] = (store.skillsState.stats[stat] || 0) + 1;
    store.skillsState.reserve -= 1;
  } else if (action === 'decrease') {
    if (store.skillsState.stats[stat] <= (store.baseStats[stat] || 1)) return;
    store.skillsState.stats[stat] = Math.max(store.baseStats[stat] || 1, store.skillsState.stats[stat] - 1);
    store.skillsState.reserve += 1;
  }
  
  // Mettre à jour currentAgent
  if (store.currentAgent) {
    store.currentAgent.stats = { ...store.currentAgent.stats, ...store.skillsState.stats };
    store.currentAgent.availableStatsPoints = store.skillsState.reserve;
  }
  
  updateSkillsScreen();
}

/**
 * Change la valeur d'un attribut
 * @param {string} attr - Attribut à modifier
 * @param {string} action - Action (increase/decrease)
 */
export function changeAttributeStat(attr, action) {
  if (typeof store.attributesState.reserve !== 'number' || isNaN(store.attributesState.reserve)) {
    store.attributesState.reserve = Number(store.attributesState.reserve) || 0;
  }
  
  const oldValue = store.attributesState.attributes[attr];
  
  if (action === 'increase') {
    if (store.attributesState.reserve <= 0) return;
    store.attributesState.attributes[attr] = (store.attributesState.attributes[attr] || 0) + 1;
    store.attributesState.reserve -= 1;
  } else if (action === 'decrease') {
    if (store.attributesState.attributes[attr] <= (store.baseAttributes[attr] || 1)) return;
    store.attributesState.attributes[attr] = Math.max(store.baseAttributes[attr] || 1, store.attributesState.attributes[attr] - 1);
    store.attributesState.reserve += 1;
  }
  
  // Mettre à jour currentAgent
  if (store.currentAgent) {
    store.currentAgent.attributes = { ...store.currentAgent.attributes, ...store.attributesState.attributes };
    store.currentAgent.availableAttributesPoints = store.attributesState.reserve;
  }
  
  // Marquer la modification
  const newValue = store.attributesState.attributes[attr];
  const initialValue = store.attributesViewInitialValues[attr];
  
  if (newValue !== initialValue) {
    store.attributesViewModifications[attr] = newValue;
  } else {
    delete store.attributesViewModifications[attr];
  }
  
  updateAttributesScreen();
}

/**
 * Sauvegarde l'allocation des stats
 * @returns {Promise<void>}
 */
async function saveSkillsAllocation() {
  if (!store.currentAgent) return;
  store.currentAgent.stats = { ...store.currentAgent.stats, ...store.skillsState.stats };
  store.currentAgent.availableStatsPoints = store.skillsState.reserve;
  await persistCurrentAgent();
  showToast('Compétences mises à jour.');
  
  const { renderAgent } = await import('./ui.js');
  await renderAgent(store.currentAgent);
  openDashboardView();
}

/**
 * Sauvegarde l'allocation des attributs
 * @returns {Promise<void>}
 */
async function saveAttributesAllocation() {
  if (!store.currentAgent) return;
  store.currentAgent.attributes = { ...store.currentAgent.attributes, ...store.attributesState.attributes };
  store.currentAgent.availableAttributesPoints = store.attributesState.reserve;
  await persistCurrentAgent();
  showToast('Attributs mis à jour.');
  
  // Réinitialiser les modifications
  Object.keys(store.attributesViewModifications).forEach(key => delete store.attributesViewModifications[key]);
  Object.keys(store.attributesViewInitialValues).forEach(key => delete store.attributesViewInitialValues[key]);
  
  const { renderAgent } = await import('./ui.js');
  await renderAgent(store.currentAgent);
  openDashboardView();
}
