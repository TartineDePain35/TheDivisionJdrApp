const db = require('./db.js');

async function test() {
  await db.ensureReady();
  
  console.log('=== Test Final: Vérification agent_talents_value ===\n');
  
  try {
    // 1. Obtenir les talents disponibles
    const allTalents = await db.getAllTalents();
    console.log('Talents disponibles:', allTalents.length);
    allTalents.forEach(t => console.log(`  ID ${t.id}: ${t.title}`));
    
    if (allTalents.length >= 1) {
      // 2. Créer un agent avec un talent spécifique (ID 4 par exemple)
      const talentIdToUse = allTalents.find(t => t.id === 4) || allTalents[0];
      console.log(`\n2. Création agent avec talent ID ${talentIdToUse.id}...`);
      
      const agentWithTalent = {
        name: 'TestFinalTalent',
        firstName: 'Agent',
        age: 25,
        profession: 'Testeur',
        sex: 'M',
        familyStatus: 'Célibataire',
        children: 0,
        story: 'Test final talents',
        password: 'test123',
        availableStatsPoints: 2,
        availableAttributesPoints: 1,
        lifePercent: 100,
        activeMission: 'Test',
        wounds: null,
        effects: null,
        inventoryCapacity: 30,
        xp: 0,
        stats: { speed: 1, resilience: 1, vigor: 1 },
        attributes: { conscience: 1, dexterity: 1, technique: 1 },
        talents: [talentIdToUse]  // Talent avec ID spécifique
      };
      
      const created = await db.createAgent(agentWithTalent);
      console.log('✅ Agent créé, ID:', created.id);
      console.log('   Talents dans agent:', created.talents.length);
      
      if (created.talents.length > 0) {
        console.log('   Talent IDs:', created.talents.map(t => t.id));
      }
      
      // 3. Vérifier directement via getAgentTalents
      const talents = await db.getAgentTalents(created.id);
      console.log('\n3. Talents via getAgentTalents:', talents.length);
      
      if (talents.length > 0) {
        console.log('   Talent IDs:', talents.map(t => t.id));
        console.log('   Talent titres:', talents.map(t => t.title));
      } else {
        console.log('   ⚠️  AUCUN TALENT TROUVÉ !');
      }
      
      // 4. Vérifier si le talent correct est présent
      const hasCorrectTalent = talents.some(t => t.id === talentIdToUse.id);
      console.log(`\n4. Talent ${talentIdToUse.id} présent: ${hasCorrectTalent ? '✅' : '❌'}`);
      
      if (!hasCorrectTalent) {
        console.log('   ❌ PROBLÈME: Le talent n\'a pas été enregistré!');
        console.log('   Vérification: agent.talents =', agentWithTalent.talents);
        console.log('   Talent ID:', agentWithTalent.talents[0]?.id);
      } else {
        console.log('\n✅ SUCCESS: agent_talents_value est correctement mise à jour!');
      }
    }
    
    console.log('\n=== Test terminé ===');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

test().catch(console.error);