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
    agent.inventoryCapacity ?? 100,
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
    agent.inventoryCapacity ?? 100,
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

  loadEffectsFromJson();
  loadTalentsFromJson();
  insertDefaultTalents();
  ensureFirstAgentHasDefaultEffect();
  
  run('DELETE FROM agents');
  
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

module.exports = {
  getAllAgents: getAllAgentsAsync,
  getAgentById: getAgentByIdAsync,
  getAgentByName: getAgentByNameAsync,
  getAllEffects: getAllEffectsAsync,
  getAllTalents: getAllTalentsAsync,
  createAgent: createAgentAsync,
  updateAgent: updateAgentAsync,
};
