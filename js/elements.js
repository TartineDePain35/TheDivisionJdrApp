/**
 * Sélecteurs DOM centralisés
 * Tous les éléments du DOM sont référencés ici pour éviter la duplication
 */

// ============================================================================
// SECTIONS / VIEWS
// ============================================================================
export const sections = {
  landing: document.getElementById('landing'),
  createAgent: document.getElementById('createAgent'),
  mainPage: document.getElementById('mainPage'),
  competences: document.getElementById('competencesView'),
};

// ============================================================================
// AUTHENTIFICATION
// ============================================================================
export const loginForm = document.getElementById('loginForm');
export const createAgentBtn = document.getElementById('createAgentBtn');
export const logoutBtn = document.getElementById('logoutBtn');
export const homeBtn = document.getElementById('homeBtn');

// ============================================================================
// HEADER / AGENT INFO
// ============================================================================
export const brandTag = document.getElementById('brandTag');
export const heroName = document.getElementById('heroName');
export const heroLife = document.getElementById('heroLife');
export const heroStatsPoints = document.getElementById('heroStatsPoints');
export const heroAttrPoints = document.getElementById('heroAttrPoints');
export const heroTalentPoint = document.getElementById('heroTalentPoint');
export const heroMission = document.getElementById('heroMission');
export const missionDescription = document.getElementById('missionDescription');
export const agentEffects = document.getElementById('agentEffects');

// ============================================================================
// TOAST
// ============================================================================
export const toast = document.getElementById('toast');

// ============================================================================
// MODALS
// ============================================================================
export const createAgentModal = document.getElementById('createAgentModal');
export const activateAgentBtn = document.getElementById('activateAgentBtn');
export const deleteItemModal = document.getElementById('deleteItemModal');
export const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
export const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
export const itemDetailsModal = document.getElementById('itemDetailsModal');
export const closeItemDetailsBtn = document.getElementById('closeItemDetailsBtn');
export const addItemModal = document.getElementById('addItemModal');
export const closeAddItemModalBtn = document.getElementById('closeAddItemModalBtn');
export const competenceDescModal = document.getElementById('competenceDescModal');
export const closeCompetenceDescBtn = document.getElementById('closeCompetenceDescBtn');

// Modal contents
export const itemDetailsContent = document.getElementById('itemDetailsContent');
export const competenceDescContent = document.getElementById('competenceDescContent');

// ============================================================================
// MAIN VIEWS
// ============================================================================
export const dashboardView = document.getElementById('dashboardView');
export const inventoryView = document.getElementById('inventoryView');
export const skillsView = document.getElementById('skillsView');
export const attributesView = document.getElementById('attributesView');
export const talentsView = document.getElementById('talentsView');
export const messagesView = document.getElementById('messagesView');

// ============================================================================
// NAVIGATION BUTTONS
// ============================================================================
export const inventoryBtn = document.getElementById('inventoryBtn');
export const skillsBtn = document.getElementById('skillsBtn');
export const attributesBtn = document.getElementById('attributesBtn');
export const competencesBtn = document.getElementById('competencesBtn');
export const talentsBtn = document.getElementById('talentsBtn');
export const messagesBtn = document.getElementById('messagesBtn');

// ============================================================================
// SAVE BUTTONS
// ============================================================================
export const saveSkillsBtn = document.getElementById('saveSkillsBtn');
export const saveAttributesBtn = document.getElementById('saveAttributesBtn');
export const saveCompetencesBtn = document.getElementById('saveCompetencesBtn');

// ============================================================================
// TALENTS
// ============================================================================
export const talentsContainer = document.getElementById('talentsContainer');
export const talentsAvailableContainer = document.getElementById('talentsAvailableContainer');
export const confirmTalentBtn = document.getElementById('confirmTalentBtn');

// ============================================================================
// MESSAGES
// ============================================================================
export const messagesList = document.getElementById('messagesList');

// ============================================================================
// INVENTORY
// ============================================================================
export const inventoryList = document.getElementById('inventoryList');
export const inventoryCapacityLabel = document.getElementById('inventoryCapacity');
export const inventoryWeight = document.getElementById('inventoryWeight');
export const inventoryFill = document.getElementById('inventoryFill');
export const addInventoryItemBtn = document.getElementById('addInventoryItemBtn');

// ============================================================================
// COMPETENCES
// ============================================================================
export const competencesContainer = document.getElementById('competencesContainer');
export const skillsReserveCount = document.getElementById('skillsReserveCount');
export const attributesReserveCount = document.getElementById('attributesReserveCount');

// ============================================================================
// WIZARD (Création d'agent)
// ============================================================================
export const wizardStepNav = document.getElementById('wizardStepNav');
export const wizardContent = document.getElementById('wizardContent');
export const wizardBreadcrumb = document.getElementById('wizardBreadcrumb');
export const wizardBack = document.getElementById('wizardBack');
export const wizardNext = document.getElementById('wizardNext');
export const chooseTalentBtn = document.getElementById('chooseTalentBtn');
export const talentPrev = document.getElementById('talentPrev');
export const talentNext = document.getElementById('talentNext');
export const talentTitle = document.getElementById('talentTitle');
export const talentDescription = document.getElementById('talentDescription');
export const talentCard = document.getElementById('talentCard');
export const storyCount = document.getElementById('storyCount');

// ============================================================================
// AGENT INPUTS (Wizard)
// ============================================================================
export const agentInputs = {
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

// ============================================================================
// INVENTORY ADD MODAL
// ============================================================================
export const addItemTypeSelect = document.getElementById('addItemTypeSelect');
export const weaponTypeSelect = document.getElementById('weaponTypeSelect');
export const weaponCategorySelect = document.getElementById('weaponCategorySelect');
export const weaponClassSelect = document.getElementById('weaponClassSelect');
export const weaponNameSelect = document.getElementById('weaponNameSelect');
export const confirmAddInventoryItemBtn = document.getElementById('confirmAddInventoryItemBtn');
export const weaponSelectorSection = document.getElementById('weaponSelectorSection');

export const medicalTypeSelect = document.getElementById('medicalTypeSelect');
export const medicalCategorySelect = document.getElementById('medicalCategorySelect');
export const medicalNameSelect = document.getElementById('medicalNameSelect');
export const medicalSelectorSection = document.getElementById('medicalSelectorSection');

export const equipmentTypeSelect = document.getElementById('equipmentTypeSelect');
export const equipmentCategorySelect = document.getElementById('equipmentCategorySelect');
export const equipmentNameSelect = document.getElementById('equipmentNameSelect');
export const equipmentSelectorSection = document.getElementById('equipmentSelectorSection');

export const otherItemName = document.getElementById('otherItemName');
export const otherItemDescription = document.getElementById('otherItemDescription');
export const otherItemWeight = document.getElementById('otherItemWeight');
export const otherSelectorSection = document.getElementById('otherSelectorSection');
