// Client HTTP séquentiel — appelle l'API locale pour générer module par module
const BASE = 'http://localhost:3000';
const PROJECT_ID = 2;
const THRESHOLD = 80;

const REMAINING = [
  { moduleId: 3,  submoduleId: '3.1',  label: 'Bible Artistique — Introduction & ton' },
  { moduleId: 4,  submoduleId: '4.1',  label: 'Plan de production — Découpage en phases' },
  { moduleId: 5,  submoduleId: '5.1',  label: 'Budget prévisionnel — Masse salariale' },
  { moduleId: 6,  submoduleId: '6.1',  label: 'Dossier technique concours — Formulaire officiel' },
  { moduleId: 7,  submoduleId: '7.1',  label: 'Rapport d\'activité — Bilan qualitatif' },
  { moduleId: 8,  submoduleId: '8.1',  label: 'GDD — Vision & concept' },
  { moduleId: 9,  submoduleId: '9.1',  label: 'Business plan JV — Synthèse executive' },
  { moduleId: 10, submoduleId: '10.1', label: 'Dossier subventions JV — Fiche projet' },
];

const mention = s => s >= 95 ? 'GOD TIER ⭐' : s >= 85 ? 'EXCELLENT ✅' : s >= 70 ? 'BON 👍' : 'INSUFFISANT ⚠️';

async function generateModule(mod, index) {
  const start = Date.now();
  process.stdout.write(`[${index+1}/8] M${mod.moduleId} — ${mod.label}\n         ⏳ Génération en cours...`);

  try {
    const res = await fetch(`${BASE}/api/prompts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        moduleId: mod.moduleId,
        submoduleId: mod.submoduleId,
        targetPlatform: 'claude',
        scoringThreshold: THRESHOLD,
      }),
      signal: AbortSignal.timeout(300000), // 5 min max
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(0);

    if (!res.ok) {
      const err = await res.text();
      process.stdout.write(` ❌\n         Erreur ${res.status}: ${err.substring(0,100)}\n\n`);
      return { ...mod, error: true, elapsed };
    }

    const data = await res.json();
    const vs = data.variants?.map(v => `${v.style}:${v.scoring?.scoreTotal}`).join(' | ') || '';
    process.stdout.write(` ✅\n         Score: ${data.finalScore}/100 — ${mention(data.finalScore)} — ${data.iterations} iter — ${elapsed}s\n         Variantes → ${vs}\n\n`);
    return { ...mod, score: data.finalScore, mention: data.mention, iterations: data.iterations, elapsed, variants: vs };

  } catch (e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    process.stdout.write(` ❌\n         Erreur: ${e.message.substring(0,120)} (${elapsed}s)\n\n`);
    return { ...mod, error: true, elapsed };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ANIMAFUND — GÉNÉRATION MODULE PAR MODULE');
  console.log('  Projet #2 : LUMINA — Série Animation 2D');
  console.log(`  Modules restants : ${REMAINING.length} (M3→M10)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const globalStart = Date.now();
  const results = [];

  for (let i = 0; i < REMAINING.length; i++) {
    const result = await generateModule(REMAINING[i], i);
    results.push(result);
  }

  // Récupérer tous les prompts du projet
  const all = await fetch(`${BASE}/api/prompts/${PROJECT_ID}`).then(r => r.json());
  const allSorted = all.sort((a, b) => a.moduleId - b.moduleId);

  const totalMin = ((Date.now() - globalStart) / 1000 / 60).toFixed(1);
  const scores = allSorted.map(p => p.finalScore);
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  const godTier = allSorted.filter(p => p.finalScore >= 95).length;
  const excellent = allSorted.filter(p => p.finalScore >= 85 && p.finalScore < 95).length;
  const bon = allSorted.filter(p => p.finalScore >= 70 && p.finalScore < 85).length;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📊 RAPPORT FINAL — LUMINA Série Animation 2D');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Modules en base      : ${allSorted.length}/10`);
  console.log(`  Score global moyen   : ${avg}/100`);
  console.log(`  GOD TIER (≥95)       : ${godTier} module(s) ⭐`);
  console.log(`  EXCELLENT (≥85)      : ${excellent} module(s) ✅`);
  console.log(`  BON (≥70)            : ${bon} module(s) 👍`);
  console.log(`  Durée M3→M10         : ${totalMin} min`);
  console.log('\n  DÉTAIL PAR MODULE :');
  console.log('  ─────────────────────────────────────────────────────────────');
  for (const p of allSorted) {
    console.log(`  M${p.moduleId.toString().padStart(2,'0')} — ${mention(p.finalScore)} — ${p.finalScore}/100 — ${p.iterations} iter`);
    console.log(`       ${p.moduleName}`);
    console.log(`       Sous-module: ${p.submoduleId} — ${p.submoduleName}`);
  }
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
