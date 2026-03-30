import { readFileSync, writeFileSync } from 'fs';

const PROJECT_ID = 2;
const BASE_URL = 'http://localhost:3000';
const THRESHOLD = 80;

const MODULES = [
  { moduleId: 1, submoduleId: '1.1', name: 'Dossier CNC / régions / Europe', sub: 'Structure administrative' },
  { moduleId: 2, submoduleId: '2.1', name: 'Pitch deck investisseurs animation', sub: 'Problème / opportunité' },
  { moduleId: 3, submoduleId: '3.1', name: 'Bible artistique (Art Bible)', sub: 'Introduction & ton' },
  { moduleId: 4, submoduleId: '4.1', name: 'Plan de production Gantt', sub: 'Découpage en phases' },
  { moduleId: 5, submoduleId: '5.1', name: 'Budget prévisionnel détaillé', sub: 'Masse salariale' },
  { moduleId: 6, submoduleId: '6.1', name: 'Dossier technique concours (Annecy)', sub: 'Formulaire officiel' },
  { moduleId: 7, submoduleId: '7.1', name: 'Rapport d\'activité annuel', sub: 'Bilan qualitatif' },
  { moduleId: 8, submoduleId: '8.1', name: 'Game Design Document (GDD)', sub: 'Vision & concept' },
  { moduleId: 9, submoduleId: '9.1', name: 'Business plan éditeur / investisseur JV', sub: 'Synthèse executive' },
  { moduleId: 10, submoduleId: '10.1', name: 'Dossier subventions JV (FJV/CNC)', sub: 'Fiche projet' },
];

const getMention = (score) => {
  if (score >= 95) return 'GOD TIER ⭐';
  if (score >= 85) return 'EXCELLENT ✅';
  if (score >= 70) return 'BON 👍';
  return 'INSUFFISANT ⚠️';
};

async function generateModule(mod, index) {
  console.log(`\n[${index + 1}/10] Génération M${mod.moduleId} — ${mod.name}`);
  console.log(`       Sous-module : ${mod.submoduleId} — ${mod.sub}`);
  const start = Date.now();

  const res = await fetch(`${BASE_URL}/api/prompts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      moduleId: mod.moduleId,
      submoduleId: mod.submoduleId,
      targetPlatform: 'claude',
      scoringThreshold: THRESHOLD,
    }),
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (!res.ok) {
    const err = await res.text();
    console.log(`       ❌ ERREUR (${res.status}): ${err.substring(0, 120)}`);
    return { ...mod, error: err, elapsed };
  }

  const data = await res.json();
  const mention = getMention(data.finalScore);
  console.log(`       ✅ Score: ${data.finalScore}/100 — ${mention} — ${data.iterations} itération(s) — ${elapsed}s`);

  return {
    ...mod,
    score: data.finalScore,
    mention: data.mention,
    iterations: data.iterations,
    elapsed,
    variants: data.variants?.map(v => ({ style: v.style, score: v.scoring?.scoreTotal })),
  };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANIMAFUND — GÉNÉRATION MODULE PAR MODULE');
  console.log('  Projet : LUMINA — Série Animation 2D');
  console.log(`  Seuil God Tier : ${THRESHOLD}/100`);
  console.log('═══════════════════════════════════════════════════════');

  const results = [];
  const globalStart = Date.now();

  for (let i = 0; i < MODULES.length; i++) {
    const result = await generateModule(MODULES[i], i);
    results.push(result);
  }

  const totalElapsed = ((Date.now() - globalStart) / 1000 / 60).toFixed(1);
  const successResults = results.filter(r => !r.error);
  const avgScore = successResults.length > 0
    ? Math.round(successResults.reduce((s, r) => s + r.score, 0) / successResults.length)
    : 0;
  const godTierCount = successResults.filter(r => r.score >= 95).length;
  const excellentCount = successResults.filter(r => r.score >= 85 && r.score < 95).length;

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RAPPORT FINAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Modules générés    : ${successResults.length}/10`);
  console.log(`  Score moyen global : ${avgScore}/100`);
  console.log(`  GOD TIER (≥95)     : ${godTierCount} module(s)`);
  console.log(`  EXCELLENT (≥85)    : ${excellentCount} module(s)`);
  console.log(`  Durée totale       : ${totalElapsed} min`);
  console.log('');
  console.log('  DÉTAIL PAR MODULE :');
  console.log('  ─────────────────────────────────────────────────────');
  for (const r of results) {
    if (r.error) {
      console.log(`  ❌ M${r.moduleId} — ${r.name}`);
    } else {
      const mention = getMention(r.score);
      const variantScores = r.variants?.map(v => `${v.style}:${v.score}`).join(' | ') || '';
      console.log(`  M${r.moduleId.toString().padStart(2,'0')} — Score: ${r.score}/100 — ${mention}`);
      console.log(`       ${r.name} > ${r.sub}`);
      console.log(`       Variantes → ${variantScores}`);
      console.log(`       Itérations: ${r.iterations} — Durée: ${r.elapsed}s`);
      console.log('');
    }
  }
  console.log('═══════════════════════════════════════════════════════');

  writeFileSync('/tmp/lumina-report.json', JSON.stringify(results, null, 2));
  console.log('  Rapport JSON sauvegardé : /tmp/lumina-report.json');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
