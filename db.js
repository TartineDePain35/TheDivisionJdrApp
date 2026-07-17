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
  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la base de données:', error);
    // Ne pas propager l'erreur pour éviter de bloquer l'exécution
  }
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
  try {
    return JSON.stringify(value || []);
  } catch (e) {
    // Si la valeur ne peut pas être sérialisée, retourner une chaîne vide ou null
    console.warn('Impossible de sérialiser la valeur:', value);
    return JSON.stringify(null);
  }
}

function run(sql, params = []) {
  try {
    // ✅ S'assurer que tous les paramètres sont des types primitifs ou null
    const safeParams = params.map(param => {
      if (param === null || param === undefined) return null;
      if (typeof param === 'string' || typeof param === 'number' || typeof param === 'boolean') return param;
      try {
        // Essayer de sérialiser les objets
        return JSON.stringify(param);
      } catch (e) {
        console.error('Paramètre non-sérialisable:', param);
        return null;
      }
    });
    
    const stmt = db.prepare(sql);
    stmt.bind(safeParams);
    const result = stmt.run();
    stmt.free();
    saveDatabase();
    return result;
  } catch (error) {
    console.error('Erreur dans run():', error);
    console.error('Requête SQL:', sql);
    console.error('Paramètres:', params);
    throw error;
  }
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
    // ✅ NOUVEAU : Ne plus utiliser row.talent ou row.talentId, charger depuis agent_talents_value
    password: row.password,
    availableStatsPoints: row.availableStatsPoints,
    availableAttributesPoints: row.availableAttributesPoints,
    availableTalentPoints: row.availableTalentPoints,
    lifePercent: row.lifePercent,
    activeMission: row.activeMission,
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
     JOIN agent_effects_value ae ON ae.effectId = e.id
     WHERE ae.agentId = ?`,
    [agentId]
  );
}

function clearAgentEffects(agentId) {
  run('DELETE FROM agent_effects_value WHERE agentId = ?', [agentId]);
}

function assignEffectsToAgent(agentId, effectItems) {
  if (!Array.isArray(effectItems) || effectItems.length === 0) {
    return;
  }

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO agent_effects_value (agentId, effectId) VALUES (?, ?)'
  );

  for (const item of effectItems) {
    // Support both: plain IDs (numbers/strings) or effect objects with id property
    const effectId = typeof item === 'object' && item !== null && item.id !== undefined 
      ? Number(item.id) 
      : Number(item);
    
    if (!isNaN(effectId)) {
      stmt.bind([agentId, effectId]);
      stmt.run();
    }
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
  // ✅ NOUVEAU : Charger les attributs depuis agent_skill_attribute_groups_values
  agent.attributes = getAgentAttributes(id);
  // ✅ NOUVEAU : Charger les stats depuis agent_stats_group_value
  agent.stats = getAgentStats(id);
  // ✅ NOUVEAU : Charger les talents depuis agent_talents_value
  agent.talents = getAgentTalents(id);
  return agent;
}

function getTalentById(id) {
  const row = get('SELECT * FROM talents WHERE id = ?', [id]);
  return mapTalentRow(row);
}

function getAllTalents() {
  const result = all('SELECT * FROM talents').map(mapTalentRow);
  console.log('getAllTalents() retourne:', result.length, 'talents');
  return result;
}

// ✅ NOUVEAU : Fonctions pour gérer les talents d'un agent via agent_talents_value
function getAgentTalents(agentId) {
  return all('SELECT t.id, t.title, t.description FROM talents t JOIN agent_talents_value tv ON tv.talent_id = t.id WHERE tv.agent_id = ?', [agentId]);
}

function hasAgentTalent(agentId, talentId) {
  const row = get('SELECT id FROM agent_talents_value WHERE agent_id = ? AND talent_id = ?', [agentId, talentId]);
  return row !== null;
}

function addAgentTalent(agentId, talentId) {
  const existing = get('SELECT id FROM agent_talents_value WHERE agent_id = ? AND talent_id = ?', [agentId, talentId]);
  if (!existing) {
    run('INSERT INTO agent_talents_value (agent_id, talent_id) VALUES (?, ?)', [agentId, talentId]);
  }
}

function removeAgentTalent(agentId, talentId) {
  run('DELETE FROM agent_talents_value WHERE agent_id = ? AND talent_id = ?', [agentId, talentId]);
}

function setAgentTalents(agentId, talentIds) {
  // Supprimer tous les talents existants pour cet agent
  run('DELETE FROM agent_talents_value WHERE agent_id = ?', [agentId]);
  
  // Ajouter les nouveaux talents
  if (Array.isArray(talentIds)) {
    const insertStmt = db.prepare('INSERT INTO agent_talents_value (agent_id, talent_id) VALUES (?, ?)');
    for (const talentId of talentIds) {
      // Ignorer les valeurs null, undefined - accepter les strings et numbers
      if (talentId == null) continue;
      insertStmt.bind([agentId, String(talentId)]);
      insertStmt.run();
    }
    insertStmt.free();
  }
}

function getAgentByName(name) {
  const row = get('SELECT * FROM agents WHERE lower(name) = lower(?)', [name]);
  if (!row) return null;
  const agent = mapAgentRow(row);
  agent.inventory = getInventory(row.id);
  agent.assignedEffects = getAgentEffects(row.id);
  // ✅ NOUVEAU : Charger les attributs depuis agent_skill_attribute_groups_values
  agent.attributes = getAgentAttributes(row.id);
  // ✅ NOUVEAU : Charger les stats depuis agent_stats_group_value
  agent.stats = getAgentStats(row.id);
  // ✅ NOUVEAU : Charger les talents depuis agent_talents_value
  agent.talents = getAgentTalents(row.id);
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
      insertStmt.bind([
        effect.type || '',
        effect.name || '',
        effect.description || '',
        effect.duration || '',
      ]);
      insertStmt.run();
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
  const assigned = get('SELECT id FROM agent_effects_value WHERE agentId = ? AND effectId = ?', [agentRow.id, effectRow.id]);
  if (!assigned) {
    run('INSERT INTO agent_effects_value (agentId, effectId) VALUES (?, ?)', [agentRow.id, effectRow.id]);
  }
}

function loadTalentsFromJson() {
  const talentsJsonPath = path.join(__dirname, 'json', 'talents.json');
  console.log('Chemin vers talents.json:', talentsJsonPath);
  console.log('Fichier existe:', fs.existsSync(talentsJsonPath));
  
  if (!fs.existsSync(talentsJsonPath)) {
    console.log('Fichier talents.json non trouvé, insertion des talents par défaut');
    return;
  }

  try {
    const payload = fs.readFileSync(talentsJsonPath, 'utf8');
    const talents = JSON.parse(payload);
    console.log('Talents lus depuis JSON:', talents.length, 'talents');
    
    // Vider la table avant de charger les nouveaux talents
    run('DELETE FROM talents');
    
    // Insérer les talents avec des IDs séquentiels (1, 2, 3, ...)
    const insertStmt = db.prepare(
      'INSERT INTO talents (id, title, description) VALUES (?, ?, ?)'
    );
    for (let i = 0; i < talents.length; i++) {
      const talent = talents[i];
      insertStmt.bind([
        i + 1,  // ID séquentiel commençant à 1
        talent.title || '',
        talent.description || '',
      ]);
      insertStmt.run();
    }
    insertStmt.free();
    saveDatabase();
    console.log('Talents chargés depuis talents.json avec succès');
    
    // Vérification
    const allTalents = all('SELECT * FROM talents');
    console.log('Talents dans la base de données après chargement:', allTalents.length);
  } catch (error) {
    console.error('Impossible de charger talents.json:', error);
  }
}

function insertDefaultTalents() {
  const rows = all('SELECT id FROM talents LIMIT 1');
  if (rows.length > 0) {
    // Si des talents existent déjà (chargés depuis JSON), on ne fait rien
    return;
  }

  // Talents par défaut basés sur le fichier JSON
  const defaultTalents = [
    { id: 1, title: 'Ombre', description: 'Se déplace silencieusement et frappe sans avertissement, idéal pour les missions discrètes.' },
    { id: 2, title: 'Gardien', description: 'Protège ses alliés, encaisse les dégâts et garde une position stratégique.' },
    { id: 3, title: 'Hacker', description: 'Maîtrise les dispositifs technologiques et manipule l\'environnement à distance.' },
    { id: 4, title: 'Survivant', description: 'Adapté aux situations extrêmes grâce à une grande résilience et une forte récupération.' },
  ];

  const insertStmt = db.prepare(
    'INSERT INTO talents (id, title, description) VALUES (?, ?, ?)'
  );
  for (const talent of defaultTalents) {
    insertStmt.bind([talent.id, talent.title, talent.description]);
    insertStmt.run();
  }
  insertStmt.free();
  saveDatabase();
  console.log('Talents par défaut insérés');
}

function getAllAgents() {
  return all('SELECT * FROM agents').map((row) => {
    const agent = mapAgentRow(row);
    agent.inventory = getInventory(row.id);
    agent.assignedEffects = getAgentEffects(row.id);
    // ✅ Charger les attributs, stats et talents
    agent.attributes = getAgentAttributes(row.id);
    agent.stats = getAgentStats(row.id);
    agent.talents = getAgentTalents(row.id);
    return agent;
  });
}

function insertInventory(agentId, inventoryItems) {
  const insertStmt = db.prepare(
    'INSERT INTO inventory (agentId, name, category, weight, itemType, itemClass, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const item of inventoryItems || []) {
    insertStmt.bind([
      agentId,
      item.name || '',
      item.category || '',
      Number(item.weight) || 0,
      item.type || null,
      item.class || null,
      Number(item.quantity) || 1,
    ]);
    insertStmt.run();
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
    // ✅ NOUVEAU : Suppression des champs talent et talentId
    'password',
    'availableStatsPoints',
    'availableAttributesPoints',
    'availableTalentPoints',
    'lifePercent',
    'activeMission',
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
    // ✅ NOUVEAU : Suppression de talentId
    agent.password,
    agent.availableStatsPoints ?? 0,
    agent.availableAttributesPoints ?? 0,
    agent.availableTalentPoints ?? 0,
    agent.lifePercent ?? 100,
    agent.activeMission || '',
    agent.inventoryCapacity ?? 30,
    agent.xp ?? 0,
  ];

  const stmt = db.prepare(insertSql);
  stmt.bind(params);
  stmt.run();
  stmt.free();
  
  const agentId = lastInsertId();
  
  // Vérification critique : agentId doit être un nombre valide
  if (typeof agentId !== 'number' || isNaN(agentId)) {
    console.error('Erreur: agentId est invalide après insertion:', agentId);
    throw new Error('Impossible de récupérer l\'ID de l\'agent créé');
  }
  
  saveDatabase();
  insertInventory(agentId, agent.inventory || []);
  if (Array.isArray(agent.assignedEffects)) {
    assignEffectsToAgent(agentId, agent.assignedEffects);
  }
  initializeAgentSkills(agentId);
  
  // ✅ NOUVEAU : Sauvegarder les attributs dans agent_skill_attribute_groups_values
  // Approche alignée sur les stats : traitement individuel de chaque groupe d'attributs
  if (agent.attributes) {
    const groups = all('SELECT id, name FROM skill_attribute_groups');
    for (const group of groups) {
      const normalizedName = group.name.toLowerCase()
        .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e')
        .replace(/[^a-z0-9]/g, '');
      const value = agent.attributes[normalizedName];
      if (value !== undefined) {
        setAgentAttributeGroupValue(agentId, group.id, value);
      }
    }
  }

  // ✅ NOUVEAU : Sauvegarder les stats dans agent_stats_group_value
  if (agent.stats) {
    const statsGroups = all('SELECT id, name FROM stats_group');
    for (const group of statsGroups) {
      const normalizedName = group.name.toLowerCase()
        .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e')
        .replace(/[^a-z0-9]/g, '');
      const value = agent.stats[normalizedName];
      if (value !== undefined) {
        setAgentStatsGroupValue(agentId, group.id, value);
      }
    }
  }

  // Approche alignée sur agent_stats_group_value : traitement individuel de chaque talent
  if (agent.talents && Array.isArray(agent.talents)) {
    for (const talent of agent.talents) {
      if (talent && talent.id !== undefined && talent.id !== null) {
        const talentId = String(talent.id);
        const dbTalent = get('SELECT id FROM talents WHERE id = ?', [talentId]);
        if (dbTalent) {
          addAgentTalent(agentId, dbTalent.id);
        }
      }
    }
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
    password = ?,
    availableStatsPoints = ?,
    availableAttributesPoints = ?,
    availableTalentPoints = ?,
    lifePercent = ?,
    activeMission = ?,
    inventoryCapacity = ?,
    xp = ?,
    updatedAt = CURRENT_TIMESTAMP
  WHERE id = ?`;

  run(updateSql, [
    agent.name,
    agent.firstName,
    Number(agent.age) || null,
    agent.profession,
    agent.sex,
    agent.familyStatus,
    Number(agent.children) || null,
    agent.story,
    // ✅ NOUVEAU : Suppression de talentId
    agent.password,
    Number(agent.availableStatsPoints) || 0,
    Number(agent.availableAttributesPoints) || 0,
    Number(agent.availableTalentPoints) || 0,
    Number(agent.lifePercent) || 100,
    agent.activeMission || '',
    Number(agent.inventoryCapacity) || 30,
    Number(agent.xp) || 0,
    agent.id,
  ]);
  
  // ✅ NOUVEAU : Mettre à jour les attributs dans agent_skill_attribute_groups_values
  // Approche alignée sur les stats : traitement individuel de chaque groupe d'attributs
  if (agent.id && agent.attributes) {
    const groups = all('SELECT id, name FROM skill_attribute_groups');
    for (const group of groups) {
      const normalizedName = group.name.toLowerCase()
        .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e')
        .replace(/[^a-z0-9]/g, '');
      const value = agent.attributes[normalizedName];
      if (value !== undefined) {
        setAgentAttributeGroupValue(agent.id, group.id, value);
      }
    }
  }

  // ✅ NOUVEAU : Mettre à jour les stats dans agent_stats_group_value
  if (agent.id && agent.stats) {
    const statsGroups = all('SELECT id, name FROM stats_group');
    for (const group of statsGroups) {
      const normalizedName = group.name.toLowerCase()
        .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e')
        .replace(/[^a-z0-9]/g, '');
      const value = agent.stats[normalizedName];
      if (value !== undefined) {
        setAgentStatsGroupValue(agent.id, group.id, value);
      }
    }
  }

  // ✅ NOUVEAU : Mettre à jour les talents dans agent_talents_value
  // Approche alignée sur agent_stats_group_value : traitement individuel de chaque talent
  if (agent.id && agent.talents && Array.isArray(agent.talents)) {
    // D'abord supprimer tous les talents existants pour cet agent
    run('DELETE FROM agent_talents_value WHERE agent_id = ?', [agent.id]);
    
    // Puis ajouter chaque talent valide
    for (const talent of agent.talents) {
      if (talent && talent.id !== undefined && talent.id !== null) {
        const talentId = String(talent.id);
        const dbTalent = get('SELECT id FROM talents WHERE id = ?', [talentId]);
        if (dbTalent) {
          addAgentTalent(agent.id, dbTalent.id);
        }
      }
    }
  }

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
      password TEXT,
      availableStatsPoints INTEGER,
      availableAttributesPoints INTEGER,
      availableTalentPoints INTEGER DEFAULT 0,
      lifePercent INTEGER,
      activeMission TEXT,
      inventoryCapacity INTEGER,
      xp INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Supprimer le champ attributes s'il existe
  try {
    const columns = db.exec('PRAGMA table_info(agents)');
    const hasAttributesColumn = columns[0].values.some(col => col[1] === 'attributes');
    if (hasAttributesColumn) {
      db.run('ALTER TABLE agents DROP COLUMN attributes');
    }
  } catch (e) {
    console.warn('Impossible de vérifier/supprimer la colonne attributes:', e.message);
  }

  // Migration: Supprimer le champ stats s'il existe
  try {
    const columns = db.exec('PRAGMA table_info(agents)');
    const hasStatsColumn = columns[0].values.some(col => col[1] === 'stats');
    if (hasStatsColumn) {
      db.run('ALTER TABLE agents DROP COLUMN stats');
    }
  } catch (e) {
    console.warn('Impossible de vérifier/supprimer la colonne stats:', e.message);
  }

  // Migration: Supprimer le champ talent s'il existe
  try {
    const columns = db.exec('PRAGMA table_info(agents)');
    const hasTalentColumn = columns[0].values.some(col => col[1] === 'talent');
    if (hasTalentColumn) {
      db.run('ALTER TABLE agents DROP COLUMN talent');
    }
  } catch (e) {
    console.warn('Impossible de vérifier/supprimer la colonne talent:', e.message);
  }

  // Migration: Supprimer le champ talentId s'il existe
  try {
    const columns = db.exec('PRAGMA table_info(agents)');
    const hasTalentIdColumn = columns[0].values.some(col => col[1] === 'talentId');
    if (hasTalentIdColumn) {
      db.run('ALTER TABLE agents DROP COLUMN talentId');
    }
  } catch (e) {
    console.warn('Impossible de vérifier/supprimer la colonne talentId:', e.message);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS talents (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  // Migration: Corriger la structure de la table talents pour utiliser des IDs INTEGER
  try {
    const columns = db.exec('PRAGMA table_info(talents)');
    if (columns && columns.length > 0 && columns[0].values && columns[0].values.length > 0) {
      const idColumn = columns[0].values.find(col => col[1] === 'id');
      // Vérifier si la colonne id est de type TEXT
      if (idColumn && idColumn[2] === 'TEXT') {
        // Sauvegarder les données existantes
        const existingTalents = all('SELECT title, description FROM talents');
        db.run('DROP TABLE talents');
        db.run(`
          CREATE TABLE IF NOT EXISTS talents (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL
          );
        `);
        // Réinsérer les données avec des IDs numériques séquentiels
        if (existingTalents.length > 0) {
          const insertStmt = db.prepare('INSERT INTO talents (id, title, description) VALUES (?, ?, ?)');
          for (let i = 0; i < existingTalents.length; i++) {
            const talent = existingTalents[i];
            insertStmt.bind([i + 1, talent.title, talent.description]);
            insertStmt.run();
          }
          insertStmt.free();
        }
        saveDatabase();
        console.log('Migration de la table talents vers INTEGER terminée');
      }
    }
  } catch (e) {
    console.warn('Impossible de migrer la table talents:', e.message);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_talents_value (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      talent_id INTEGER NOT NULL,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(talent_id) REFERENCES talents(id) ON DELETE CASCADE,
      UNIQUE(agent_id, talent_id)
    );
  `);

  // Migration: Corriger le type de talent_id dans agent_talents_value pour correspondre à talents.id (INTEGER)
  try {
    const atvColumns = db.exec('PRAGMA table_info(agent_talents_value)');
    if (atvColumns && atvColumns.length > 0 && atvColumns[0].values && atvColumns[0].values.length > 0) {
      const talentIdColumn = atvColumns[0].values.find(col => col[1] === 'talent_id');
      if (talentIdColumn && talentIdColumn[2] !== 'INTEGER') {
        // Sauvegarder les données existantes
        const existingAgentTalents = all('SELECT agent_id, talent_id FROM agent_talents_value');
        db.run('DROP TABLE agent_talents_value');
        db.run(`
          CREATE TABLE IF NOT EXISTS agent_talents_value (
            id INTEGER PRIMARY KEY,
            agent_id INTEGER NOT NULL,
            talent_id INTEGER NOT NULL,
            FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
            FOREIGN KEY(talent_id) REFERENCES talents(id) ON DELETE CASCADE,
            UNIQUE(agent_id, talent_id)
          );
        `);
        // Réinsérer les données avec conversion en INTEGER
        if (existingAgentTalents.length > 0) {
          const insertStmt = db.prepare('INSERT INTO agent_talents_value (agent_id, talent_id) VALUES (?, ?)');
          for (const at of existingAgentTalents) {
            // Convertir talent_id en INTEGER
            // Si c'est déjà un nombre, le garder. Sinon essayer de le mapper depuis talents
            let talentId = parseInt(at.talent_id);
            if (isNaN(talentId)) {
              // C'est un TEXT (ex: "phantom"), essayer de trouver l'ID numérique correspondant
              const talentRow = get('SELECT id FROM talents WHERE title = (SELECT title FROM talents WHERE id = ? COLLATE NOCASE)', [at.talent_id]);
              talentId = talentRow ? talentRow.id : 0;
            }
            insertStmt.bind([at.agent_id, talentId]);
            insertStmt.run();
          }
          insertStmt.free();
        }
        saveDatabase();
        console.log('Migration de agent_talents_value.talent_id vers INTEGER terminée');
      }
    }
  } catch (e) {
    console.warn('Impossible de migrer la colonne talent_id:', e.message);
  }
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
    CREATE TABLE IF NOT EXISTS agent_effects_value (
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
    CREATE TABLE IF NOT EXISTS agent_skill_attribute_groups_values (
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
    CREATE TABLE IF NOT EXISTS agent_skill_attributes_values (
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
    CREATE TABLE IF NOT EXISTS agent_skill_groups_values (
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
    CREATE TABLE IF NOT EXISTS agent_skills_values (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(skill_id) REFERENCES skills(id),
      UNIQUE(agent_id, skill_id)
    );
  `);

  // Table pour les messages envoyés aux agents
  db.run(`
    CREATE TABLE IF NOT EXISTS agent_messages (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      value TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  // ============ STATS DATABASE SCHEMA ============

  db.run(`
    CREATE TABLE IF NOT EXISTS stats_group (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_stats_group_value (
      id INTEGER PRIMARY KEY,
      agent_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      value INTEGER DEFAULT 0,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY(group_id) REFERENCES stats_group(id),
      UNIQUE(agent_id, group_id)
    );
  `);

  // Insérer les entrées par défaut pour stats_group
  try {
    const rows = all('SELECT id FROM stats_group LIMIT 1');
    if (rows.length === 0) {
      const insertStmt = db.prepare('INSERT INTO stats_group (id, name) VALUES (?, ?)');
      insertStmt.bind([1, 'Speed']);
      insertStmt.run();
      insertStmt.bind([2, 'Resilience']);
      insertStmt.run();
      insertStmt.bind([3, 'Vigor']);
      insertStmt.run();
      insertStmt.free();
      saveDatabase();
    }
  } catch (error) {
    console.error('Impossible d\'insérer les stats_group par défaut:', error);
  }

  loadEffectsFromJson();
  loadTalentsFromJson();
  loadSkillsFromJson();

  // Migration: Uniformiser les noms des groupes d'attributs pour correspondre aux clés du frontend
  // "Déxterité" ou "Dextérité" → "Dexterity" pour que la normalisation donne "dexterity"
  try {
    // Trouver le groupe avec n'importe quelle variante de "dexterité" (avec ou sans accents)
    const dexteriteGroups = all(`SELECT id, name FROM skill_attribute_groups WHERE LOWER(name) LIKE '%dexterit%' OR LOWER(name) LIKE '%déxterit%'`);
    for (const group of dexteriteGroups) {
      run('UPDATE skill_attribute_groups SET name = ? WHERE id = ?', ['Dexterity', group.id]);
    }
    saveDatabase();
  } catch (e) {
    console.warn('Impossible de migrer les noms des groupes d\'attributs:', e.message);
  }

  insertDefaultTalents();
  ensureFirstAgentHasDefaultEffect();
  
  saveDatabase();
}

// Fonction de migration pour renommer la table agent_attributes_values en agent_skill_attributes_values
async function migrateAgentAttributesValuesTable() {
  try {
    await ready; // Attendre que la base soit initialisée
    console.log('Début de la migration de la table agent_attributes_values');
    
    // Vérifier si l'ancienne table existe
    const oldTable = all("SELECT name FROM sqlite_master WHERE type='table' AND name='agent_attributes_values'");
    if (oldTable.length > 0) {
      console.log('Ancienne table agent_attributes_values trouvée, renommage en agent_skill_attributes_values');
      
      // Renommer la table
      run('ALTER TABLE agent_attributes_values RENAME TO agent_skill_attributes_values');
      
      saveDatabase();
      console.log('Migration de la table terminée avec succès');
    } else {
      console.log('Ancienne table agent_attributes_values non trouvée, migration non nécessaire');
    }
  } catch (e) {
    console.warn('Impossible de migrer la table agent_attributes_values:', e.message);
  }
}

// Fonction de migration indépendante pour corriger les noms des groupes d'attributs
// Doit être appelée explicitement après que la base soit prête
async function migrateAttributeGroupNames() {
  try {
    await ready; // Attendre que la base soit initialisée
    console.log('Début de la migration des groupes d\'attributs');
    // Chercher toutes les variantes possibles de "Dexterity" (avec ou sans accents, différentes orthographes)
    const dexteriteGroups = all(`
      SELECT id, name FROM skill_attribute_groups 
      WHERE LOWER(name) IN ('dexterity', 'dexterite', 'dexterité', 'déxterité')
    `);
    console.log('Migration des groupes d\'attributs - groupes trouvés:', dexteriteGroups);
    if (dexteriteGroups.length === 0) {
      console.log('Aucun groupe à migrer trouvé. Vérification de tous les groupes:');
      const allGroups = all('SELECT id, name FROM skill_attribute_groups');
      console.log('Tous les groupes:', allGroups);
    }
    for (const group of dexteriteGroups) {
      console.log(`Migration: renommage du groupe "${group.name}" (ID: ${group.id}) en "Dexterity"`);
      run('UPDATE skill_attribute_groups SET name = ? WHERE id = ?', ['Dexterity', group.id]);
    }
    saveDatabase();
    console.log('Migration des groupes d\'attributs terminée');
  } catch (e) {
    console.warn('Impossible de migrer les noms des groupes d\'attributs:', e.message);
  }
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
      groupStmt.bind([group['attribute-group'], '']);
      groupStmt.run();
      const groupId = lastInsertId();
      groupStmt.free();
      
      for (const attribute of group.attributes) {
        // Insert attribute
        const attrStmt = db.prepare('INSERT INTO skill_attributes (group_id, name, description) VALUES (?, ?, ?)');
        attrStmt.bind([groupId, attribute.name, attribute.description || '']);
        attrStmt.run();
        const attrId = lastInsertId();
        attrStmt.free();
        
        for (const skillGroup of attribute['skills-groupe'] || []) {
          // Insert skill group
          const groupStmt2 = db.prepare('INSERT INTO skill_groups (attribute_id, name, description) VALUES (?, ?, ?)');
          groupStmt2.bind([attrId, skillGroup['groupe-name'], '']);
          groupStmt2.run();
          const groupId2 = lastInsertId();
          groupStmt2.free();
          
          for (const skill of skillGroup.skills) {
            // Insert skill
            const skillStmt = db.prepare('INSERT INTO skills (group_id, name, description) VALUES (?, ?, ?)');
            skillStmt.bind([groupId2, skill.name, skill.description || '']);
            skillStmt.run();
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
  const row = get('SELECT value FROM agent_skill_attribute_groups_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  return row ? row.value : 0;
}

// ✅ NOUVEAU : Charger tous les attributs d'un agent sous forme d'objet {conscience: X, dexterity: Y, technique: Z}
function getAgentAttributes(agentId) {
  const groups = all('SELECT sg.id, sg.name, aagv.value FROM skill_attribute_groups sg LEFT JOIN agent_skill_attribute_groups_values aagv ON aagv.agent_id = ? AND aagv.group_id = sg.id', [agentId]);
  
  const result = {};
  for (const group of groups) {
    const normalizedName = group.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e');
    result[normalizedName] = group.value || 0;
  }
  return result;
}

function setAgentAttributeGroupValue(agentId, groupId, value) {
  const numericValue = Number(value) || 0;
  const existing = get('SELECT id FROM agent_skill_attribute_groups_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  if (existing) {
    run('UPDATE agent_skill_attribute_groups_values SET value = ? WHERE agent_id = ? AND group_id = ?', [numericValue, agentId, groupId]);
  } else {
    run('INSERT INTO agent_skill_attribute_groups_values (agent_id, group_id, value) VALUES (?, ?, ?)', [agentId, groupId, numericValue]);
  }
}

function getAgentAttributeValue(agentId, attributeId) {
  const row = get('SELECT value FROM agent_skill_attributes_values WHERE agent_id = ? AND attribute_id = ?', [agentId, attributeId]);
  return row ? row.value : 0;
}

function setAgentAttributeValue(agentId, attributeId, value) {
  const existing = get('SELECT id FROM agent_skill_attributes_values WHERE agent_id = ? AND attribute_id = ?', [agentId, attributeId]);
  if (existing) {
    run('UPDATE agent_skill_attributes_values SET value = ? WHERE agent_id = ? AND attribute_id = ?', [value, agentId, attributeId]);
  } else {
    run('INSERT INTO agent_skill_attributes_values (agent_id, attribute_id, value) VALUES (?, ?, ?)', [agentId, attributeId, value]);
  }
}

function getAgentSkillGroupValue(agentId, groupId) {
  const row = get('SELECT value FROM agent_skill_groups_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  return row ? row.value : 0;
}

function setAgentSkillGroupValue(agentId, groupId, value) {
  const existing = get('SELECT id FROM agent_skill_groups_values WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  if (existing) {
    run('UPDATE agent_skill_groups_values SET value = ? WHERE agent_id = ? AND group_id = ?', [value, agentId, groupId]);
  } else {
    run('INSERT INTO agent_skill_groups_values (agent_id, group_id, value) VALUES (?, ?, ?)', [agentId, groupId, value]);
  }
}

function getAgentSkillValue(agentId, skillId) {
  const row = get('SELECT value FROM agent_skills_values WHERE agent_id = ? AND skill_id = ?', [agentId, skillId]);
  return row ? row.value : 0;
}

function setAgentSkillValue(agentId, skillId, value) {
  const existing = get('SELECT id FROM agent_skills_values WHERE agent_id = ? AND skill_id = ?', [agentId, skillId]);
  if (existing) {
    run('UPDATE agent_skills_values SET value = ? WHERE agent_id = ? AND skill_id = ?', [value, agentId, skillId]);
  } else {
    run('INSERT INTO agent_skills_values (agent_id, skill_id, value) VALUES (?, ?, ?)', [agentId, skillId, value]);
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
  
  // Determine the correct column name based on the table
  let columnName = 'group_id';
  if (childrenTable === 'agent_skill_attributes_values') {
    columnName = 'attribute_id';
  } else if (childrenTable === 'agent_skills_values') {
    columnName = 'skill_id';
  } else if (childrenTable === 'agent_stats_group_value') {
    columnName = 'group_id';
  }
  // Default to group_id for agent_skill_groups_values and agent_skill_attribute_groups_values
  
  const placeholders = childrenIds.map(() => '?').join(',');
  const query = `SELECT COALESCE(SUM(value), 0) as total FROM ${childrenTable} WHERE agent_id = ? AND ${columnName} IN (${placeholders})`;
  const params = [agentId, ...childrenIds.map(id => id.id || id)];
  const row = get(query, params);
  return row ? row.total : 0;
}

// Get sum of attribute values for an attribute group
function getAttributeGroupValueSum(agentId, groupId) {
  const attributeIds = getAttributeGroupChildren(groupId);
  if (attributeIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_skill_attributes_values', attributeIds);
}

// Get sum of skill group values for an attribute
function getAttributeValueSum(agentId, attributeId) {
  const groupIds = getAttributeChildren(attributeId);
  if (groupIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_skill_groups_values', groupIds);
}

// Get sum of skill values for a skill group
function getSkillGroupValueSum(agentId, groupId) {
  const skillIds = getSkillGroupChildren(groupId);
  if (skillIds.length === 0) return 0;
  return getChildrenValueSum(agentId, 'agent_skills_values', skillIds);
}

// Validate hierarchy: children sum must be <= parent value
function validateHierarchy(agentId, entityType, entityId, newValue) {
  let childrenTable = '';
  let childrenQuery = '';
  
  switch (entityType) {
    case 'attribute_group':
      childrenTable = 'agent_skill_attributes_values';
      childrenQuery = 'SELECT id FROM skill_attributes WHERE group_id = ?';
      break;
    case 'attribute':
      // Pour les attributs, on ne valide pas la hiérarchie des enfants (skill_groups)
      // car cette validation est déjà faite côté client dans handleAttributeValueChange
      // et n'est pas nécessaire pour la feature de redistribution des points
      return true;
    case 'skill_group':
      childrenTable = 'agent_skills_values';
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
  
  // Initialize default stats values for a new agent
  initializeAgentStats(agentId);
}

// Initialize default stats values for a new agent
function initializeAgentStats(agentId) {
  const statsGroups = all('SELECT id FROM stats_group');
  for (const group of statsGroups) {
    setAgentStatsGroupValue(agentId, group.id, 0);
  }
}

// Stats helper functions
function getStatsGroups() {
  return all('SELECT id, name FROM stats_group ORDER BY id');
}

function getAgentStatsGroupValue(agentId, groupId) {
  const row = get('SELECT value FROM agent_stats_group_value WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  return row ? row.value : 0;
}

function setAgentStatsGroupValue(agentId, groupId, value) {
  const numericValue = Number(value) || 0;
  const existing = get('SELECT id FROM agent_stats_group_value WHERE agent_id = ? AND group_id = ?', [agentId, groupId]);
  if (existing) {
    run('UPDATE agent_stats_group_value SET value = ? WHERE agent_id = ? AND group_id = ?', [numericValue, agentId, groupId]);
  } else {
    run('INSERT INTO agent_stats_group_value (agent_id, group_id, value) VALUES (?, ?, ?)', [agentId, groupId, numericValue]);
  }
}

// ✅ NOUVEAU : Charger toutes les stats d'un agent sous forme d'objet
function getAgentStats(agentId) {
  const groups = all('SELECT sg.id, sg.name, sgv.value FROM stats_group sg LEFT JOIN agent_stats_group_value sgv ON sgv.agent_id = ? AND sgv.group_id = sg.id', [agentId]);
  
  const result = {};
  for (const group of groups) {
    const normalizedName = group.name.toLowerCase()
      .replace(/é/gi, 'e').replace(/è/gi, 'e').replace(/ê/gi, 'e')
      .replace(/[^a-z0-9]/g, '');
    result[normalizedName] = group.value || 0;
  }
  return result;
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

async function setAgentStatsGroupValueAsync(agentId, groupId, value) {
  await ensureReady();
  setAgentStatsGroupValue(agentId, groupId, value);
}

async function getStatsGroupsAsync() {
  await ensureReady();
  return getStatsGroups();
}

async function getAgentStatsGroupValueAsync(agentId, groupId) {
  await ensureReady();
  return getAgentStatsGroupValue(agentId, groupId);
}

async function getAgentStatsAsync(agentId) {
  await ensureReady();
  return getAgentStats(agentId);
}

// Async versions for talents
async function getAgentTalentsAsync(agentId) {
  await ensureReady();
  return getAgentTalents(agentId);
}

async function hasAgentTalentAsync(agentId, talentId) {
  await ensureReady();
  return hasAgentTalent(agentId, talentId);
}

async function addAgentTalentAsync(agentId, talentId) {
  await ensureReady();
  addAgentTalent(agentId, talentId);
}

async function removeAgentTalentAsync(agentId, talentId) {
  await ensureReady();
  removeAgentTalent(agentId, talentId);
}

async function setAgentTalentsAsync(agentId, talentIds) {
  await ensureReady();
  setAgentTalents(agentId, talentIds);
}

// ============ MESSAGES ============

// Créer un message pour un agent
function createMessage(agent_id, value) {
  const stmt = db.prepare('INSERT INTO agent_messages (agent_id, value, is_read) VALUES (?, ?, FALSE)');
  stmt.bind([agent_id, value]);
  const result = stmt.run();
  stmt.free();
  saveDatabase();
  return result;
}

// Récupérer tous les messages d'un agent
function getMessagesByAgentId(agentId) {
  const rows = all('SELECT * FROM agent_messages WHERE agent_id = ? ORDER BY id DESC', [agentId]);
  return rows.map(row => ({
    id: row.id,
    agent_id: row.agent_id,
    value: row.value,
    is_read: row.is_read !== undefined ? Boolean(row.is_read) : false
  }));
}

// Supprimer un message par son ID
function deleteMessage(id) {
  run('DELETE FROM agent_messages WHERE id = ?', [id]);
}

// Supprimer tous les messages d'un agent (pour la suppression en cascade)
function deleteMessagesByAgentId(agentId) {
  run('DELETE FROM agent_messages WHERE agent_id = ?', [agentId]);
}

// Marquer un message comme lu
function markMessageAsRead(id) {
  // Vérifier que la colonne is_read existe, sinon l'ajouter
  try {
    const columns = db.exec('PRAGMA table_info(agent_messages)');
    if (columns && columns[0] && columns[0].values) {
      const columnNames = columns[0].values.map(col => col[1]);
      if (!columnNames.includes('is_read')) {
        db.run('ALTER TABLE agent_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE');
        console.log('⚠ Colonne is_read créée à la volée dans markMessageAsRead');
      }
    }
  } catch (e) {
    console.warn('Vérification de la colonne is_read échouée:', e.message);
  }
  
  run('UPDATE agent_messages SET is_read = TRUE WHERE id = ?', [id]);
}

// Versions asynchrones
async function createMessageAsync(agent_id, value) {
  await ensureReady();
  return createMessage(agent_id, value);
}

async function getMessagesByAgentIdAsync(agentId) {
  await ensureReady();
  return getMessagesByAgentId(agentId);
}

async function deleteMessageAsync(id) {
  await ensureReady();
  deleteMessage(id);
}

async function deleteMessagesByAgentIdAsync(agentId) {
  await ensureReady();
  deleteMessagesByAgentId(agentId);
}

async function markMessageAsReadAsync(id) {
  await ensureReady();
  markMessageAsRead(id);
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
  ensureReady,
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
  getStatsGroups: getStatsGroupsAsync,
  getAgentStatsGroupValue: getAgentStatsGroupValueAsync,
  setAgentStatsGroupValue: setAgentStatsGroupValueAsync,
  getAgentStats: getAgentStatsAsync,
  initializeAgentStats,
  // Talents
  getAgentTalents: getAgentTalentsAsync,
  hasAgentTalent: hasAgentTalentAsync,
  addAgentTalent: addAgentTalentAsync,
  removeAgentTalent: removeAgentTalentAsync,
  setAgentTalents: setAgentTalentsAsync,
  // Messages
  createMessage: createMessageAsync,
  getMessagesByAgentId: getMessagesByAgentIdAsync,
  deleteMessage: deleteMessageAsync,
  deleteMessagesByAgentId: deleteMessagesByAgentIdAsync,
  markMessageAsRead: markMessageAsReadAsync,
};

// Migration pour ajouter la colonne is_read à agent_messages
async function migrateAgentMessagesIsRead() {
  try {
    const columns = db.exec('PRAGMA table_info(agent_messages)');
    if (!columns || !columns.length || !columns[0] || !columns[0].values) {
      console.warn('Table agent_messages introuvable, recréation...');
      return;
    }
    const columnNames = columns[0].values.map(col => col[1]);
    
    if (!columnNames.includes('is_read')) {
      db.run('ALTER TABLE agent_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE');
      console.log('✓ Colonne is_read ajoutée à agent_messages');
    } else {
      console.log('✓ Colonne is_read existe déjà dans agent_messages');
    }
  } catch (e) {
    console.warn('Impossible de migrer la colonne is_read:', e.message);
  }
}

// Exécuter la migration des noms des groupes d'attributs au démarrage
migrateAttributeGroupNames().catch(e => console.warn('Migration des groupes d\'attributs échouée:', e.message));

// Exécuter la migration du renommage de la table agent_attributes_values au démarrage
migrateAgentAttributesValuesTable().catch(e => console.warn('Migration de la table agent_attributes_values échouée:', e.message));

// Exécuter la migration pour ajouter is_read à agent_messages
migrateAgentMessagesIsRead().catch(e => console.warn('Migration de la colonne is_read échouée:', e.message));
