const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'division.sqlite');

let SQL = null;
let db = null;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function parseJsonValue(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function serializeJsonValue(value) {
  return JSON.stringify(value || []);
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(params);
  stmt.free();
  saveDatabase();
  return result;
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function lastInsertId() {
  const result = db.exec('SELECT last_insert_rowid() AS id');
  if (!Array.isArray(result) || result.length === 0 || !Array.isArray(result[0].values) || result[0].values.length === 0) {
    return null;
  }
  return Number(result[0].values[0][0]);
}

function mapAgentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    firstName: row.firstName,
    age: row.age,
    profession: row.profession,
    sex: row.sex,
    familyStatus: row.familyStatus,
    children: row.children,
    story: row.story,
    talent: row.talent ? parseJsonValue(row.talent) : null,
    talentId: row.talentId,
    stats: parseJsonValue(row.stats),
    attributes: parseJsonValue(row.attributes),
    password: row.password,
    availableStatsPoints: row.availableStatsPoints,
    availableAttributesPoints: row.availableAttributesPoints,
    lifePercent: row.lifePercent,
    activeMission: row.activeMission,
    wounds: parseJsonValue(row.wounds),
    effects: parseJsonValue(row.effects),
    inventoryCapacity: row.inventoryCapacity,
    xp: row.xp,
  };
}

function mapTalentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
  };
}

function mapInventoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    weight: row.weight,
    type: row.itemType,
    class: row.itemClass,
    quantity: row.quantity,
  };
}

function getInventory(agentId) {
  return all('SELECT id, name, category, weight, itemType, itemClass, quantity FROM inventory WHERE agentId = ?', [agentId]).map(mapInventoryRow);
}

function getAgentEffects(agentId) {
  return all(
    `SELECT e.id, e.type, e.name, e.description, e.duration
     FROM effects e
     JOIN agent_effects ae ON ae.effectId = e.id
     WHERE ae.agentId = ?`,
    [agentId]
  );
}

function clearAgentEffects(agentId) {
  run('DELETE FROM agent_effects WHERE agentId = ?', [agentId]);
}

function assignEffectsToAgent(agentId, effectIds) {
  if (!Array.isArray(effectIds) || effectIds.length === 0) {
    return;
  }

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO agent_effects (agentId, effectId) VALUES (?, ?)'
  );

  for (const effectId of effectIds) {
    stmt.run([agentId, effectId]);
  }

  stmt.free();
  saveDatabase();
}

function getAgentById(id) {
  const row = get('SELECT * FROM agents WHERE id = ?', [id]);
  if (!row) return null;
  const agent = mapAgentRow(row);
  agent.inventory = getInventory(id);
  agent.assignedEffects = getAgentEffects(id);
  if (row.talentId) {
    agent.talent = getTalentById(row.talentId);
  }
  return agent;
}

function getTalentById(id) {
  const row = get('SELECT * FROM talents WHERE id = ?', [id]);
  return mapTalentRow(row);
}

function getAllTalents() {
  return all('SELECT * FROM talents').map(mapTalentRow);
}

function getAgentByName(name) {
  const row = get('SELECT * FROM agents WHERE lower(name) = lower(?)', [name]);
  if (!row) return null;
  const agent = mapAgentRow(row);
  agent.inventory = getInventory(row.id);
  agent.assignedEffects = getAgentEffects(row.id);
  if (row.talentId) {
    agent.talent = getTalentById(row.talentId);
  }
  return agent;
}

function loadEffectsFromJson() {
  const effectsJsonPath = path.join(__dirname, 'json', 'effects.json');
  if (!fs.existsSync(effectsJsonPath)) {
    return;
  }

  const rows = all('SELECT id FROM effects LIMIT 1');
  if (rows.length > 0) {
    return;
  }

  try {
    const payload = fs.readFileSync(effectsJsonPath, 'utf8');
    const effects = JSON.parse(payload);
    const insertStmt = db.prepare(
      'INSERT INTO effects (type, name, description, duration) VALUES (?, ?, ?, ?)'
    );
    for (const effect of Array.isArray(effects) ? effects : []) {
      insertStmt.run([
        effect.type || '',
        effect.name || '',
        effect.description || '',
        effect.duration || '',
      ]);
    }
    insertStmt.free();
    saveDatabase();
  } catch (error) {
    console.error('Impossible de charger effects.json:', error);
  }
}

function ensureFirstAgentHasDefaultEffect() {
  const agentRow = get('SELECT id FROM agents ORDER BY id LIMIT 1');
  if (!agentRow) {
    return;
  }
  const effectRow = get('SELECT id FROM effects WHERE name = ? LIMIT 1', ['Blessure handicapante']);
  if (!effectRow) {
    return;
  }
  const assigned = get('SELECT id FROM agent_effects WHERE agentId = ? AND effectId = ?', [agentRow.id, effectRow.id]);
  if (!assigned) {
    run('INSERT INTO agent_effects (agentId, effectId) VALUES (?, ?)', [agentRow.id, effectRow.id]);
  }
}

function loadTalentsFromJson() {
  const talentsJsonPath = path.join(__dirname, 'json', 'talents.json');
  if (!fs.existsSync(talentsJsonPath)) {
    return;
  }

  const rows = all('SELECT id FROM talents LIMIT 1');
  if (rows.length > 0) {
    return;
  }

  try {
    const payload = fs.readFileSync(talentsJsonPath, 'utf8');
    const talents = JSON.parse(payload);
    const insertStmt = db.prepare(
      'INSERT INTO talents (title, description) VALUES (?, ?)'
    );
    for (const talent of Array.isArray(talents) ? talents : []) {
      insertStmt.run([
        talent.title || '',
        talent.description || '',
      ]);
    }
    insertStmt.free();
    saveDatabase();
  } catch (error) {
    console.error('Impossible de charger talents.json:', error);
  }
}

function insertDefaultTalents() {
  const rows = all('SELECT id FROM talents LIMIT 1');
  if (rows.length > 0) {
    return;
  }

  const defaultTalents = [
    { title: 'Tireur d\'élite', description: 'Maîtrise exceptionnelle des armes à feu. Bonus de précision et de dégâts avec les armes.' },
    { title: 'Médecin de combat', description: 'Compétences médicales avancées. Peut soigner les blessures plus efficacement.' },
    { title: 'Ingénieur tactique', description: 'Expert en technologie et réparation d\'équipements. Bonus avec les objets techniques.' },
    { title: 'Infiltrateur', description: 'Spécialiste des opérations furtives. Bonus de discrétion et d\'évasion.' },
    { title: 'Chef d\'équipe', description: 'Leadership naturel. Bonus aux caractéristiques des alliés à proximité.' },
    { title: 'Survivant', description: 'Résistance accrue aux effets négatifs et capacité de récupération améliorée.' },
    { title: 'Expert en explosifs', description: 'Maîtrise des explosifs et des pièges. Bonus de dégâts avec les explosifs.' },
    { title: 'Éclaireur', description: 'Vision perçante et capacité à repérer les ennemis à distance.' },
    { title: 'Combattant rapproché', description: 'Spécialiste du combat au corps à corps. Bonus de dégâts en combat rapproché.' },
    { title: 'Stratège', description: 'Capacité à élaborer des plans tactiques efficaces. Bonus à l\'initiative.' },
  ];

  const insertStmt = db.prepare(
    'INSERT INTO talents (title, description) VALUES (?, ?)'
  );
  for (const talent of defaultTalents) {
    insertStmt.run([talent.title, talent.description]);
  }
  insertStmt.free();
  saveDatabase();
}

function getAllAgents() {
  return all('SELECT * FROM agents').map((row) => {
    const agent = mapAgentRow(row);
    agent.inventory = getInventory(row.id);
    agent.assignedEffects = getAgentEffects(row.id);
    return agent;
  });
}

function insertInventory(agentId, inventoryItems) {
  const insertStmt = db.prepare(
    'INSERT INTO inventory (agentId, name, category, weight, itemType, itemClass, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const item of inventoryItems || []) {
    insertStmt.run([
      agentId,
      item.name || '',
      item.category || '',
      item.weight || 0,
      item.type || null,
      item.class || null,
      item.quantity || 1,
    ]);
  }

  insertStmt.free();
  saveDatabase();
}

function createAgent(agent) {
  const hasId = typeof agent.id === 'number';
  const fields = [
    ...(hasId ? ['id'] : []),
    'name',
    'firstName',
    'age',
    'profession',
    'sex',
    'familyStatus',
    'children',
    'story',
    'talent',
    'talentId',
    'stats',
    'attributes',
    'password',
    'availableStatsPoints',
    'availableAttributesPoints',
    'lifePercent',
    'activeMission',
    'wounds',
    'effects',
    'inventoryCapacity',
    'xp',
  ];

  const placeholders = fields.map(() => '?').join(', ');
  const insertSql = `INSERT INTO agents (${fields.join(', ')}) VALUES (${placeholders})`;

  const params = [
    ...(hasId ? [agent.id] : []),
    agent.name,
    agent.firstName,
    agent.age,
    agent.profession,
    agent.sex,
    agent.familyStatus,
    agent.children,
    agent.story,
    serializeJsonValue(agent.talent),
    agent.talentId || null,
    serializeJsonValue(agent.stats),
    serializeJsonValue(agent.attributes),
    agent.password,
    agent.availableStatsPoints ?? 0,
    agent.availableAttributesPoints ?? 0,
    agent.lifePercent ?? 100,
    agent.activeMission || '',
    serializeJsonValue(agent.wounds),
    serializeJsonValue(agent.effects),
    agent.inventoryCapacity ?? 30,
    agent.xp ?? 0,
  ];

  const stmt = db.prepare(insertSql);
  stmt.run(params);
  stmt.free();
  saveDatabase();

  const agentId = lastInsertId();
  insertInventory(agentId, agent.inventory || []);
  if (Array.isArray(agent.assignedEffects)) {
    assignEffectsToAgent(agentId, agent.assignedEffects);
  }
  initializeAgentSkills(agentId);
  return getAgentById(agentId);
}

function updateAgent(agent) {
  const updateSql = `UPDATE agents SET
    name = ?,
    firstName = ?,
    age = ?,
    profession = ?,
    sex = ?,
    familyStatus = ?,
    children = ?,
    story = ?,
    talent = ?,
    talentId = ?,
    stats = ?,
    attributes = ?,
    password = ?,
    availableStatsPoints = ?,
    availableAttributesPoints = ?,
    lifePercent = ?,
    activeMission = ?,
    wounds = ?,
    effects = ?,
    inventoryCapacity = ?,
    xp = ?,
    updatedAt = CURRENT_TIMESTAMP
  WHERE id = ?`;

  run(updateSql, [
    agent.name,
    agent.firstName,
    agent.age,
    agent.profession,
    agent.sex,
    agent.familyStatus,
    agent.children,
    agent.story,
    serializeJsonValue(agent.talent),
    agent.talentId || null,
    serializeJsonValue(agent.stats),
    serializeJsonValue(agent.attributes),
    agent.password,
    agent.availableStatsPoints ?? 0,
    agent.availableAttributesPoints ?? 0,
    agent.lifePercent ?? 100,
    agent.activeMission || '',
    serializeJsonValue(agent.wounds),
    serializeJsonValue(agent.effects),
    agent.inventoryCapacity ?? 30,
    agent.xp ?? 0,
    agent.id,
  ]);

  run('DELETE FROM inventory WHERE agentId = ?', [agent.id]);
  insertInventory(agent.id, agent.inventory || []);
  if (Array.isArray(agent.assignedEffects)) {
    clearAgentEffects(agent.id);
    assignEffectsToAgent(agent.id, agent.assignedEffects);
  }
  return getAgentById(agent.id);
}

async function initializeDatabase() {
  if (db) return;
  SQL = await initSqlJs();
  ensureDataDir();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(new Uint8Array(buffer));
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      firstName TEXT NOT NULL,
      age INTEGER,
      profession TEXT,
      sex TEXT,
      familyStatus TEXT,
      children INTEGER,
      story TEXT,
      talent TEXT,
      talentId INTEGER,
      stats TEXT,
      attributes TEXT,
      password TEXT,
      availableStatsPoints INTEGER,
      availableAttributesPoints INTEGER,
      lifePercent INTEGER,
      activeMission TEXT,
      wounds TEXT,
      effects TEXT,
      inventoryCapacity INTEGER,
      xp INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(talentId) REFERENCES talents(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS talents (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY,
      agentId INTEGER NOT NULL,
      name TEXT,
      category TEXT,
      weight REAL,
      itemType TEXT,
      itemClass TEXT,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY(agentId) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS effects (
      id INTEGER PRIMARY KEY,
      type TEXT,
      name TEXT NOT NULL,
      description TEXT,
      duration TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_effects (
      id INTEGER PRIMARY KEY,
      agentId INTEGER NOT NULL,
      effectId INTEGER NOT NULL,
      FOREIGN KEY(agentId) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(effectId) REFERENCES effects(id) ON DELETE CASCADE,
      UNIQUE(agentId, effectId)
    );
  `);

  // ============ SKILLS DATABASE SCHEMA ============

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_attribute_groups (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_attributes (
      id INTEGER PRIMARY KEY,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY(group_id) REFERENCES skill_attribute_groups(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_groups (
      id INTEGER PRIMARY KEY,
      attribute_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY(attribute_id) REFERENCES skill_attributes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY(group_id) REFERENCES skill_groups(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_attribute_group_values (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(group_id) REFERENCES skill_attribute_groups(id),
      UNIQUE(agent_id, group_id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_attribute_values (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      attribute_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(attribute_id) REFERENCES skill_attributes(id),
      UNIQUE(agent_id, attribute_id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_skill_group_values (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(group_id) REFERENCES skill_groups(id),
      UNIQUE(agent_id, group_id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_skill_values (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(skill_id) REFERENCES skills(id),
      UNIQUE(agent_id, skill_id)
    );
  `);

  loadEffectsFromJson();
  loadTalentsFromJson();
  loadSkillsFromJson();
  insertDefaultTalents();
  ensureFirstAgentHasDefaultEffect();
  
  saveDatabase();
}

const ready = initializeDatabase();

async function ensureReady() {
  await ready;
}

async function getAllAgentsAsync() {
  await ensureReady();
  return getAllAgents();
}

function getAllEffects() {
  return all('SELECT id, type, name, description, duration FROM effects');
}

async function getAgentByIdAsync(id) {
  await ensureReady();
  return getAgentById(id);
}

async function getAgentByNameAsync(name) {
  await ensureReady();
  return getAgentByName(name);
}

async function getAllEffectsAsync() {
  await ensureReady();
  return getAllEffects();
}

async function getAllTalentsAsync() {
  await ensureReady();
  return getAllTalents();
}

async function createAgentAsync(agent) {
  await ensureReady();
  return createAgent(agent);
}

async function updateAgentAsync(agent) {
  await ensureReady();
  return updateAgent(agent);
}

function normalizeSkillName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e');
}

function loadSkillsFromJson() {
  const skillsJsonPath = path.join(__dirname, 'json', 'skills.json');
  if (!fs.existsSync(skillsJsonPath)) {
    return;
  }

  const rows = all('SELECT id FROM skill_attribute_groups LIMIT 1');
  if (rows.length > 0) {
    return;
  }

  try {
    const payload = fs.readFileSync(skillsJsonPath, 'utf8');
    const skillsData = JSON.parse(payload);
    
    for (const group of skillsData) {
      // Insert attribute group
      const groupStmt = db.prepare('INSERT INTO skill_attribute_groups (name, description) VALUES (?, ?)');
      groupStmt.run([group['attribute-group'], '']);
      const groupId = lastInsertId();
      groupStmt.free();
      
      for (const attribute of group.attributes) {
        // Insert attribute
        const attrStmt = db.prepare('INSERT INTO skill_attributes (group_id, name, description) VALUES (?, ?, ?)');
        attrStmt.run([groupId, attribute.name, attribute.description || '']);
        const attrId = lastInsertId();
        attrStmt.free();
        
        for (const skillGroup of attribute['skills-groupe'] || []) {
          // Insert skill group
          const groupStmt2 = db.prepare('INSERT INTO skill_groups (attribute_id, name, description) VALUES (?, ?, ?)');
          groupStmt2.run([attrId, skillGroup['groupe-name'], '']);
          const groupId2 = lastInsertId();
          groupStmt2.free();
          
          for (const skill of skillGroup.skills) {
            // Insert skill
            const skillStmt = db.prepare('INSERT INTO skills (group_id, name, description) VALUES (?, ?, ?)');
            skillStmt.run([groupId2, skill.name, skill.description || '']);
            skillStmt.free();
          }
        }
      }
    }
    saveDatabase();
  } catch (error) {
    console.error('Impossible de charger skills.json:', error);
  }
}

// ============ SKILL HELPER FUNCTIONS ============

function getSkillAttributeGroups() {
  return all('SELECT id, name, description FROM skill_attribute_groups ORDER BY id');
}

function getSkillAttributesByGroup(groupId) {
  return all('SELECT id, group_id, name, description FROM skill_attributes WHERE group_id = ? ORDER BY id', [groupId]);
}

function getSkillGroupsByAttribute(attributeId) {
  return all('SELECT id, attribute_id, name, description FROM skill_groups WHERE attribute_id = ? ORDER BY id', [attributeId]);
}

function getSkillsByGroup(groupId) {
  return all('SELECT id, group_id, name, description FROM skills WHERE group_id = ? ORDER BY id', [groupId]);
}

function getAgentAttributeGroupValue(agentId, groupId) {
  const row = get('SELECT value FROM agent_attribute_group_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  return row ? row.value : 0;
}

function setAgentAttributeGroupValue(agentId, groupId, value) {
  const existing = get('SELECT id FROM agent_attribute_group_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  if (existing) {
    run('UPDATE agent_attribute_group_values SET value = ? WHERE agent_id = ? AND group_id = ?', [value, agentId, groupId]);
  } else {
    run('INSERT INTO agent_attribute_group_values (agent_id, group_id, value) VALUES (?, ?, ?)', [agentId, groupId, value]);
  }
}

function getAgentAttributeValue(agentId, attributeId) {
  const row = get('SELECT value FROM agent_attribute_values WHERE agent_id = ? AND attribute_id = ?', [agentId, attributeId]);
  return row ? row.value : 0;
}

function setAgentAttributeValue(agentId, attributeId, value) {
  const existing = get('SELECT id FROM agent_attribute_values WHERE agent_id = ? AND attribute_id = ?', [agentId, attributeId]);
  if (existing) {
    run('UPDATE agent_attribute_values SET value = ? WHERE agent_id = ? AND attribute_id = ?', [value, agentId, attributeId]);
  } else {
    run('INSERT INTO agent_attribute_values (agent_id, attribute_id, value) VALUES (?, ?, ?)', [agentId, attributeId, value]);
  }
}

function getAgentSkillGroupValue(agentId, groupId) {
  const row = get('SELECT value FROM agent_skill_group_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  return row ? row.value : 0;
}

function setAgentSkillGroupValue(agentId, groupId, value) {
  const existing = get('SELECT id FROM agent_skill_group_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  if (existing) {
    run('UPDATE agent_skill_group_values SET value = ? WHERE agent_id = ? AND group_id = ?', [value, agentId, groupId]);
  } else {
    run('INSERT INTO agent_skill_group_values (agent_id, group_id, value) VALUES (?, ?, ?)', [agentId, groupId, value]);
  }
}

function getAgentSkillValue(agentId, skillId) {
  const row = get('SELECT value FROM agent_skill_values WHERE agent_id = ? AND skill_id = ?', [agentId, skillId]);
  return row ? row.value : 0;
}

function setAgentSkillValue(agentId, skillId, value) {
  const existing = get('SELECT id FROM agent_skill_values WHERE agent_id = ? AND skill_id = ?', [agentId, skillId]);
  if (existing) {
    run('UPDATE agent_skill_values SET value = ? WHERE agent_id = ? AND skill_id = ?', [value, agentId, skillId]);
  } else {
    run('INSERT INTO agent_skill_values (agent_id, skill_id, value) VALUES (?, ?, ?)', [agentId, skillId, value]);
  }
}

// Get children of an attribute group (attributes)
function getAttributeGroupChildren(groupId) {
  return all('SELECT id FROM skill_attributes WHERE group_id = ?', [groupId]);
}

// Get children of an attribute (skill groups)
function getAttributeChildren(attributeId) {
  return all('SELECT id FROM skill_groups WHERE attribute_id = ?', [attributeId]);
}

// Get children of a skill group (skills)
function getSkillGroupChildren(groupId) {
  return all('SELECT id FROM skills WHERE group_id = ?', [groupId]);
}

// Get sum of children values for validation
function getChildrenValueSum(agentId, childrenTable, childrenIds) {
  if (childrenIds.length === 0) return 0;
  
  const placeholders = childrenIds.map(() => '?').join(',');
  const query = `SELECT COALESCE(SUM(value), 0) as total FROM ${childrenTable} WHERE agent_id = ? AND group_id IN (${placeholders})`;
  const params = [agentId, ...childrenIds.map(id => id.id || id)];
  const row = get(query, params);
  return row ? row.total : 0;
}

// Get sum of attribute values for an attribute group
function getAttributeGroupValueSum(agentId, groupId) {
  const attributeIds = getAttributeGroupChildren(groupId);
  if (attributeIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_attribute_values', attributeIds);
}

// Get sum of skill group values for an attribute
function getAttributeValueSum(agentId, attributeId) {
  const groupIds = getAttributeChildren(attributeId);
  if (groupIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_skill_group_values', groupIds);
}

// Get sum of skill values for a skill group
function getSkillGroupValueSum(agentId, groupId) {
  const skillIds = getSkillGroupChildren(groupId);
  if (skillIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_skill_values', skillIds);
}

// Validate hierarchy: children sum must be <= parent value
function validateHierarchy(agentId, entityType, entityId, newValue) {
  let childrenTable = '';
  let childrenQuery = '';
  
  switch (entityType) {
    case 'attribute_group':
      childrenTable = 'agent_attribute_values';
      childrenQuery = 'SELECT id FROM skill_attributes WHERE group_id = ?';
      break;
    case 'attribute':
      childrenTable = 'agent_skill_group_values';
      childrenQuery = 'SELECT id FROM skill_groups WHERE attribute_id = ?';
      break;
    case 'skill_group':
      childrenTable = 'agent_skill_values';
      childrenQuery = 'SELECT id FROM skills WHERE group_id = ?';
      break;
    default:
      return true; // Skills have no children
  }
  
  const children = all(childrenQuery, [entityId]);
  if (children.length === 0) return true;
  
  const childrenSum = getChildrenValueSum(agentId, childrenTable, children);
  return childrenSum <= newValue;
}

// Initialize default skill values for a new agent
function initializeAgentSkills(agentId) {
  const groups = all('SELECT id FROM skill_attribute_groups');
  
  for (const group of groups) {
    // Set attribute group value to 0 by default
    setAgentAttributeGroupValue(agentId, group.id, 0);
    
    const attributes = getAttributeGroupChildren(group.id);
    for (const attr of attributes) {
      setAgentAttributeValue(agentId, attr.id, 0);
      
      const skillGroups = getAttributeChildren(attr.id);
      for (const sg of skillGroups) {
        setAgentSkillGroupValue(agentId, sg.id, 0);
        
        const skills = getSkillGroupChildren(sg.id);
        for (const skill of skills) {
          setAgentSkillValue(agentId, skill.id, 0);
        }
      }
    }
  }
}

// Get full skills hierarchy for an agent
function getAgentSkillsHierarchy(agentId) {
  const groups = all('SELECT id, name, description FROM skill_attribute_groups ORDER BY id');
  
  return groups.map(group => {
    const attributes = all('SELECT id, name, description FROM skill_attributes WHERE group_id = ? ORDER BY id', [group.id]);
    
    return {
      ...group,
      value: getAgentAttributeGroupValue(agentId, group.id),
      attributes: attributes.map(attr => {
        const skillGroups = all('SELECT id, name, description FROM skill_groups WHERE attribute_id = ? ORDER BY id', [attr.id]);
        
        return {
          ...attr,
          value: getAgentAttributeValue(agentId, attr.id),
          skillGroups: skillGroups.map(sg => {
            const skills = all('SELECT id, name, description FROM skills WHERE group_id = ? ORDER BY id', [sg.id]);
            
            return {
              ...sg,
              value: getAgentSkillGroupValue(agentId, sg.id),
              skills: skills.map(skill => ({
                ...skill,
                value: getAgentSkillValue(agentId, skill.id)
              }))
            };
          })
        };
      })
    };
  });
}

// Async versions
async function getAgentSkillsHierarchyAsync(agentId) {
  await ensureReady();
  return getAgentSkillsHierarchy(agentId);
}

async function setAgentAttributeGroupValueAsync(agentId, groupId, value) {
  await ensureReady();
  setAgentAttributeGroupValue(agentId, groupId, value);
}

async function setAgentAttributeValueAsync(agentId, attributeId, value) {
  await ensureReady();
  setAgentAttributeValue(agentId, attributeId, value);
}

async function setAgentSkillGroupValueAsync(agentId, groupId, value) {
  await ensureReady();
  setAgentSkillGroupValue(agentId, groupId, value);
}

async function setAgentSkillValueAsync(agentId, skillId, value) {
  await ensureReady();
  setAgentSkillValue(agentId, skillId, value);
}

async function validateHierarchyAsync(agentId, entityType, entityId, newValue) {
  await ensureReady();
  return validateHierarchy(agentId, entityType, entityId, newValue);
}


module.exports = {
  getAllAgents: getAllAgentsAsync,
  getAgentById: getAgentByIdAsync,
  getAgentByName: getAgentByNameAsync,
  getAllEffects: getAllEffectsAsync,
  getAllTalents: getAllTalentsAsync,
  createAgent: createAgentAsync,
  updateAgent: updateAgentAsync,
  getAgentSkillsHierarchy: getAgentSkillsHierarchyAsync,
  setAgentAttributeGroupValue: setAgentAttributeGroupValueAsync,
  setAgentAttributeValue: setAgentAttributeValueAsync,
  setAgentSkillGroupValue: setAgentSkillGroupValueAsync,
  setAgentSkillValue: setAgentSkillValueAsync,
  validateHierarchy: validateHierarchyAsync,
  initializeAgentSkills,
  getSkillAttributeGroups,
  getSkillAttributesByGroup,
  getSkillGroupsByAttribute,
  getSkillsByGroup,
  getAgentAttributeGroupValue,
  getAgentAttributeValue,
  getAgentSkillGroupValue,
  getAgentSkillValue,
  getAttributeGroupValueSum,
  getAttributeValueSum,
  getSkillGroupValueSum,
};
