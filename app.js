const sections = {
  landing: document.getElementById('landing'),
  createAgent: document.getElementById('createAgent'),
  mainPage: document.getElementById('mainPage'),
  competences: document.getElementById('competencesView'),
};
const loginForm = document.getElementById('loginForm');
const createAgentBtn = document.getElementById('createAgentBtn');
const logoutBtn = document.getElementById('logoutBtn');
const homeBtn = document.getElementById('homeBtn');
const brandTag = document.getElementById('brandTag');
const heroName = document.getElementById('heroName');
const heroLife = document.getElementById('heroLife');
const heroStatsPoints = document.getElementById('heroStatsPoints');
const heroAttrPoints = document.getElementById('heroAttrPoints');
const heroMission = document.getElementById('heroMission');
const missionDescription = document.getElementById('missionDescription');
const agentEffects = document.getElementById('agentEffects');
const toast = document.getElementById('toast');
const createAgentModal = document.getElementById('createAgentModal');
const activateAgentBtn = document.getElementById('activateAgentBtn');
const dashboardView = document.getElementById('dashboardView');
const inventoryView = document.getElementById('inventoryView');
const skillsView = document.getElementById('skillsView');
const attributesView = document.getElementById('attributesView');
const inventoryBtn = document.getElementById('inventoryBtn');
const skillsBtn = document.getElementById('skillsBtn');
const attributesBtn = document.getElementById('attributesBtn');
const competencesBtn = document.getElementById('competencesBtn');
const inventoryList = document.getElementById('inventoryList');
const inventoryCapacityLabel = document.getElementById('inventoryCapacity');
const inventoryWeight = document.getElementById('inventoryWeight');
const inventoryFill = document.getElementById('inventoryFill');
const addInventoryItemBtn = document.getElementById('addInventoryItemBtn');
const saveSkillsBtn = document.getElementById('saveSkillsBtn');
const saveAttributesBtn = document.getElementById('saveAttributesBtn');
const saveCompetencesBtn = document.getElementById('saveCompetencesBtn');
const competencesContainer = document.getElementById('competencesContainer');
const competenceDescModal = document.getElementById('competenceDescModal');
const closeCompetenceDescBtn = document.getElementById('closeCompetenceDescBtn');
const competenceDescContent = document.getElementById('competenceDescContent');
const skillsReserveCount = document.getElementById('skillsReserveCount');
const attributesReserveCount = document.getElementById('attributesReserveCount');
const deleteItemModal = document.getElementById('deleteItemModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const itemDetailsModal = document.getElementById('itemDetailsModal');
const closeItemDetailsBtn = document.getElementById('closeItemDetailsBtn');
const addItemModal = document.getElementById('addItemModal');
const closeAddItemModalBtn = document.getElementById('closeAddItemModalBtn');
const itemDetailsContent = document.getElementById('itemDetailsContent');
const addItemTypeSelect = document.getElementById('addItemTypeSelect');
const weaponTypeSelect = document.getElementById('weaponTypeSelect');
const weaponCategorySelect = document.getElementById('weaponCategorySelect');
const weaponClassSelect = document.getElementById('weaponClassSelect');
const weaponNameSelect = document.getElementById('weaponNameSelect');
const confirmAddInventoryItemBtn = document.getElementById('confirmAddInventoryItemBtn');
const weaponSelectorSection = document.getElementById('weaponSelectorSection');
const medicalTypeSelect = document.getElementById('medicalTypeSelect');
const medicalCategorySelect = document.getElementById('medicalCategorySelect');
const medicalNameSelect = document.getElementById('medicalNameSelect');
const medicalSelectorSection = document.getElementById('medicalSelectorSection');
const equipmentTypeSelect = document.getElementById('equipmentTypeSelect');
const equipmentCategorySelect = document.getElementById('equipmentCategorySelect');
const equipmentNameSelect = document.getElementById('equipmentNameSelect');
const equipmentSelectorSection = document.getElementById('equipmentSelectorSection');
const otherItemName = document.getElementById('otherItemName');
const otherItemDescription = document.getElementById('otherItemDescription');
const otherItemWeight = document.getElementById('otherItemWeight');
const otherSelectorSection = document.getElementById('otherSelectorSection');

const wizardStepNav = document.getElementById('wizardStepNav');
const wizardContent = document.getElementById('wizardContent');
const wizardBreadcrumb = document.getElementById('wizardBreadcrumb');
const wizardBack = document.getElementById('wizardBack');
const wizardNext = document.getElementById('wizardNext');
const chooseTalentBtn = document.getElementById('chooseTalentBtn');
const talentPrev = document.getElementById('talentPrev');
const talentNext = document.getElementById('talentNext');
const talentTitle = document.getElementById('talentTitle');
const talentDescription = document.getElementById('talentDescription');
const talentCard = document.getElementById('talentCard');
const storyCount = document.getElementById('storyCount');
const agentInputs = {
  lastName: document.getElementById('agentLastName'),
  firstName: document.getElementById('agentFirstName'),
  age: document.getElementById('agentAge'),
  sex: document.getElementById('agentSex'),
  profession: document.getElementById('agentProfession'),
  familyStatus: document.getElementById('agentFamilyStatus'),
  children: document.getElementById('agentChildren'),
  story: document.getElementById('agentStory'),
  password: document.getElementById('agentWizardPassword'),
};

const attributeValues = {
  speed: 1,
  resilience: 1,
  vigor: 1,
  conscience: 1,
  dexterity: 1,
  technique: 1,
};

const reserveValues = {
  stats: 2,
  attrs: 1,
};

let currentStep = 1;
let visitedStep = 1;
let talents = [];
let talentIndex = 0;
let selectedTalent = null;
let talentIdSelected = null;
let currentAgent = null;
let pendingDeleteIndex = null;
let weaponsData = [];
let medicalData = [];
let equipmentData = [];
let competencesHierarchy = [];
let competencesState = {};
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
let baseStats = {};
let baseAttributes = {};

const EFFECT_ICONS = {
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

const STORAGE_KEY = 'divisionAdventureAgents';
const SESSION_KEY = 'divisionAdventureSession';
const API_AGENTS_PATH = '/api/agents';

function getAgents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveAgents(agents) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

function saveSession(agent) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ agentId: agent.id, agentName: agent.name, timestamp: Date.now() })
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSection(name) {
  Object.values(sections).forEach((section) => section.classList.remove('active-page'));
  sections[name].classList.add('active-page');
  scrollToTop();

  if (name !== 'mainPage') {
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (homeBtn) homeBtn.classList.add('hidden');
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function showAgentCreatedPopup() {
  createAgentModal.classList.add('active');
}

function closeAgentCreatedPopup() {
  createAgentModal.classList.remove('active');
}

async function requestJson(url, options) {
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

function findAgent(name, firstName) {
  const agents = getAgents();
  return agents.find((agent) => {
    const matchesName = agent.name.toLowerCase() === name.toLowerCase();
    const matchesFirst = firstName ? agent.firstName.toLowerCase() === firstName.toLowerCase() : true;
    return matchesName && matchesFirst;
  });
}

function createDefaultAgent(data) {
  return {
    id: Date.now(),
    name: data.name,
    firstName: data.firstName,
    age: data.age,
    profession: data.profession,
    sex: data.sex,
    familyStatus: data.familyStatus,
    children: data.children,
    story: data.story,
    talent: data.talent,
    talentId: data.talentId,
    stats: data.stats,
    attributes: data.attributes,
    password: data.password,
    availableStatsPoints: 0,
    availableAttributesPoints: 0,
    lifePercent: 100,
    activeMission: 'Aucune affectation en cours. Agent disponible.',
    wounds: [],
    effects: [],
    inventoryCapacity: 30,
    inventory: [],
  };
}

function resetBrandTag() {
  if (brandTag) {
    brandTag.textContent = 'Aventure RPG Mobile';
  }
}

function getEffectIcon(effect) {
  return EFFECT_ICONS[effect.toLowerCase()] || '⚠️';
}

function sanitizeText(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openEffectDetails(effect) {
  if (!effect || !itemDetailsContent) return;

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

function renderAgent(agent) {
  currentAgent = agent;
  heroName.textContent = `${agent.firstName} ${agent.name}`;
  heroLife.textContent = `${agent.lifePercent ?? 100}%`;
  heroStatsPoints.textContent = String(agent.availableStatsPoints ?? 0);
  heroAttrPoints.textContent = String(agent.availableAttributesPoints ?? 0);
  heroMission.textContent = 'Tableau de bord de l’Aventure';
  missionDescription.textContent = agent.activeMission || agent.mission || 'Disponible, au QG';
  if (brandTag) {
    brandTag.textContent = `${agent.firstName} ${agent.name} - The DIVISION agent actif`;
  }
  if (agentEffects) {
    agentEffects.innerHTML = '';
    const rawEffects = [ ...(agent.assignedEffects || []), ...(agent.wounds || []), ...(agent.effects || []) ].filter(Boolean);

    if (rawEffects.length) {
      const normalized = rawEffects.map((item) => {
        if (typeof item === 'string') {
          return { name: item, icon: getEffectIcon(item), type: '', description: '', duration: '' };
        }
        const name = item.name || item.type || '';
        return {
          name,
          type: item.type,
          description: item.description,
          duration: item.duration,
          icon: getEffectIcon(name),
        };
      });

      const uniqueEffects = [...new Map(normalized.map((effect) => [effect.name.trim().toLowerCase(), effect])).values()];
      uniqueEffects.forEach((effect) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'effect-tile';
        tile.addEventListener('click', () => openEffectDetails(effect));

        const icon = document.createElement('span');
        icon.className = 'effect-tile-icon';
        icon.textContent = effect.icon;
        const label = document.createElement('span');
        label.className = 'effect-tile-label';
        label.textContent = effect.name;
        tile.append(icon, label);
        agentEffects.appendChild(tile);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'effects-empty';
      empty.textContent = 'Aucun effet actif.';
      agentEffects.appendChild(empty);
    }
  }
  if (inventoryCapacityLabel) {
    inventoryCapacityLabel.textContent = String(agent.inventoryCapacity ?? 30);
  }
  openDashboardView();
}

function showModal(modal) {
  if (modal) {
    modal.classList.add('active');
  }
}

function hideModal(modal) {
  if (modal) {
    modal.classList.remove('active');
  }
}

function loadWeaponsData() {
  if (weaponsData.length) {
    return Promise.resolve(weaponsData);
  }
  return requestJson('/json/Equipement/armes.json')
    .then((data) => {
      weaponsData = Array.isArray(data) ? data : [];
      return weaponsData;
    })
    .catch(() => {
      weaponsData = [];
      return weaponsData;
    });
}

function loadMedicalData() {
  if (medicalData.length) {
    return Promise.resolve(medicalData);
  }
  return requestJson('/json/Equipement/medical.json')
    .then((data) => {
      medicalData = Array.isArray(data) ? data : [];
      return medicalData;
    })
    .catch(() => {
      medicalData = [];
      return medicalData;
    });
}

function loadEquipmentData() {
  if (equipmentData.length) {
    return Promise.resolve(equipmentData);
  }
  return requestJson('/json/Equipement/equipement.json')
    .then((data) => {
      equipmentData = Array.isArray(data) ? data : [];
      return equipmentData;
    })
    .catch(() => {
      equipmentData = [];
      return equipmentData;
    });
}

function resetAddItemModal() {
  if (!addItemTypeSelect || !weaponTypeSelect || !weaponCategorySelect || !weaponClassSelect || !weaponNameSelect || !confirmAddInventoryItemBtn || !weaponSelectorSection || !medicalTypeSelect || !medicalCategorySelect || !medicalNameSelect || !medicalSelectorSection || !equipmentTypeSelect || !equipmentCategorySelect || !equipmentNameSelect || !equipmentSelectorSection || !otherItemName || !otherItemDescription || !otherItemWeight || !otherSelectorSection) {
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

function buildWeaponTypeOptions() {
  const types = [...new Set(weaponsData.map((weapon) => weapon.type))].filter(Boolean);
  weaponTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
  weaponTypeSelect.disabled = false;
  weaponCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponCategorySelect.disabled = true;
  weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponClassSelect.disabled = true;
  weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildWeaponCategoryOptions(type) {
  const categories = [
    ...new Set(
      weaponsData
        .filter((weapon) => weapon.type === type)
        .map((weapon) => weapon.category)
    ),
  ].filter(Boolean);
  weaponCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
  weaponCategorySelect.disabled = false;
  weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponClassSelect.disabled = true;
  weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildWeaponClassOptions(type, category) {
  const classes = [
    ...new Set(
      weaponsData
        .filter((weapon) => weapon.type === type && weapon.category === category)
        .map((weapon) => weapon.class)
    ),
  ].filter(Boolean);
  weaponClassSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...classes.map((className) => `<option value="${className}">${className}</option>`)].join('');
  weaponClassSelect.disabled = false;
  weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  weaponNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildWeaponNameOptions(type, category, className) {
  const names = [
    ...new Set(
      weaponsData
        .filter((weapon) => weapon.type === type && weapon.category === category && weapon.class === className)
        .map((weapon) => weapon.name)
    ),
  ].filter(Boolean);
  weaponNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
  weaponNameSelect.disabled = false;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function updateAddItemButtonState() {
  if (!confirmAddInventoryItemBtn || !weaponNameSelect || !medicalNameSelect || !equipmentNameSelect || !otherItemName || !otherItemWeight) return;
  const weaponVisible = weaponNameSelect.value !== '';
  const medicalVisible = medicalNameSelect.value !== '';
  const equipmentVisible = equipmentNameSelect.value !== '';
  const otherVisible = otherItemName.value.trim() !== '' && otherItemWeight.value !== '' && parseFloat(otherItemWeight.value) > 0;
  const visible = weaponVisible || medicalVisible || equipmentVisible || otherVisible;
  confirmAddInventoryItemBtn.classList.toggle('hidden', !visible);
  confirmAddInventoryItemBtn.disabled = !visible;
}

function buildMedicalTypeOptions() {
  const types = [...new Set(medicalData.map((item) => item.type))].filter(Boolean);
  medicalTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
  medicalTypeSelect.disabled = false;
  medicalCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalCategorySelect.disabled = true;
  medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildMedicalCategoryOptions(type) {
  const categories = [...new Set(medicalData.filter((item) => item.type === type).map((item) => item.category))].filter(Boolean);
  medicalCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
  medicalCategorySelect.disabled = false;
  medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  medicalNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildMedicalNameOptions(type, category) {
  const names = medicalData.filter((item) => item.type === type && item.category === category).map((item) => item.name);
  medicalNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
  medicalNameSelect.disabled = false;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildEquipmentTypeOptions() {
  const types = [...new Set(equipmentData.map((item) => item.type))].filter(Boolean);
  equipmentTypeSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...types.map((type) => `<option value="${type}">${type}</option>`)].join('');
  equipmentTypeSelect.disabled = false;
  equipmentCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentCategorySelect.disabled = true;
  equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildEquipmentCategoryOptions(type) {
  const categories = [...new Set(equipmentData.filter((item) => item.type === type).map((item) => item.category))].filter(Boolean);
  equipmentCategorySelect.innerHTML = ['<option value="">Sélectionnez</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)].join('');
  equipmentCategorySelect.disabled = false;
  equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
  equipmentNameSelect.disabled = true;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function buildEquipmentNameOptions(type, category) {
  const names = equipmentData.filter((item) => item.type === type && item.category === category).map((item) => item.name);
  equipmentNameSelect.innerHTML = ['<option value="">Sélectionnez</option>', ...names.map((name) => `<option value="${name}">${name}</option>`)].join('');
  equipmentNameSelect.disabled = false;
  confirmAddInventoryItemBtn.classList.add('hidden');
  confirmAddInventoryItemBtn.disabled = true;
}

function onAddItemTypeChange() {
  if (!weaponSelectorSection || !medicalSelectorSection || !equipmentSelectorSection || !otherSelectorSection || !addItemTypeSelect) return;
  const selected = addItemTypeSelect.value;
  weaponSelectorSection.classList.toggle('hidden', selected !== 'Armes');
  medicalSelectorSection.classList.toggle('hidden', selected !== 'Medical');
  equipmentSelectorSection.classList.toggle('hidden', selected !== 'Equipement');
  otherSelectorSection.classList.toggle('hidden', selected !== 'Autre');
  
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
    weaponTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponTypeSelect.disabled = true;
    weaponCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponCategorySelect.disabled = true;
    weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponClassSelect.disabled = true;
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
    medicalTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalTypeSelect.disabled = true;
    medicalCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalCategorySelect.disabled = true;
    medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalNameSelect.disabled = true;
    equipmentTypeSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentTypeSelect.disabled = true;
    equipmentCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentCategorySelect.disabled = true;
    equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentNameSelect.disabled = true;
    if (otherItemName) otherItemName.value = '';
    if (otherItemDescription) otherItemDescription.value = '';
    if (otherItemWeight) otherItemWeight.value = '';
    otherSelectorSection.classList.add('hidden');
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
  }
}

function onWeaponTypeChange() {
  const selectedType = weaponTypeSelect?.value;
  if (!selectedType) {
    weaponCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponCategorySelect.disabled = true;
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildWeaponCategoryOptions(selectedType);
}

function onMedicalTypeChange() {
  const selectedType = medicalTypeSelect?.value;
  if (!selectedType) {
    medicalCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalCategorySelect.disabled = true;
    medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildMedicalCategoryOptions(selectedType);
}

function onWeaponCategoryChange() {
  const selectedType = weaponTypeSelect?.value;
  const selectedCategory = weaponCategorySelect?.value;
  if (!selectedType || !selectedCategory) {
    weaponClassSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponClassSelect.disabled = true;
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildWeaponClassOptions(selectedType, selectedCategory);
}

function onMedicalCategoryChange() {
  const selectedType = medicalTypeSelect?.value;
  const selectedCategory = medicalCategorySelect?.value;
  if (!selectedType || !selectedCategory) {
    medicalNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    medicalNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildMedicalNameOptions(selectedType, selectedCategory);
}

function onEquipmentTypeChange() {
  const selectedType = equipmentTypeSelect?.value;
  if (!selectedType) {
    equipmentCategorySelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentCategorySelect.disabled = true;
    equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildEquipmentCategoryOptions(selectedType);
}

function onEquipmentCategoryChange() {
  const selectedType = equipmentTypeSelect?.value;
  const selectedCategory = equipmentCategorySelect?.value;
  if (!selectedType || !selectedCategory) {
    equipmentNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    equipmentNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildEquipmentNameOptions(selectedType, selectedCategory);
}

function onWeaponClassChange() {
  const selectedType = weaponTypeSelect?.value;
  const selectedCategory = weaponCategorySelect?.value;
  const selectedClass = weaponClassSelect?.value;
  if (!selectedType || !selectedCategory || !selectedClass) {
    weaponNameSelect.innerHTML = '<option value="">Sélectionnez</option>';
    weaponNameSelect.disabled = true;
    confirmAddInventoryItemBtn.classList.add('hidden');
    confirmAddInventoryItemBtn.disabled = true;
    return;
  }
  buildWeaponNameOptions(selectedType, selectedCategory, selectedClass);
}

function openAddItemModal() {
  resetAddItemModal();
  showModal(addItemModal);
}

async function addSelectedWeaponToInventory() {
  if (!currentAgent || !addItemTypeSelect || !weaponTypeSelect || !weaponCategorySelect || !weaponClassSelect || !weaponNameSelect) return;
  if (addItemTypeSelect.value !== 'Armes') return;
  const selectedType = weaponTypeSelect.value;
  const selectedCategory = weaponCategorySelect.value;
  const selectedClass = weaponClassSelect.value;
  const selectedName = weaponNameSelect.value;
  const weapon = weaponsData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.class === selectedClass &&
      item.name === selectedName
  );
  if (!weapon) return;
  currentAgent.inventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { name: weapon.name, category: weapon.category, weight: Number(weapon.weight), type: weapon.type, class: weapon.class },
  ];
  renderInventory();
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet « ${weapon.name} » ajouté à l'inventaire.`);
}

async function addSelectedMedicalToInventory() {
  if (!currentAgent || !addItemTypeSelect || !medicalTypeSelect || !medicalCategorySelect || !medicalNameSelect) return;
  if (addItemTypeSelect.value !== 'Medical') return;
  const selectedType = medicalTypeSelect.value;
  const selectedCategory = medicalCategorySelect.value;
  const selectedName = medicalNameSelect.value;
  const medical = medicalData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.name === selectedName
  );
  if (!medical) return;
  currentAgent.inventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { name: medical.name, category: medical.category, weight: Number(medical.weight), type: medical.type },
  ];
  renderInventory();
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet « ${medical.name} » ajouté à l'inventaire.`);
}

async function addSelectedEquipmentToInventory() {
  if (!currentAgent || !addItemTypeSelect || !equipmentTypeSelect || !equipmentCategorySelect || !equipmentNameSelect) return;
  if (addItemTypeSelect.value !== 'Equipement') return;
  const selectedType = equipmentTypeSelect.value;
  const selectedCategory = equipmentCategorySelect.value;
  const selectedName = equipmentNameSelect.value;
  const equipment = equipmentData.find(
    (item) =>
      item.type === selectedType &&
      item.category === selectedCategory &&
      item.name === selectedName
  );
  if (!equipment) return;
  currentAgent.inventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { name: equipment.name, category: equipment.category, weight: Number(equipment.weight), type: equipment.type },
  ];
  renderInventory();
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet « ${equipment.name} » ajouté à l'inventaire.`);
}

async function addSelectedOtherToInventory() {
  if (!currentAgent || !otherItemName || !otherItemWeight) return;
  const name = otherItemName.value.trim();
  const description = otherItemDescription?.value?.trim() || '';
  const weight = parseFloat(otherItemWeight.value);
  
  if (!name || isNaN(weight) || weight <= 0) {
    showToast('Veuillez saisir un nom valide et un poids supérieur à 0.');
    return;
  }
  
  currentAgent.inventory = [
    ...(Array.isArray(currentAgent.inventory) ? currentAgent.inventory : []),
    { name, description, weight: Number(weight), category: 'Autre' },
  ];
  renderInventory();
  hideModal(addItemModal);
  await persistCurrentAgent();
  showToast(`Objet « ${name} » ajouté à l'inventaire.`);
}

function renderInventory() {
  if (!currentAgent) return;
  const capacity = Number(currentAgent.inventoryCapacity ?? 30);
  const items = Array.isArray(currentAgent.inventory) ? currentAgent.inventory : [];
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
              <div class="item-label">${item.name}</div>
              <div class="item-count">${item.category} • ${item.weight} kg</div>
            </div>
          </button>
          <button type="button" class="inventory-delete-btn" data-index="${index}" aria-label="Supprimer item">🗑️</button>
        </li>`
    )
    .join('');
}

function openInventoryScreen() {
  if (!currentAgent) return;
  dashboardView.classList.add('hidden');
  inventoryView.classList.remove('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.add('hidden');
  heroMission.textContent = 'Inventaire';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  renderInventory();
}

function openSkillsScreen() {
  if (!currentAgent) return;
  initializeSkillsState();
  dashboardView.classList.add('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.remove('hidden');
  attributesView?.classList.add('hidden');
  heroMission.textContent = 'Compétences';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  renderSkillsScreen();
}

function openAttributesScreen() {
  if (!currentAgent) return;
  initializeAttributesState();
  dashboardView.classList.add('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.remove('hidden');
  heroMission.textContent = 'Attributs';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  renderAttributesScreen();
}

async function openCompetencesScreen() {
  if (!currentAgent) return;
  
  try {
    await loadCompetencesData(); // ✅ Attend le chargement

    // ✅ Vérifier que les données sont prêtes
    if (!competencesHierarchy.length) {
      showToast('Aucune compétence trouvée pour cet agent.');
      return;
    }

    dashboardView.classList.add('hidden');
    inventoryView.classList.add('hidden');
    skillsView?.classList.add('hidden');
    attributesView?.classList.add('hidden');
    if (competencesView) competencesView.classList.remove('hidden');
    heroMission.textContent = 'Compétences';
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (homeBtn) homeBtn.classList.remove('hidden');

    renderCompetencesScreen();
  } catch (error) {
    console.error('Failed to open competences screen:', error);
    showToast('Impossible de charger les compétences. Vérifiez votre connexion.');
    // ✅ Réinitialiser l'UI
    competencesHierarchy = [];
    competencesState = {};
  }
}

function deepMergeCompetences(saved) {
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

function initializeSkillsState() {
  const agentStats = currentAgent?.stats || { speed: 1, resilience: 1, vigor: 1 };
  baseStats = {
    speed: Number(agentStats.speed ?? 1),
    resilience: Number(agentStats.resilience ?? 1),
    vigor: Number(agentStats.vigor ?? 1),
  };
  skillsState = {
    reserve: Number(currentAgent?.availableStatsPoints ?? 0),
    stats: {
      speed: Number(agentStats.speed ?? 1),
      resilience: Number(agentStats.resilience ?? 1),
      vigor: Number(agentStats.vigor ?? 1),
    },
  };
}

function initializeAttributesState() {
  const agentAttributes = currentAgent?.attributes || { conscience: 1, dexterity: 1, technique: 1 };
  baseAttributes = {
    conscience: Number(agentAttributes.conscience ?? 1),
    dexterity: Number(agentAttributes.dexterity ?? 1),
    technique: Number(agentAttributes.technique ?? 1),
  };
  attributesState = {
    reserve: Number(currentAgent?.availableAttributesPoints ?? 0),
    attributes: {
      conscience: Number(agentAttributes.conscience ?? 1),
      dexterity: Number(agentAttributes.dexterity ?? 1),
      technique: Number(agentAttributes.technique ?? 1),
    },
  };
}

function renderSkillsScreen() {
  if (!skillsReserveCount) return;
  skillsReserveCount.textContent = String(skillsState.reserve);
  ['speed', 'resilience', 'vigor'].forEach((stat) => {
    const element = document.getElementById(`${stat}SkillValue`);
    if (element) {
      element.textContent = String(skillsState.stats[stat]);
    }
  });
  updateSkillsButtons();
}

function renderAttributesScreen() {
  if (!attributesReserveCount) return;
  attributesReserveCount.textContent = String(attributesState.reserve);
  ['conscience', 'dexterity', 'technique'].forEach((attr) => {
    const element = document.getElementById(`${attr}AttributeValue`);
    if (element) {
      element.textContent = String(attributesState.attributes[attr]);
    }
  });
  updateAttributesButtons();
}

function updateSkillsButtons() {
  ['speed', 'resilience', 'vigor'].forEach((stat) => {
    const increaseBtn = document.querySelector(`#skillsView [data-stat="${stat}"][data-action="increase"]`);
    const decreaseBtn = document.querySelector(`#skillsView [data-stat="${stat}"][data-action="decrease"]`);
    
    if (increaseBtn) {
      increaseBtn.disabled = skillsState.reserve <= 0;
    }
    
    if (decreaseBtn) {
      const currentValue = skillsState.stats[stat];
      const baseValue = baseStats[stat] || 1;
      decreaseBtn.style.display = currentValue > baseValue ? 'inline-block' : 'none';
    }
  });
}

function updateAttributesButtons() {
  ['conscience', 'dexterity', 'technique'].forEach((attr) => {
    const increaseBtn = document.querySelector(`#attributesView [data-attr="${attr}"][data-action="increase"]`);
    const decreaseBtn = document.querySelector(`#attributesView [data-attr="${attr}"][data-action="decrease"]`);
    
    if (increaseBtn) {
      increaseBtn.disabled = attributesState.reserve <= 0;
    }
    
    if (decreaseBtn) {
      const currentValue = attributesState.attributes[attr];
      const baseValue = baseAttributes[attr] || 1;
      decreaseBtn.style.display = currentValue > baseValue ? 'inline-block' : 'none';
    }
  });
}

// Compétences structure - sera chargée depuis skills.json
let competencesData = null;

async function loadCompetencesData() {
  if (!currentAgent?.id) {
    competencesHierarchy = [];
    competencesState = {};
    return;
  }
  
    try {
    const response = await fetch(`/api/skills/hierarchy/${currentAgent.id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    // ✅ Gérer les 2 formats (tableau direct ou objet {hierarchy: [...]})
    competencesHierarchy = Array.isArray(data) ? data : (data.hierarchy || []);

    // ✅ Reconstruire competencesState avec les IDs comme clés
    competencesState = {};
    for (const group of competencesHierarchy) {
      const groupKey = group.id;
      competencesState[groupKey] = { ...group, value: group.value || 0 };

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
  } catch (error) {
    console.error('Error loading competences:', error);
    // ✅ Initialisation par défaut en cas d'erreur
    competencesHierarchy = [];
    competencesState = {};
    throw error; // Permet à openCompetencesScreen de gérer l'erreur
  }
}

function normalizeKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e');
}

function showCompetenceDescription(description) {
  if (!competenceDescModal || !competenceDescContent) return;
  competenceDescContent.textContent = description;
  competenceDescModal.classList.add('active');
}

function hideCompetenceDescription() {
  if (competenceDescModal) {
    competenceDescModal.classList.remove('active');
  }
}

function renderCompetencesScreen() {
  // ✅ Vérifier que tout est initialisé
  if (!competencesContainer || !currentAgent || !competencesState || !competencesHierarchy.length) {
    competencesContainer.innerHTML = '<div class="competence-empty">Aucune compétence disponible.</div>';
    return;
  }

  competencesContainer.innerHTML = '';
  const attrKeys = Object.keys(competencesState).filter(k => !['name', 'description', 'id', 'value'].includes(k));

  attrKeys.forEach(attrKey => {
    const attr = competencesState[attrKey];
    const attrValue = attr.value || 0;
    const attrDiv = document.createElement('div');
    attrDiv.className = 'competence-level';
    attrDiv.dataset.level = '1';
    attrDiv.dataset.key = attrKey;
    attrDiv.innerHTML = `
      <div class="competence-header">
        <span class="competence-name">${attr.name || 'Inconnu'}</span>
        <span class="competence-value">Niveau: ${attrValue}</span>
        ${attr.description ? '<button class="info-icon" title="Info">?</button>' : ''}
      </div>
    `;
    const infoBtn = attrDiv.querySelector('.info-icon');
    if (infoBtn) {
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCompetenceDescription(attr.description);
      });
    }
    attrDiv.addEventListener('click', () => renderCompetencesLevel(1, attrKey));
    competencesContainer.appendChild(attrDiv);
  });
}

function renderCompetencesLevel(level, key, parentKeys = []) {
  const path = [...parentKeys, key];
  let current = competencesState;
  for (const k of path) {
    current = current[k];
  }

  competencesContainer.innerHTML = '';

  // Add back button if not at root level
  if (level > 0) {
    const backDiv = document.createElement('div');
    backDiv.className = 'competence-back';
    backDiv.innerHTML = '<button class="btn btn-tertiary">← Retour</button>';
    backDiv.addEventListener('click', () => {
      if (level === 1) {
        // Back to root (attributes list)
        renderCompetencesScreen();
      } else {
        const backLevel = level - 1;
        const backPath = path.slice(0, backLevel);
        renderCompetencesLevel(backLevel, backPath[backLevel - 1], backPath.slice(0, backLevel - 1));
      }
    });
    competencesContainer.appendChild(backDiv);
  }

  if (level === 1) {
    // Show sub-attributes - filter out system properties
    const subAttrKeys = Object.keys(current).filter(k => !['name', 'description', 'id', 'value', 'attributes'].includes(k));
    subAttrKeys.forEach(subAttrKey => {
      const subAttr = current[subAttrKey];
      const subAttrValue = subAttr.value || 0;
      const subAttrDiv = document.createElement('div');
      subAttrDiv.className = 'competence-level';
      subAttrDiv.dataset.level = '2';
      subAttrDiv.dataset.key = subAttrKey;
      subAttrDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${subAttr.name}</span>
          <span class="competence-value">Niveau: ${subAttrValue}</span>
          ${subAttr.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
      `;
      
      const infoBtn = subAttrDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(subAttr.description);
        });
      }
      
      subAttrDiv.addEventListener('click', () => renderCompetencesLevel(2, subAttrKey, path));
      competencesContainer.appendChild(subAttrDiv);
    });
  } else if (level === 2) {
    // Show groups - filter out system properties
    const groupKeys = Object.keys(current).filter(k => !['name', 'description', 'id', 'value', 'skillGroups'].includes(k));
    groupKeys.forEach(groupKey => {
      const group = current[groupKey];
      const groupValue = group.value || 0;
      const groupDiv = document.createElement('div');
      groupDiv.className = 'competence-level';
      groupDiv.dataset.level = '3';
      groupDiv.dataset.key = groupKey;
      groupDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${group.name}</span>
          <span class="competence-value">Niveau: ${groupValue}</span>
          ${group.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
      `;
      
      const infoBtn = groupDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(group.description);
        });
      }
      
      groupDiv.addEventListener('click', () => renderCompetencesLevel(3, groupKey, path));
      competencesContainer.appendChild(groupDiv);
    });
  } else if (level === 3) {
    // Show skills with points - filter out system properties
    const skillKeys = Object.keys(current).filter(k => !['name', 'description', 'id', 'value', 'skills'].includes(k));
    skillKeys.forEach(skillKey => {
      const skill = current[skillKey];
      const skillDiv = document.createElement('div');
      skillDiv.className = 'competence-skill';
      skillDiv.innerHTML = `
        <div class="competence-header">
          <span class="competence-name">${skill.name}</span>
          <span class="competence-value">Niveau: ${skill.value}</span>
          ${skill.description ? '<button class="info-icon" title="Info">?</button>' : ''}
        </div>
        <div class="competence-controls">
          <button type="button" class="icon-btn" data-action="decrease" data-key="${skillKey}">-</button>
          <span>${skill.value}</span>
          <button type="button" class="icon-btn" data-action="increase" data-key="${skillKey}">+</button>
        </div>
      `;
      
      const infoBtn = skillDiv.querySelector('.info-icon');
      if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showCompetenceDescription(skill.description);
        });
      }
      
      skillDiv.addEventListener('click', (e) => {
        if (e.target.dataset.action) {
          const action = e.target.dataset.action;
          const skillId = e.target.dataset.skillId;
          changeCompetenceValue(path, level + 1, skillId, action);
        }
      });
      competencesContainer.appendChild(skillDiv);
    });
  }
}

async function changeCompetenceValue(path, level, entityKey, action) {
  // Find and update the entity in competencesHierarchy directly
  let targetEntity = null;
  
  if (level === 1) {
    // Find attribute-group
    targetEntity = competencesHierarchy.find(g => g.id === entityKey);
  } else if (level === 2) {
    // Find attribute in the group specified by path[0]
    const group = competencesHierarchy.find(g => g.id === path[0]);
    if (group) {
      targetEntity = group.attributes.find(a => a.id === entityKey);
    }
  } else if (level === 3) {
    // Find skill-group in the attribute specified by path[0] -> path[1]
    const group = competencesHierarchy.find(g => g.id === path[0]);
    if (group) {
      const attribute = group.attributes.find(a => a.id === path[1]);
      if (attribute) {
        targetEntity = attribute.skillGroups.find(sg => sg.id === entityKey);
      }
    }
  } else if (level === 4) {
    // Find skill in the skill-group specified by path[0] -> path[1] -> path[2]
    const group = competencesHierarchy.find(g => g.id === path[0]);
    if (group) {
      const attribute = group.attributes.find(a => a.id === path[1]);
      if (attribute) {
        const skillGroup = attribute.skillGroups.find(sg => sg.id === path[2]);
        if (skillGroup) {
          targetEntity = skillGroup.skills.find(s => s.id === entityKey);
        }
      }
    }
  }
  
  if (!targetEntity) {
    console.error('Target entity not found:', { level, path, entityKey });
    return;
  }
  
  // Calculate new value
  const newValue = action === 'increase' ? (targetEntity.value || 0) + 1 : Math.max(0, (targetEntity.value || 0) - 1);
  targetEntity.value = newValue;
  
  // Rebuild competencesState from updated hierarchy (without API call)
  competencesState = {};
  for (const group of competencesHierarchy) {
    const groupKey = group.id;  // ✅ ID au lieu de normalizeKey
    competencesState[groupKey] = { ...group, value: group.value || 0 };

    for (const attribute of group.attributes || []) {
      const attrKey = attribute.id;  // ✅ ID
      competencesState[groupKey][attrKey] = { ...attribute, value: attribute.value || 0 };

      for (const skillGroup of attribute.skillGroups || []) {
        const sgKey = skillGroup.id;  // ✅ ID
        competencesState[groupKey][attrKey][sgKey] = { ...skillGroup, value: skillGroup.value || 0 };

        for (const skill of skillGroup.skills || []) {
          const skillKey = skill.id;  // ✅ ID
          competencesState[groupKey][attrKey][sgKey][skillKey] = { ...skill, value: skill.value || 0 };
        }
      }
    }
  }
  
  // Re-render
  renderCompetencesLevel(level, path[level - 1], path.slice(0, level - 1));
}

function changeSkillStat(stat, action) {
  if (action === 'increase') {
    if (skillsState.reserve <= 0) return;
    skillsState.stats[stat] += 1;
    skillsState.reserve -= 1;
  } else if (action === 'decrease') {
    if (skillsState.stats[stat] <= (baseStats[stat] || 1)) return;
    skillsState.stats[stat] -= 1;
    skillsState.reserve += 1;
  }
  renderSkillsScreen();
}

function changeAttributeStat(attr, action) {
  if (action === 'increase') {
    if (attributesState.reserve <= 0) return;
    attributesState.attributes[attr] += 1;
    attributesState.reserve -= 1;
  } else if (action === 'decrease') {
    if (attributesState.attributes[attr] <= (baseAttributes[attr] || 1)) return;
    attributesState.attributes[attr] -= 1;
    attributesState.reserve += 1;
  }
  renderAttributesScreen();
}

async function saveSkillsAllocation() {
  if (!currentAgent) return;
  currentAgent.stats = {
    ...currentAgent.stats,
    ...skillsState.stats,
  };
  currentAgent.availableStatsPoints = skillsState.reserve;
  await persistCurrentAgent();
  showToast('Compétences mises à jour.');
  renderAgent(currentAgent);
  openDashboardView();
}

async function saveAttributesAllocation() {
  if (!currentAgent) return;
  currentAgent.attributes = {
    ...currentAgent.attributes,
    ...attributesState.attributes,
  };
  currentAgent.availableAttributesPoints = attributesState.reserve;
  await persistCurrentAgent();
  showToast('Attributs mis à jour.');
  renderAgent(currentAgent);
  openDashboardView();
}

async function saveCompetencesAllocation() {
  if (!currentAgent?.id) return;
  
  try {
    // Save all values via API
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
        await fetch('/api/skills/attribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: currentAgent.id,
            attributeId: attribute.id,
            value: attribute.value || 0
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
  renderAgent(currentAgent);
  openDashboardView();
}

function openDashboardView() {
  dashboardView.classList.remove('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.add('hidden');
  competencesView?.classList.add('hidden');
  heroMission.textContent = 'Tableau de bord de l’Aventure';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.add('hidden');
}

function openDeleteItem(index) {
  pendingDeleteIndex = index;
  showModal(deleteItemModal);
}

async function confirmDeleteItem() {
  if (pendingDeleteIndex === null || !currentAgent) return;
  currentAgent.inventory = currentAgent.inventory.filter((_, index) => index !== pendingDeleteIndex);
  pendingDeleteIndex = null;
  hideModal(deleteItemModal);
  renderInventory();
  await persistCurrentAgent();
  showToast('Objet supprimé de votre inventaire.');
}

async function openItemDetails(index) {
  const item = currentAgent?.inventory?.[index];
  if (!item || !itemDetailsContent) return;

  let source = item;
  let isWeapon = false;
  let isMedical = false;
  let isEquipment = false;

  if (item.class || item.type === 'Armes légères' || item.category?.includes('Armes')) {
    await loadWeaponsData();
    const weapon = weaponsData.find((weaponItem) => {
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

  if (!isWeapon && (item.range || ['Injection', 'Electronique', 'Application'].includes(item.category))) {
    await loadMedicalData();
    const medical = medicalData.find((medicalItem) => {
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

  if (!isWeapon && !isMedical && item.effect && ['Armure'].includes(item.category)) {
    await loadEquipmentData();
    const equipment = equipmentData.find((equipmentItem) => {
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
      : '<div class="item-detail-row">Aucune information supplémentaire disponible dans le fichier armes.json.</div>';
  }

  itemDetailsContent.innerHTML = `
    <div class="item-detail-card">
      ${details}
      ${fallback}
    </div>
  `;
  showModal(itemDetailsModal);
}

function saveAgentLocally(agent) {
  const agents = getAgents();
  agents.push(agent);
  saveAgents(agents);
}

function updateAgentLocally(agent) {
  const agents = getAgents();
  const index = agents.findIndex((storedAgent) => storedAgent.id === agent.id || storedAgent.name === agent.name);
  if (index >= 0) {
    agents[index] = agent;
  } else {
    agents.push(agent);
  }
  saveAgents(agents);
}

async function persistCurrentAgent() {
  if (!currentAgent || !currentAgent.id) return;
  try {
    await requestJson(`/api/agents/${currentAgent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentAgent),
    });
  } catch {
    updateAgentLocally(currentAgent);
  }
}

function loginAgentLocally(name, password) {
  const agent = findAgent(name);
  if (!agent) {
    return null;
  }
  if (agent.password !== password) {
    return null;
  }
  return agent;
}

async function loginAgent(name, password) {
  try {
    const result = await requestJson('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    return result.agent;
  } catch {
    return loginAgentLocally(name, password);
  }
}

async function createAgent(agentData) {
  const agent = createDefaultAgent(agentData);
  try {
    const result = await requestJson(API_AGENTS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    return result.agent || agent;
  } catch (error) {
    if (error.status === 409) {
      showToast('Cet agent existe déjà. Choisissez un autre nom.');
      throw error;
    }
    saveAgentLocally(agent);
    return agent;
  }
}

async function loadCurrentAgent() {
  const session = getSession();
  if (!session) {
    showSection('landing');
    return;
  }

  if (session.agentId) {
    try {
      const result = await requestJson(`/api/agents/${session.agentId}`);
      if (result?.agent) {
        renderAgent(result.agent);
        showSection('mainPage');
        return;
      }
    } catch {
      // fallback to local session if API is unavailable
    }
  }

  const agent = findAgent(session.agentName);
  if (!agent) {
    clearSession();
    showSection('landing');
    return;
  }
  renderAgent(agent);
  showSection('mainPage');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = loginForm.agentName.value.trim();
  const password = loginForm.agentPassword.value;
  if (!name || !password) {
    showToast('Entrez un nom et un mot de passe valides.');
    return;
  }
  const agent = await loginAgent(name, password);
  if (!agent) {
    showToast('Agent non trouvé ou mot de passe incorrect.');
    return;
  }
  saveSession(agent);
  renderAgent(agent);
  showSection('mainPage');
});

function getWizardStepButtons() {
  return Array.from(wizardStepNav.querySelectorAll('button'));
}

const stepLabels = [
  'Informations civiles',
  'Couverture avant activation',
  'Caractéristiques',
  'Attributs',
  'Talents',
  'Background',
  'Validation',
];

function resetWizard() {
  currentStep = 1;
  visitedStep = 1;
  selectedTalent = null;
  talentIdSelected = null;
  talentIndex = 0;
  reserveValues.stats = 2;
  reserveValues.attrs = 1;
  Object.keys(attributeValues).forEach((key) => {
    attributeValues[key] = 1;
    const element = document.getElementById(`${key}Value`);
    if (element) element.textContent = '1';
  });
  Object.values(agentInputs).forEach((input) => {
    if (input) input.value = '';
  });
  storyCount.textContent = '0';
  updateReserveDisplay();
  updatePointButtons();
  renderTalent();
  buildWizardStepNav();
  showWizardStep(1);
}

function buildWizardStepNav() {
  wizardStepNav.innerHTML = stepLabels
    .map(
      (label, index) =>
        `<button type="button" data-step="${index + 1}" class="${index === 0 ? 'active-step-nav' : ''}">${index + 1}. ${label}</button>`
    )
    .join('');
}

function updateWizardStepNav() {
  getWizardStepButtons().forEach((button) => {
    const step = Number(button.dataset.step);
    button.classList.toggle('active-step-nav', step === currentStep);
    button.disabled = step > visitedStep;
  });
}

function updateReserveDisplay() {
  const statReserve = document.getElementById('statReserve');
  const attrReserve = document.getElementById('attrReserve');
  if (statReserve) statReserve.textContent = String(reserveValues.stats);
  if (attrReserve) attrReserve.textContent = String(reserveValues.attrs);
}

function updatePointButtons() {
  const plusButtons = Array.from(document.querySelectorAll('[data-action="increase"]'));
  const minusButtons = Array.from(document.querySelectorAll('[data-action="decrease"]'));

  plusButtons.forEach((button) => {
    const attr = button.dataset.attr;
    if (!attr) return;
    const reserveKey = ['speed', 'resilience', 'vigor'].includes(attr) ? 'stats' : 'attrs';
    button.disabled = reserveValues[reserveKey] <= 0;
  });

  minusButtons.forEach((button) => {
    const attr = button.dataset.attr;
    if (!attr) return;
    button.disabled = attributeValues[attr] <= 1;
  });
}

function changeAttribute(attr, action) {
  const reserveKey = ['speed', 'resilience', 'vigor'].includes(attr) ? 'stats' : 'attrs';
  if (action === 'increase') {
    if (reserveValues[reserveKey] <= 0) return;
    reserveValues[reserveKey] -= 1;
    attributeValues[attr] += 1;
  } else {
    if (attributeValues[attr] <= 1) return;
    attributeValues[attr] -= 1;
    reserveValues[reserveKey] += 1;
  }
  const element = document.getElementById(`${attr}Value`);
  if (element) element.textContent = String(attributeValues[attr]);
  updateReserveDisplay();
  updatePointButtons();
  updateWizardButton();
}

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
    return reserveValues.stats === 0;
  }
  if (step === 4) {
    return reserveValues.attrs === 0;
  }
  if (step === 5) {
    return talentIdSelected !== null;
  }
  if (step === 6) {
    return agentInputs.story.value.trim().length > 0;
  }
  if (step === 7) {
    return validatePasswordStep();
  }
  return false;
}

function validatePasswordStep() {
  const password = agentInputs.password.value.trim();
  return password.length > 0;
}

function updateWizardButton() {
  wizardNext.disabled = !validateStep(currentStep);
  wizardNext.textContent = currentStep === 7 ? 'Valider votre agent' : 'Suivant';
}

function showWizardStep(step) {
  const allSteps = Array.from(wizardContent.querySelectorAll('.wizard-step'));
  currentStep = step;
  visitedStep = Math.max(visitedStep, step);
  allSteps.forEach((element) => {
    element.classList.toggle('active-step', Number(element.dataset.step) === step);
  });
  wizardBreadcrumb.textContent = `Étape ${step} / 7 · ${stepLabels[step - 1]}`;
  updateWizardStepNav();
  updateWizardButton();
  scrollToTop();
}

async function loadTalents() {
  try {
    const result = await requestJson('/api/talents');
    talents = Array.isArray(result) ? result : (result?.talents || result?.data || []);
    talentIndex = 0;
    selectedTalent = null;
    talentIdSelected = null;
  } catch {
    talents = [];
  }
  renderTalent();
}

function renderTalent() {
  if (!talentTitle || !talentDescription) return;
  const talent = talents[talentIndex] || selectedTalent;
  if (!talent) {
    talentTitle.textContent = 'Chargement des talents...';
    talentDescription.textContent = 'Veuillez patienter pendant le chargement des talents.';
    return;
  }
  talentTitle.textContent = talent.title;
  talentDescription.textContent = talent.description;
}

function navigateTalent(direction) {
  if (!talents.length) return;
  talentIndex = (talentIndex + direction + talents.length) % talents.length;
  renderTalent();
}

function chooseTalent() {
  if (!talents.length) return;
  selectedTalent = talents[talentIndex];
  talentIdSelected = selectedTalent.id;
  showWizardStep(6);
}

function getWizardData() {
  return {
    name: agentInputs.lastName.value.trim(),
    firstName: agentInputs.firstName.value.trim(),
    age: Number(agentInputs.age.value),
    profession: agentInputs.profession.value.trim(),
    sex: agentInputs.sex.value,
    familyStatus: agentInputs.familyStatus.value,
    children: Number(agentInputs.children.value),
    stats: {
      speed: attributeValues.speed,
      resilience: attributeValues.resilience,
      vigor: attributeValues.vigor,
    },
    attributes: {
      conscience: attributeValues.conscience,
      dexterity: attributeValues.dexterity,
      technique: attributeValues.technique,
    },
    talentId: talentIdSelected,
    talent: selectedTalent,
    story: agentInputs.story.value.trim(),
    password: agentInputs.password.value,
  };
}

createAgentBtn.addEventListener('click', async () => {
  showSection('createAgent');
  resetWizard();
  await loadTalents();
});

wizardBack.addEventListener('click', () => {
  if (currentStep === 1) {
    showSection('landing');
    return;
  }
  showWizardStep(currentStep - 1);
});

inventoryBtn.addEventListener('click', openInventoryScreen);
if (skillsBtn) skillsBtn.addEventListener('click', openSkillsScreen);
if (attributesBtn) attributesBtn.addEventListener('click', openAttributesScreen);
if (competencesBtn) competencesBtn.addEventListener('click', openCompetencesScreen);
if (saveSkillsBtn) saveSkillsBtn.addEventListener('click', saveSkillsAllocation);
if (saveAttributesBtn) saveAttributesBtn.addEventListener('click', saveAttributesAllocation);
if (saveCompetencesBtn) saveCompetencesBtn.addEventListener('click', saveCompetencesAllocation);
if (closeCompetenceDescBtn) closeCompetenceDescBtn.addEventListener('click', hideCompetenceDescription);
if (competenceDescModal) competenceDescModal.addEventListener('click', (e) => {
  if (e.target === competenceDescModal) hideCompetenceDescription();
});

skillsView?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-stat]');
  if (!button) return;
  const stat = button.dataset.stat;
  const action = button.dataset.action || 'increase';
  if (stat) {
    changeSkillStat(stat, action);
  }
});

attributesView?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-attr]');
  if (!button) return;
  const attr = button.dataset.attr;
  const action = button.dataset.action || 'increase';
  if (attr) {
    changeAttributeStat(attr, action);
  }
});
addInventoryItemBtn.addEventListener('click', openAddItemModal);
if (homeBtn) {
  homeBtn.addEventListener('click', openDashboardView);
}
if (addItemTypeSelect) {
  addItemTypeSelect.addEventListener('change', onAddItemTypeChange);
}
if (weaponTypeSelect) {
  weaponTypeSelect.addEventListener('change', onWeaponTypeChange);
}
if (weaponCategorySelect) {
  weaponCategorySelect.addEventListener('change', onWeaponCategoryChange);
}
if (weaponClassSelect) {
  weaponClassSelect.addEventListener('change', onWeaponClassChange);
}
if (weaponNameSelect) {
  weaponNameSelect.addEventListener('change', updateAddItemButtonState);
}
if (medicalTypeSelect) {
  medicalTypeSelect.addEventListener('change', onMedicalTypeChange);
}
if (medicalCategorySelect) {
  medicalCategorySelect.addEventListener('change', onMedicalCategoryChange);
}
if (medicalNameSelect) {
  medicalNameSelect.addEventListener('change', updateAddItemButtonState);
}
if (equipmentTypeSelect) {
  equipmentTypeSelect.addEventListener('change', onEquipmentTypeChange);
}
if (equipmentCategorySelect) {
  equipmentCategorySelect.addEventListener('change', onEquipmentCategoryChange);
}
if (equipmentNameSelect) {
  equipmentNameSelect.addEventListener('change', updateAddItemButtonState);
}
if (otherItemName) {
  otherItemName.addEventListener('input', updateAddItemButtonState);
}
if (otherItemDescription) {
  otherItemDescription.addEventListener('input', updateAddItemButtonState);
}
if (otherItemWeight) {
  otherItemWeight.addEventListener('input', updateAddItemButtonState);
}
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

inventoryList?.addEventListener('click', (event) => {
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

confirmDeleteBtn.addEventListener('click', confirmDeleteItem);
cancelDeleteBtn.addEventListener('click', () => hideModal(deleteItemModal));
closeItemDetailsBtn.addEventListener('click', () => hideModal(itemDetailsModal));
closeAddItemModalBtn.addEventListener('click', () => hideModal(addItemModal));

wizardNext.addEventListener('click', async () => {
  if (currentStep === 7) {
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
      await createAgent(data);
      showAgentCreatedPopup();
      resetWizard();
    } catch {
      // ERREUR déjà affichée par createAgent si nécessaire
    }
    return;
  }
  if (!validateStep(currentStep)) {
    showToast('Complétez cette étape avant de continuer.');
    return;
  }
  showWizardStep(currentStep + 1);
});

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

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const attr = button.dataset.attr;
  const action = button.dataset.action;
  changeAttribute(attr, action);
});

talentPrev.addEventListener('click', () => navigateTalent(-1));
talentNext.addEventListener('click', () => navigateTalent(1));
chooseTalentBtn.addEventListener('click', chooseTalent);

agentInputs.lastName.addEventListener('input', updateWizardButton);
agentInputs.firstName.addEventListener('input', updateWizardButton);
agentInputs.age.addEventListener('input', updateWizardButton);
agentInputs.sex.addEventListener('change', updateWizardButton);
agentInputs.profession.addEventListener('input', updateWizardButton);
agentInputs.familyStatus.addEventListener('change', updateWizardButton);
agentInputs.children.addEventListener('change', updateWizardButton);
agentInputs.story.addEventListener('input', () => {
  storyCount.textContent = String(agentInputs.story.value.length);
  updateWizardButton();
});

agentInputs.password.addEventListener('input', updateWizardButton);

activateAgentBtn.addEventListener('click', () => {
  closeAgentCreatedPopup();
  showSection('landing');
  showToast('Retour à l’écran de connexion.');
});

logoutBtn.addEventListener('click', async () => {
  await persistCurrentAgent();
  clearSession();
  resetBrandTag();
  showSection('landing');
  showToast('Déconnexion réussie.');
});


loadCurrentAgent();
