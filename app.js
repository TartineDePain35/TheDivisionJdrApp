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
const heroTalentPoint = document.getElementById('heroTalentPoint');
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
const talentsBtn = document.getElementById('talentsBtn');
const messagesBtn = document.getElementById('messagesBtn');
const talentsView = document.getElementById('talentsView');
const messagesView = document.getElementById('messagesView');
const talentsContainer = document.getElementById('talentsContainer');
const messagesList = document.getElementById('messagesList');
const talentsAvailableContainer = document.getElementById('talentsAvailableContainer');
const confirmTalentBtn = document.getElementById('confirmTalentBtn');
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
let selectedAgentTalent = null;
let selectedAgentTalentId = null;
let selectedAgentTalentTile = null;
let pendingDeleteIndex = null;
let weaponsData = [];
let medicalData = [];
let equipmentData = [];
let competencesHierarchy = [];
let competencesState = {};
let currentAgentMessages = [];
let expandedMessageIds = new Set();
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

// État pour suivre les modifications dans la vue simple des attributs
let attributesViewModifications = {}; // {conscience: value, dexterity: value, technique: value}
let attributesViewInitialValues = {}; // Valeurs initiales au moment de l'ouverture de l'écran

// État pour la redistribution des points au niveau des attributs (niveau 1)
let currentAttributeGroup = null; // ID du groupe d'attributs sélectionné (ex: Conscience)
let currentAttributeGroupValue = 0; // Valeur du groupe sélectionné
let attributeModifications = {}; // {attributeId: newValue} pour les attributs modifiés
let attributeBaseValues = {}; // {attributeId: baseValue} pour les valeurs de base des attributs
let currentAvailablePoints = 0; // Stock de points disponibles pour le groupe sélectionné

// Niveau 3 - Groupes de compétences
let skillGroupModifications = {}; // {skillGroupId: newValue} pour les groupes de compétences modifiés
let skillGroupBaseValues = {}; // {skillGroupId: baseValue} pour les valeurs de base des groupes de compétences
let currentSkillGroupAvailablePoints = 0; // Stock de points disponibles pour l'attribut sélectionné

// Niveau 4 - Compétences
let skillModifications = {}; // {skillId: newValue} pour les compétences modifiées
let skillBaseValues = {}; // {skillId: baseValue} pour les valeurs de base des compétences
let currentSkillAvailablePoints = 0; // Stock de points disponibles pour le groupe de compétences sélectionné

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
    // ✅ NOUVEAU : talents est maintenant géré via talents_value
    talents: (data.talents && Array.isArray(data.talents)) 
      ? data.talents.map(t => ({...t, id: Number(t.id)})) // Forcer la conversion en number
      : [],
    // ✅ NOUVEAU : stats est maintenant géré via stats_group_value, garder pour compatibilité
    stats: data.stats || { speed: 1, resilience: 1, vigor: 1 },
    attributes: data.attributes,
    password: data.password,
    availableStatsPoints: 0,
    availableAttributesPoints: 0,
    availableTalentPoints: 0,
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
  heroTalentPoint.textContent = String(agent.availableTalentPoints ?? 0);
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
  
  // Charger les messages pour mettre à jour le compteur de messages non lus
  loadMessagesForCurrentAgent().catch(error => {
    console.error('Erreur lors du chargement initial des messages:', error);
  });
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
  competencesView?.classList.add('hidden');
  talentsView?.classList.add('hidden');
  messagesView?.classList.add('hidden');
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
  competencesView?.classList.add('hidden');
  talentsView?.classList.add('hidden');
  messagesView?.classList.add('hidden');
  heroMission.textContent = 'Compétences';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  renderSkillsScreen();
}

function openAttributesScreen() {
  if (!currentAgent) return;
  initializeAttributesState();
  
  // Stocker les valeurs initiales au moment de l'ouverture
  attributesViewInitialValues = {
    conscience: attributesState.attributes.conscience,
    dexterity: attributesState.attributes.dexterity,
    technique: attributesState.attributes.technique,
  };
  
  // Initialiser le suivi des modifications pour la vue des attributs
  attributesViewModifications = {};
  
  dashboardView.classList.add('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.remove('hidden');
  competencesView?.classList.add('hidden');
  talentsView?.classList.add('hidden');
  messagesView?.classList.add('hidden');
  heroMission.textContent = 'Attributs';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');
  renderAttributesScreen();
  
  // Désactiver le bouton Valider par défaut (pas de modifications encore)
  if (saveAttributesBtn) {
    saveAttributesBtn.disabled = true;
  }
}

function openTalentsScreen() {
  if (!currentAgent) return;

  dashboardView.classList.add('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.add('hidden');
  competencesView?.classList.add('hidden');
  talentsView?.classList.remove('hidden');
  messagesView?.classList.add('hidden');
  heroMission.textContent = 'Talents';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');

  renderTalentsScreen();
}

if (confirmTalentBtn) {
  confirmTalentBtn.addEventListener('click', confirmTalentSelection);
}

messagesView?.addEventListener('click', async (event) => {
  const button = event.target.closest('.message-toggle');
  if (!button) return;
  const messageId = Number(button.dataset.messageId);
  if (!messageId) return;

  if (expandedMessageIds.has(messageId)) {
    expandedMessageIds.delete(messageId);
  } else {
    expandedMessageIds.add(messageId);
    // Marquer le message comme lu quand on l'ouvre pour la première fois
    const message = currentAgentMessages.find(m => m.id == messageId);
    if (message && message.is_read !== true) {
      try {
        await requestJson(`/api/messages/${messageId}/read`, { method: 'PATCH' });
        // Mettre à jour localement
        message.is_read = true;
      } catch (error) {
        console.error('Erreur lors du marquage du message comme lu:', error);
      }
    }
  }

  renderMessages(currentAgentMessages);
});

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
    talentsView?.classList.add('hidden');
    messagesView?.classList.add('hidden');
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
  updateSaveAttributesButtonState();
}

async function renderTalentsScreen() {
  if (!talentsContainer || !talentsAvailableContainer || !currentAgent) return;

  selectedAgentTalent = null;
  selectedAgentTalentId = null;
  selectedAgentTalentTile = null;
  if (confirmTalentBtn) {
    confirmTalentBtn.disabled = true;
    confirmTalentBtn.title = 'Sélectionnez un talent disponible pour activer.';
  }

  try {
    const [activeResponse, allResponse] = await Promise.all([
      fetch(`/api/agents/${currentAgent.id}/talents`),
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
    const hasTalentPoints = Number(currentAgent.availableTalentPoints ?? 0) > 0;

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
        talentsAvailableContainer.appendChild(createTalentTile(talent, true, !hasTalentPoints));
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des talents:', error);
    talentsContainer.innerHTML = '<div class="talents-empty">Erreur de chargement des talents.</div>';
    talentsAvailableContainer.innerHTML = '<div class="talents-empty">Erreur de chargement des talents.</div>';
  }
}

function createTalentTile(talent, isAvailable = false, isDisabled = false) {
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
  talentInfoBtn.dataset.talentDescription = talent.description || 'Aucune description disponible.';

  talentInfoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showTalentDescription(talent.description || 'Aucune description disponible.');
  });

  if (isAvailable && !isDisabled) {
    talentTile.addEventListener('click', () => selectAvailableTalent(talent, talentTile));
    talentTile.style.cursor = 'pointer';
  }

  talentTile.appendChild(talentName);
  talentTile.appendChild(talentInfoBtn);
  return talentTile;
}

function selectAvailableTalent(talent, tile) {
  if (!talent || !talent.id) return;

  if (selectedAgentTalentId === Number(talent.id)) {
    if (selectedAgentTalentTile) {
      selectedAgentTalentTile.classList.remove('selected');
    }
    selectedAgentTalent = null;
    selectedAgentTalentId = null;
    selectedAgentTalentTile = null;
  } else {
    if (selectedAgentTalentTile) {
      selectedAgentTalentTile.classList.remove('selected');
    }
    selectedAgentTalent = talent;
    selectedAgentTalentId = Number(talent.id);
    selectedAgentTalentTile = tile;
    tile.classList.add('selected');
  }

  if (confirmTalentBtn) {
    confirmTalentBtn.disabled = !selectedAgentTalentId;
  }
}

async function confirmTalentSelection() {
  if (!currentAgent || !selectedAgentTalent || !selectedAgentTalentId) return;
  if (Number(currentAgent.availableTalentPoints ?? 0) <= 0) {
    showToast('Aucun point de talent disponible.');
    return;
  }

  currentAgent.availableTalentPoints = Math.max(0, Number(currentAgent.availableTalentPoints ?? 0) - 1);
  currentAgent.availableStatsPoints = Math.max(0, Number(currentAgent.availableStatsPoints ?? 0) - 1);
  currentAgent.talents = Array.isArray(currentAgent.talents)
    ? [...currentAgent.talents, { ...selectedAgentTalent, id: Number(selectedAgentTalentId) }]
    : [{ ...selectedAgentTalent, id: Number(selectedAgentTalentId) }];

  renderAgent(currentAgent);
  await persistCurrentAgent();
  await renderTalentsScreen();
  showToast(`Talent activé : ${selectedAgentTalent.title}`);
}

function showTalentDescription(description) {
  if (!competenceDescModal || !competenceDescContent) return;
  competenceDescContent.textContent = description;
  competenceDescModal.classList.add('active');
}

function updateSaveAttributesButtonState() {
  if (!saveAttributesBtn) return;
  
  // Vérifier si des modifications ont été apportées
  const hasModifications = Object.keys(attributesViewModifications).length > 0;
  saveAttributesBtn.disabled = !hasModifications;
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
      // ✅ Même mécanisme que pour les stats : désactiver le bouton "+" quand reserve = 0
      increaseBtn.disabled = attributesState.reserve <= 0;
    }
    
    if (decreaseBtn) {
      const currentValue = Number(attributesState.attributes[attr]) || 0;
      const baseValue = Number(baseAttributes[attr]) || 1;
      // ✅ Même mécanisme que pour les stats : afficher "-" si valeur > base
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
      // ✅ Utiliser la valeur de l'agent pour les groupes principaux (Conscience, Dextérité, Technique)
      // Normaliser le nom du groupe pour correspondre aux clés de currentAgent.attributes
      const normalizedGroupName = normalizeKey(group.name);
      const agentGroupValue = currentAgent.attributes?.[normalizedGroupName] || group.value || 0;
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
    
    // ✅ Fusionner avec les compétences éventuellement sauvegardées dans currentAgent
    if (currentAgent.skills) {
      deepMergeCompetences(currentAgent.skills);
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

  // Réinitialiser l'état des attributs au niveau 0
  currentAttributeGroup = null;
  currentAttributeGroupValue = 0;
  attributeModifications = {};
  attributeBaseValues = {};
  currentAvailablePoints = 0;

  competencesContainer.innerHTML = '';
  const attrKeys = Object.keys(competencesState).filter(k => !['name', 'description', 'id', 'value'].includes(k));

  attrKeys.forEach(attrKey => {
    const attr = competencesState[attrKey];
    const attrValue = attr.value || 0;
    const attrDiv = document.createElement('div');
    attrDiv.className = 'competence-level';
    attrDiv.dataset.level = '1';
    attrDiv.dataset.key = attrKey;
    
    // Calculer les points disponibles pour ce groupe principal
    // attr est déjà un groupe principal (Conscience, Dextérité, Technique)
    const availablePoints = calculateAvailablePointsForGroup(attr);
    
    // Ajouter la classe si des points sont disponibles
    if (availablePoints > 0) {
      attrDiv.classList.add('has-available-points');
    }
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
  
  // Masquer le bouton Valider au niveau 0 (affiché uniquement au niveau 1)
  if (saveCompetencesBtn) {
    saveCompetencesBtn.style.display = 'none';
  }
}

// Mettre à jour l'état du bouton Valider
function updateSaveButtonState() {
  if (!saveCompetencesBtn) return;
  
  // Activer le bouton s'il y a des modifications (niveau 2, 3 ou 4)
  const hasAttributeModifications = attributeModifications && Object.keys(attributeModifications).length > 0;
  const hasSkillGroupModifications = skillGroupModifications && Object.keys(skillGroupModifications).length > 0;
  const hasSkillModifications = skillModifications && Object.keys(skillModifications).length > 0;
  const hasModifications = hasAttributeModifications || hasSkillGroupModifications || hasSkillModifications;
  saveCompetencesBtn.disabled = !hasModifications;
}

// Calculer le stock de points disponibles pour un groupe d'attributs
// Stock = valeur du groupe - somme des valeurs des attributs enfants
function calculateAvailablePointsForGroup(group) {
  const groupValue = group.value || 0;
  let sum = 0;
  (group.attributes || []).forEach(attr => {
    sum += (attr.value || 0);
  });
  return groupValue - sum;
}

// Calculer le stock de points disponibles en tenant compte des modifications en cours
function calculateAvailablePointsForGroupWithModifications(group) {
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

// Sauvegarder les modifications des attributs pour un groupe
async function saveAttributeValuesForGroup(groupId) {
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
    
    // Forcer la réinitialisation des valeurs de base en réinitialisant currentAttributeGroup
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

// Mettre à jour la valeur d'un attribut et recalculer le stock
function handleAttributeValueChange(attributeId, change, group) {
  // Trouver l'attribut dans le groupe
  const attribute = group.attributes.find(a => a.id === attributeId);
  if (!attribute) return;
  
  // Calculer la nouvelle valeur à partir de la valeur ACTUELLE (base + modifications)
  const currentValue = attributeModifications[attributeId] !== undefined
    ? attributeModifications[attributeId]
    : (attribute.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const groupValue = group.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur (en utilisant les valeurs de base + modifications)
  let totalSum = 0;
  group.attributes.forEach(attr => {
    const attrId = attr.id;
    const currentModification = attributeModifications[attrId];
    const currentValue = currentModification !== undefined ? currentModification : (attr.value || 0);
    
    if (attrId === attributeId) {
      totalSum += newValue;  // Utiliser la nouvelle valeur pour l'attribut modifié
    } else {
      totalSum += currentValue;  // Utiliser la valeur actuelle (base + modifications existantes)
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur du groupe
  if (totalSum > groupValue) {
    // Ne pas permettre cette modification
    return false;
  }
  
  // Stocker la modification (sans modifier la hiérarchie)
  attributeModifications[attributeId] = newValue;
  
  // Recalculer le stock disponible (en utilisant les valeurs de base + modifications)
  currentAvailablePoints = calculateAvailablePointsForGroupWithModifications(group);
  
  // Mettre à jour l'état du bouton Valider
  updateSaveButtonState();
  
  return true;
}

// Mettre à jour la valeur d'un groupe de compétences et recalculer le stock
function handleSkillGroupValueChange(skillGroupId, change, parentAttribute, attributeId) {
  // Trouver le groupe de compétences dans l'attribut parent
  const skillGroup = parentAttribute.skillGroups.find(sg => sg.id === skillGroupId);
  if (!skillGroup) return;
  
  // Calculer la nouvelle valeur à partir de la valeur ACTUELLE (base + modifications)
  const currentValue = skillGroupModifications[skillGroupId] !== undefined
    ? skillGroupModifications[skillGroupId]
    : (skillGroup.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const attributeValue = parentAttribute.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur (en utilisant les valeurs de base + modifications)
  let totalSum = 0;
  parentAttribute.skillGroups.forEach(sg => {
    const sgId = sg.id;
    const currentModification = skillGroupModifications[sgId];
    const currentSgValue = currentModification !== undefined ? currentModification : (sg.value || 0);
    
    if (sgId === skillGroupId) {
      totalSum += newValue;  // Utiliser la nouvelle valeur pour le groupe modifié
    } else {
      totalSum += currentSgValue;  // Utiliser la valeur actuelle (base + modifications existantes)
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur de l'attribut parent
  if (totalSum > attributeValue) {
    // Ne pas permettre cette modification
    return false;
  }
  
  // Stocker la modification (sans modifier la hiérarchie)
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

// Calculer le stock de points disponibles pour les groupes de compétences
function calculateAvailablePointsForSkillGroups(parentAttribute) {
  const attributeValue = parentAttribute.value || 0;
  let sum = 0;
  (parentAttribute.skillGroups || []).forEach(sg => {
    const sgId = sg.id;
    const currentModification = skillGroupModifications[sgId];
    sum += currentModification !== undefined ? currentModification : (sg.value || 0);
  });
  return attributeValue - sum;
}

// Sauvegarder les modifications des groupes de compétences pour un attribut
async function saveSkillGroupValuesForAttribute(attributeId) {
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
    
    // Recharger les données pour s'assurer que tout est synchronisé
    await loadCompetencesData();
    
    // Forcer la réinitialisation des valeurs de base
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
    
    // Restaurer currentAttributeGroup après le render
    currentAttributeGroup = previousGroup;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showToast('Erreur lors de la sauvegarde: ' + (error.message || 'Inconnu'));
  }
}

// Mettre à jour la valeur d'une compétence et recalculer le stock
function handleSkillValueChange(skillId, change, parentSkillGroup, skillGroupId) {
  // Trouver la compétence dans le groupe de compétences parent
  const skill = parentSkillGroup.skills.find(s => s.id === skillId);
  if (!skill) return;
  
  // Calculer la nouvelle valeur à partir de la valeur ACTUELLE (base + modifications)
  const currentValue = skillModifications[skillId] !== undefined
    ? skillModifications[skillId]
    : (skill.value || 0);
  let newValue = currentValue + change;
  
  // Ne pas descendre en dessous de 0
  if (newValue < 0) newValue = 0;
  
  const skillGroupValue = parentSkillGroup.value || 0;
  
  // Calculer la somme totale avec la nouvelle valeur (en utilisant les valeurs de base + modifications)
  let totalSum = 0;
  parentSkillGroup.skills.forEach(s => {
    const sId = s.id;
    const currentModification = skillModifications[sId];
    const currentSValue = currentModification !== undefined ? currentModification : (s.value || 0);
    
    if (sId === skillId) {
      totalSum += newValue;  // Utiliser la nouvelle valeur pour la compétence modifiée
    } else {
      totalSum += currentSValue;  // Utiliser la valeur actuelle (base + modifications existantes)
    }
  });
  
  // Vérifier que la somme totale ne dépasse pas la valeur du groupe de compétences parent
  if (totalSum > skillGroupValue) {
    // Ne pas permettre cette modification
    return false;
  }
  
  // Stocker la modification (sans modifier la hiérarchie)
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

// Calculer le stock de points disponibles pour les compétences
function calculateAvailablePointsForSkills(parentSkillGroup) {
  const skillGroupValue = parentSkillGroup.value || 0;
  let sum = 0;
  (parentSkillGroup.skills || []).forEach(skill => {
    const skillId = skill.id;
    const currentModification = skillModifications[skillId];
    sum += currentModification !== undefined ? currentModification : (skill.value || 0);
  });
  return skillGroupValue - sum;
}

// Sauvegarder les modifications des compétences pour un groupe de compétences
async function saveSkillValuesForGroup(skillGroupId) {
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
    
    // Recharger les données pour s'assurer que tout est synchronisé
    await loadCompetencesData();
    
    // Forcer la réinitialisation des valeurs de base
    const previousGroup = currentAttributeGroup;
    currentAttributeGroup = null;
    
    // Trouver le chemin complet pour réafficher correctement le niveau 3
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
    
    // Restaurer currentAttributeGroup après le render
    currentAttributeGroup = previousGroup;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showToast('Erreur lors de la sauvegarde: ' + (error.message || 'Inconnu'));
  }
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
    // NEW FEATURE: Niveau des attributs avec stock de points disponibles
    // Trouver le groupe parent dans la hiérarchie
    const groupId = Number(path[0]);
    const group = competencesHierarchy.find(g => g.id === groupId);
    
    // Debug: si group est undefined, essayer de trouver pourquoi
    if (!group) {
      console.warn('Group not found for groupId:', groupId, 'in path:', path);
      console.warn('Available groups:', competencesHierarchy.map(g => ({id: g.id, name: g.name})));
      competencesContainer.innerHTML = '<div class="competence-empty">Groupe introuvable. Rechargez la page.</div>';
      return;
    }
    
    if (group) {
      // Initialiser l'état pour ce groupe
      currentAttributeGroup = groupId;
      currentAttributeGroupValue = group.value || 0;
      
      // Stocker les valeurs de base et réinitialiser les modifications UNIQUEMENT la première fois qu'on entre au niveau 1
      // ou quand on change de groupe
      if (Object.keys(attributeBaseValues).length === 0 || currentAttributeGroup !== groupId) {
        attributeBaseValues = {};
        attributeModifications = {};
        (group.attributes || []).forEach(attr => {
          attributeBaseValues[attr.id] = attr.value || 0;
        });
      }
      
      // Recalculer le stock disponible (peut changer après une modification)
      currentAvailablePoints = calculateAvailablePointsForGroupWithModifications(group);
      
      // Afficher le stock de points disponibles
      const reserveDiv = document.createElement('div');
      reserveDiv.className = 'reserve-box';
      reserveDiv.innerHTML = `Points disponibles: <strong id="attributeReserveCount">${currentAvailablePoints}</strong>`;
      competencesContainer.appendChild(reserveDiv);
      
      // Ajouter un conteneur pour les attributs
      const attributesContainer = document.createElement('div');
      attributesContainer.className = 'attributes-container';
      
      // Afficher chaque attribut avec boutons +/-
      (group.attributes || []).forEach((subAttr, index) => {
        // Utiliser la valeur modifiée si elle existe, sinon la valeur de base
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
        
        // Règles pour les boutons :
        // - Bouton "+" visible si stock de points > 0
        // - Bouton "-" visible si le niveau ACTUEL > niveau de base (enregistré en base)
        // - Bouton "-" N'EST PAS visible si : pas de modification OU niveau actuel = niveau de base
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
        
        // Gérer les clics sur les boutons +/-
        const decreaseBtn = subAttrDiv.querySelector('[data-action="decrease"]');
        const increaseBtn = subAttrDiv.querySelector('[data-action="increase"]');
        
        if (decreaseBtn) {
          // ✅ Capturer les valeurs ACTUELLES de subAttr et group
          const currentSubAttr = subAttr;
          const currentGroup = group;
          decreaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAttributeValueChange(currentSubAttr.id, -1, currentGroup);
            renderCompetencesLevel(1, key, parentKeys);
          });
        }
        
        if (increaseBtn) {
          // ✅ Capturer les valeurs ACTUELLES de subAttr et group
          const currentSubAttr = subAttr;
          const currentGroup = group;
          increaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAttributeValueChange(currentSubAttr.id, 1, currentGroup);
            renderCompetencesLevel(1, key, parentKeys);
          });
        }
        
        // Navigation vers le niveau 2 (groupes de compétences) en cliquant sur l'attribut
        // mais pas sur les boutons +/- ou le bouton d'info
        subAttrDiv.addEventListener('click', (e) => {
          // Ne pas naviguer si le clic est sur un bouton d'action (+/-) ou sur l'icône d'info
          if (!e.target.dataset.action && !e.target.classList.contains('info-icon')) {
            // Clic sur l'attribut lui-même (pas sur les boutons +/- ou info)
            renderCompetencesLevel(2, subAttr.id, path);
          }
        });
        
        attributesContainer.appendChild(subAttrDiv);
      });
      
      competencesContainer.appendChild(attributesContainer);
      
      // Configurer le bouton Valider existant (saveCompetencesBtn)
      if (saveCompetencesBtn) {
        saveCompetencesBtn.style.display = 'block';
        saveCompetencesBtn.onclick = () => saveAttributeValuesForGroup(groupId);
        // Mettre à jour l'état (actif si modifications existantes)
        updateSaveButtonState();
      }
    }
  } else if (level === 2) {
    // Niveau des groupes de compétences (Furtivité, Observation) pour un attribut
    // path = [groupId, attributeId]
    const groupId = Number(path[0]); // ID du groupe d'attributs parent (ex: Conscience)
    const attributeId = Number(path[1]); // ID de l'attribut parent (ex: Environnement)
    
    // Trouver l'attribut parent
    const parentGroup = competencesHierarchy.find(g => g.id === groupId);
    if (!parentGroup) {
      console.warn('Groupe parent introuvable pour attributeId:', attributeId, 'groupId:', groupId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentAttribute = parentGroup.attributes.find(attr => attr.id === attributeId);
    if (!parentAttribute) {
      console.warn('Attribut parent introuvable pour attributeId:', attributeId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    // Initialiser l'état pour cet attribut
    const attributeValue = parentAttribute.value || 0;
    
    // Stocker les valeurs de base et réinitialiser les modifications UNIQUEMENT la première fois
    // ou quand on change d'attribut
    if (Object.keys(skillGroupBaseValues).length === 0 || currentAttributeGroup !== attributeId) {
      skillGroupBaseValues = {};
      skillGroupModifications = {};
      (parentAttribute.skillGroups || []).forEach(sg => {
        skillGroupBaseValues[sg.id] = sg.value || 0;
      });
    }
    
    // Initialiser currentAttributeGroup pour ce niveau
    currentAttributeGroup = attributeId;
    
    // Recalculer le stock disponible (valeur de l'attribut parent - somme des groupes de compétences)
    currentSkillGroupAvailablePoints = calculateAvailablePointsForSkillGroups(parentAttribute);
    
    // Afficher le stock de points disponibles
    const reserveDiv = document.createElement('div');
    reserveDiv.className = 'reserve-box';
    reserveDiv.innerHTML = `Points disponibles: <strong id="skillGroupReserveCount">${currentSkillGroupAvailablePoints}</strong>`;
    competencesContainer.appendChild(reserveDiv);
    
    // Ajouter un conteneur pour les groupes de compétences
    const skillGroupsContainer = document.createElement('div');
    skillGroupsContainer.className = 'skill-groups-container';
    
    // Afficher chaque groupe de compétences avec boutons +/- et valeur
    (parentAttribute.skillGroups || []).forEach((sg, index) => {
      // Utiliser la valeur modifiée si elle existe, sinon la valeur de base
      const sgValue = skillGroupModifications[sg.id] !== undefined 
        ? skillGroupModifications[sg.id] 
        : (sg.value || 0);
      
      const sgDiv = document.createElement('div');
      sgDiv.className = 'competence-level';
      sgDiv.dataset.level = '3';
      sgDiv.dataset.key = sg.id;
      
      // Calculer les points disponibles pour ce groupe de compétences
      const availablePoints = calculateAvailablePointsForSkills(sg);
      
      // Ajouter la classe si des points sont disponibles
      if (availablePoints > 0) {
        sgDiv.classList.add('has-available-points');
      }
      
      // Règles pour les boutons :
      // - Bouton "+" visible si stock de points > 0
      // - Bouton "-" visible si le niveau ACTUEL > niveau de base
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
          handleSkillGroupValueChange(sg.id, -1, parentAttribute, attributeId);
          renderCompetencesLevel(2, attributeId, [groupId]);
        });
      }
      
      if (increaseBtn) {
        increaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillGroupValueChange(sg.id, 1, parentAttribute, attributeId);
          renderCompetencesLevel(2, attributeId, [groupId]);
        });
      }
      
      // Navigation vers le niveau 3 (compétences) en cliquant sur le groupe de compétences
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
      saveCompetencesBtn.onclick = () => saveSkillGroupValuesForAttribute(attributeId);
      updateSaveButtonState();
    }
    
  } else if (level === 3) {
    // Niveau des compétences (Infiltration, Filature, Crochetage, Sabotage) pour un groupe de compétences
    // path = [groupId, attributeId, skillGroupId]
    const groupId = Number(path[0]); // ID du groupe d'attributs parent (ex: Conscience)
    const attributeId = Number(path[1]); // ID de l'attribut parent (ex: Environnement)
    const skillGroupId = Number(path[2]); // ID du groupe de compétences parent (ex: Furtivité)
    
    // Trouver la hiérarchie parent
    const parentGroup = competencesHierarchy.find(g => g.id === groupId);
    if (!parentGroup) {
      console.warn('Groupe parent introuvable pour skillGroupId:', skillGroupId, 'groupId:', groupId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentAttribute = parentGroup.attributes.find(attr => attr.id === attributeId);
    if (!parentAttribute) {
      console.warn('Attribut parent introuvable pour attributeId:', attributeId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    const parentSkillGroup = parentAttribute.skillGroups.find(sg => sg.id === skillGroupId);
    if (!parentSkillGroup) {
      console.warn('Groupe de compétences parent introuvable pour skillGroupId:', skillGroupId);
      competencesContainer.innerHTML = '<div class="competence-empty">Données manquantes. Rechargez la page.</div>';
      return;
    }
    
    // Initialiser l'état pour ce groupe de compétences
    const skillGroupValue = parentSkillGroup.value || 0;
    
    // Stocker les valeurs de base et réinitialiser les modifications UNIQUEMENT la première fois
    // ou quand on change de groupe de compétences
    if (Object.keys(skillBaseValues).length === 0 || currentAttributeGroup !== skillGroupId) {
      skillBaseValues = {};
      skillModifications = {};
      (parentSkillGroup.skills || []).forEach(skill => {
        skillBaseValues[skill.id] = skill.value || 0;
      });
    }
    
    // Initialiser currentAttributeGroup pour ce niveau
    currentAttributeGroup = skillGroupId;
    
    // Recalculer le stock disponible (valeur du groupe de compétences parent - somme des compétences)
    currentSkillAvailablePoints = calculateAvailablePointsForSkills(parentSkillGroup);
    
    // Afficher le stock de points disponibles
    const reserveDiv = document.createElement('div');
    reserveDiv.className = 'reserve-box';
    reserveDiv.innerHTML = `Points disponibles: <strong id="skillReserveCount">${currentSkillAvailablePoints}</strong>`;
    competencesContainer.appendChild(reserveDiv);
    
    // Ajouter un conteneur pour les compétences
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skills-container';
    
    // Afficher chaque compétence avec boutons +/- et valeur
    (parentSkillGroup.skills || []).forEach((skill, index) => {
      // Utiliser la valeur modifiée si elle existe, sinon la valeur de base
      const skillValue = skillModifications[skill.id] !== undefined 
        ? skillModifications[skill.id] 
        : (skill.value || 0);
      
      const skillDiv = document.createElement('div');
      skillDiv.className = 'competence-level';
      skillDiv.dataset.level = '4';
      skillDiv.dataset.key = skill.id;
      
      // Règles pour les boutons :
      // - Bouton "+" visible si stock de points > 0
      // - Bouton "-" visible si le niveau ACTUEL > niveau de base
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
          handleSkillValueChange(skill.id, -1, parentSkillGroup, skillGroupId);
          renderCompetencesLevel(3, skillGroupId, [groupId, attributeId]);
        });
      }
      
      if (increaseBtn) {
        increaseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSkillValueChange(skill.id, 1, parentSkillGroup, skillGroupId);
          renderCompetencesLevel(3, skillGroupId, [groupId, attributeId]);
        });
      }
      
      skillsContainer.appendChild(skillDiv);
    });
    
    competencesContainer.appendChild(skillsContainer);
    
    // Configurer le bouton Valider pour ce niveau
    if (saveCompetencesBtn) {
      saveCompetencesBtn.style.display = 'block';
      saveCompetencesBtn.onclick = () => saveSkillValuesForGroup(skillGroupId);
      updateSaveButtonState();
    }
    
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
  // ✅ S'assurer que reserve est bien un number
  if (typeof skillsState.reserve !== 'number' || isNaN(skillsState.reserve)) {
    skillsState.reserve = Number(skillsState.reserve) || 0;
  }
  
  if (action === 'increase') {
    if (skillsState.reserve <= 0) return;
    skillsState.stats[stat] = (skillsState.stats[stat] || 0) + 1;
    skillsState.reserve -= 1;
  } else if (action === 'decrease') {
    if (skillsState.stats[stat] <= (baseStats[stat] || 1)) return;
    skillsState.stats[stat] = Math.max(baseStats[stat] || 1, skillsState.stats[stat] - 1);
    skillsState.reserve += 1;
  }
  
  // ✅ NOUVEAU : Mettre à jour currentAgent immédiatement
  if (currentAgent) {
    currentAgent.stats = { ...currentAgent.stats, ...skillsState.stats };
    currentAgent.availableStatsPoints = skillsState.reserve;
  }
  
  renderSkillsScreen();
}

function changeAttributeStat(attr, action) {
  // ✅ S'assurer que reserve est bien un number
  if (typeof attributesState.reserve !== 'number' || isNaN(attributesState.reserve)) {
    attributesState.reserve = Number(attributesState.reserve) || 0;
  }
  
  // Stocker la valeur actuelle avant modification pour détecter les changements
  const oldValue = attributesState.attributes[attr];
  
  if (action === 'increase') {
    if (attributesState.reserve <= 0) return;
    attributesState.attributes[attr] = (attributesState.attributes[attr] || 0) + 1;
    attributesState.reserve -= 1;
  } else if (action === 'decrease') {
    if (attributesState.attributes[attr] <= (baseAttributes[attr] || 1)) return;
    attributesState.attributes[attr] = Math.max(baseAttributes[attr] || 1, attributesState.attributes[attr] - 1);
    attributesState.reserve += 1;
  }
  
  // ✅ NOUVEAU : Mettre à jour currentAgent immédiatement
  if (currentAgent) {
    currentAgent.attributes = { ...currentAgent.attributes, ...attributesState.attributes };
    currentAgent.availableAttributesPoints = attributesState.reserve;
  }
  
  // Marquer la modification dans attributesViewModifications
  const newValue = attributesState.attributes[attr];
  const initialValue = attributesViewInitialValues[attr];
  
  if (newValue !== initialValue) {
    // La valeur actuelle est différente de la valeur initiale
    attributesViewModifications[attr] = newValue;
  } else {
    // La valeur actuelle est revenue à la valeur initiale
    delete attributesViewModifications[attr];
  }
  
  renderAttributesScreen();
  updateSaveAttributesButtonState();
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
  
  // Réinitialiser les modifications après sauvegarde
  attributesViewModifications = {};
  attributesViewInitialValues = {};
  
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
  renderAgent(currentAgent);
  openDashboardView();
}

function openDashboardView() {
  dashboardView.classList.remove('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.add('hidden');
  competencesView?.classList.add('hidden');
  talentsView?.classList.add('hidden');
  messagesView?.classList.add('hidden');
  heroMission.textContent = 'Tableau de bord de l’Aventure';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.add('hidden');
  
  // Mettre à jour le compteur de messages non lus au retour au dashboard
  updateMessagesButtonLabel();
}

// Mettre à jour le libellé du bouton Messages avec le nombre de messages non lus
function updateMessagesButtonLabel() {
  if (!messagesBtn || !currentAgentMessages) return;
  
  const unreadCount = currentAgentMessages.filter(m => m.is_read !== true).length;
  
  if (unreadCount > 0) {
    messagesBtn.textContent = `Messages (${unreadCount})`;
  } else {
    messagesBtn.textContent = 'Messages';
  }
}

function getMessagePreview(message) {
  const value = String(message?.value || '').replace(/\s+/g, ' ').trim();
  return value.length > 100 ? `${value.slice(0, 100)}…` : value;
}

function renderMessages(messages) {
  currentAgentMessages = Array.isArray(messages) ? messages : [];
  if (!messagesList) return;
  
  // Mettre à jour le compteur de messages non lus sur le bouton
  updateMessagesButtonLabel();

  if (!currentAgentMessages.length) {
    messagesList.innerHTML = '<div class="messages-empty">Aucun message pour le moment.</div>';
    return;
  }

  messagesList.innerHTML = currentAgentMessages.map((message) => {
    const isExpanded = expandedMessageIds.has(message.id);
    const preview = sanitizeText(getMessagePreview(message) || 'Aucun contenu.');
    const fullContent = sanitizeText(String(message.value || '')).replace(/\n/g, '<br>');
    const isUnread = !message.is_read;

    return `
      <div class="message-card ${isUnread ? 'unread' : ''}">
        <button type="button" class="message-toggle" data-message-id="${message.id}">
          <span class="message-title">${isUnread ? '📩 Nouveau message' : '✅ Message lu'}</span>
          <span class="message-preview">${preview}</span>
        </button>
        <div class="message-body ${isExpanded ? 'expanded' : 'collapsed'}">${isExpanded ? fullContent : ''}</div>
      </div>
    `;
  }).join('');
}

async function loadMessagesForCurrentAgent() {
  if (!currentAgent?.id) return [];

  try {
    const result = await requestJson(`/api/messages/${currentAgent.id}`);
    const messages = Array.isArray(result?.messages) ? result.messages : [];
    const sortedMessages = messages.sort((a, b) => Number(b.id) - Number(a.id));
    // Mettre à jour les messages courants et le libellé du bouton
    currentAgentMessages = sortedMessages;
    updateMessagesButtonLabel();
    return sortedMessages;
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    showToast('Impossible de charger vos messages.');
    return [];
  }
}

async function openMessagesScreen() {
  if (!currentAgent) return;

  expandedMessageIds = new Set();
  dashboardView.classList.add('hidden');
  inventoryView.classList.add('hidden');
  skillsView?.classList.add('hidden');
  attributesView?.classList.add('hidden');
  competencesView?.classList.add('hidden');
  talentsView?.classList.add('hidden');
  messagesView?.classList.remove('hidden');
  heroMission.textContent = 'Messages';
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (homeBtn) homeBtn.classList.remove('hidden');

  renderMessages([]);
  const messages = await loadMessagesForCurrentAgent();
  renderMessages(messages);
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
    // Protégeons contre les objets non sérialisables
    let agentData;
    try {
      agentData = JSON.parse(JSON.stringify(currentAgent));
    } catch (e) {
      console.error('Erreur de sérialisation de currentAgent:', e);
      console.error('currentAgent:', currentAgent);
      throw e;
    }
    
    const response = await requestJson(`/api/agents/${currentAgent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    });
    
    // Vérifier la réponse
    if (!response || !response.success) {
      console.error('Erreur lors de la persistence:', response?.message || 'Réponse invalide');
    }
  } catch (error) {
    console.error('Erreur complète dans persistCurrentAgent:', error);
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
    // S'assurer que talents est un tableau d'objets avec id
    if (!Array.isArray(talents)) {
      talents = [];
    }
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
  const talent = talents[talentIndex];
  if (!talent || talent.id === null || talent.id === undefined) return;
  selectedTalent = talent;
  talentIdSelected = Number(talent.id); // Forcer la conversion en number
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
    // ✅ NOUVEAU : talentId supprimé, talents géré via talents_value
    talents: selectedTalent ? [{...selectedTalent, id: Number(selectedTalent.id)}] : [],
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
if (talentsBtn) talentsBtn.addEventListener('click', openTalentsScreen);
if (messagesBtn) messagesBtn.addEventListener('click', openMessagesScreen);
if (saveSkillsBtn) saveSkillsBtn.addEventListener('click', saveSkillsAllocation);
if (saveAttributesBtn) saveAttributesBtn.addEventListener('click', saveAttributesAllocation);
// ❌ Supprimé : if (saveCompetencesBtn) saveCompetencesBtn.addEventListener('click', saveCompetencesAllocation);
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
