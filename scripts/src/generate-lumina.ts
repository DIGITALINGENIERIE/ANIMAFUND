import { db } from "@workspace/db";
import { generatedPromptsTable, projectsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

// Importer directement depuis l'api-server (chemins relatifs)
import { callGenerationLLM, callImprovementLLM, scorePrompt, type ScoringResult } from "../../artifacts/api-server/src/lib/llm-client.js";
import {
  buildExpertPrompt,
  buildCreatifPrompt,
  buildTemplatePrompt,
  buildScoringPrompt,
  buildImprovementPrompt,
  type PromptContext,
} from "../../artifacts/api-server/src/lib/prompt-templates.js";
import { MODULES } from "../../artifacts/api-server/src/data/modules.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const PROJECT_ID = 2;
const THRESHOLD = 80;
const MAX_ITERATIONS = 4;

// Modules à générer (premier sous-module de chacun, skip M1 et M2 déjà générés)
const TO_GENERATE = [
  { moduleId: 3,  submoduleId: "3.1"  },
  { moduleId: 4,  submoduleId: "4.1"  },
  { moduleId: 5,  submoduleId: "5.1"  },
  { moduleId: 6,  submoduleId: "6.1"  },
  { moduleId: 7,  submoduleId: "7.1"  },
  { moduleId: 8,  submoduleId: "8.1"  },
  { moduleId: 9,  submoduleId: "9.1"  },
  { moduleId: 10, submoduleId: "10.1" },
];

// ─── Logique de génération (reprise de prompts.ts) ────────────────────────────

const GOD_TIER_SYSTEM = `Tu es ANIMAFUND — système d'intelligence artificielle spécialisé dans la production de documents de financement God Tier pour l'industrie créative française (animation 2D/3D, jeu vidéo, production audiovisuelle).

## IDENTITÉ & EXPERTISE
Tu as une connaissance encyclopédique et opérationnelle de :
- Les décrets CNC 2024 (décret n°2021-1240 modifié), les grilles d'évaluation FJV 2024, les appels à projets Europe Creative 2024-2027
- Les normes comptables audiovisuelles françaises (PCG et règles IFRS applicables)
- Les conventions collectives de l'animation (CCN IDCC 2412) et du jeu vidéo (SYNTEC / SNJV)
- Les attentes précises des commissions CNC : Commission Développement, Commission Aide à la Production, COSIP, FAJV
- Les critères d'évaluation des investisseurs institutionnels (BPI France, Caisse des Dépôts, régions)
- Les festivals et marchés stratégiques (Annecy/MIFA, Cannes/Marché, GDC, Tokyo Game Show)

## STANDARDS DE QUALITÉ
Chaque output doit être directement utilisable, avec zéro hallucination et une cohérence narrative parfaite.
Langue : Français institutionnel impeccable. Format : Markdown structuré.`;

const GOD_TIER_PLANNING_SYSTEM = `Tu es un expert stratégique senior en financement de projets créatifs. Tu réponds en JSON structuré, concis et actionnable.`;

async function buildPlanningContext(ctx: PromptContext): Promise<string> {
  const planningPrompt = `Analyse ce projet créatif et prépare un plan stratégique pour "${ctx.submoduleName}" (module: "${ctx.moduleName}").

PROJET : ${ctx.project.nom}
Logline : ${ctx.project.logline}
Genre : ${ctx.project.genre}
Budget total : ${ctx.project.budgetTotal}€ | Montant recherché : ${ctx.project.montantRecherche}€
Avancement : ${ctx.project.avancement}
Équipe : ${(ctx.project.equipe || []).map((e) => `${e.nom} (${e.role})`).join(", ")}

Identifie en JSON :
{
  "argumentsPhares": ["top 3 arguments"],
  "risquesPotentiels": ["2-3 points faibles"],
  "angleNarratif": "angle le plus percutant",
  "donneesMarche": ["2-3 données sectorielles"],
  "formatCible": "format optimal",
  "mots_cles_reglementaires": ["5 termes clés"]
}`;

  try {
    const raw = await callGenerationLLM(GOD_TIER_PLANNING_SYSTEM, planningPrompt, 0.3, 1500);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return `## PLAN STRATÉGIQUE\n` +
        `**Arguments phares :** ${(parsed.argumentsPhares || []).join(" | ")}\n` +
        `**Risques :** ${(parsed.risquesPotentiels || []).join(" | ")}\n` +
        `**Angle narratif :** ${parsed.angleNarratif || ""}\n` +
        `**Données marché :** ${(parsed.donneesMarche || []).join(" | ")}\n` +
        `**Mots-clés réglementaires :** ${(parsed.mots_cles_reglementaires || []).join(", ")}`;
    }
    return raw.substring(0, 600);
  } catch {
    return "";
  }
}

async function generateAndScoreVariant(
  ctx: PromptContext,
  style: "expert" | "creatif" | "template",
  maxIter: number,
  threshold: number,
  planningContext: string
): Promise<{ content: string; scoring: ScoringResult; iterations: number }> {
  const promptBuilders = {
    expert: (c: PromptContext, p: string) => buildExpertPrompt(c, p),
    creatif: (c: PromptContext, p: string) => buildCreatifPrompt(c, p),
    template: (c: PromptContext, p: string) => buildTemplatePrompt(c, p),
  };
  const temps = { expert: 0.65, creatif: 0.82, template: 0.55 };

  let instructions = promptBuilders[style](ctx, planningContext);
  let bestContent = "";
  let bestScoring: ScoringResult | null = null;
  let iterations = 0;

  for (let i = 0; i < maxIter; i++) {
    iterations++;
    const content = i === 0
      ? await callGenerationLLM(GOD_TIER_SYSTEM, instructions, temps[style], 8000)
      : await callImprovementLLM(GOD_TIER_SYSTEM, instructions, temps[style], 8000);

    const scoringInstr = buildScoringPrompt(content, style);
    const scoring = await scorePrompt(content, scoringInstr);

    if (!bestScoring || scoring.scoreTotal > bestScoring.scoreTotal) {
      bestContent = content;
      bestScoring = scoring;
    }
    if (bestScoring.scoreTotal >= threshold) break;

    if (i < maxIter - 1 && scoring.weakPoints.length > 0) {
      instructions = buildImprovementPrompt(bestContent, scoring.weakPoints, style, ctx);
    }
  }

  return { content: bestContent, scoring: bestScoring!, iterations };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const getMention = (score: number) => {
  if (score >= 95) return "GOD TIER ⭐";
  if (score >= 85) return "EXCELLENT ✅";
  if (score >= 70) return "BON 👍";
  return "INSUFFISANT ⚠️";
};

interface Result {
  moduleId: number;
  submoduleId: string;
  moduleName: string;
  submoduleName: string;
  score: number;
  mention: string;
  iterations: number;
  elapsed: number;
  variantScores: string;
  error?: string;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ANIMAFUND — GÉNÉRATION MODULE PAR MODULE");
  console.log("  Projet : LUMINA — Série Animation 2D");
  console.log(`  Modules à générer : ${TO_GENERATE.length} | Seuil : ${THRESHOLD}/100`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, PROJECT_ID));
  if (!project) throw new Error(`Projet ${PROJECT_ID} introuvable`);

  const globalStart = Date.now();
  const results: Result[] = [];

  for (let i = 0; i < TO_GENERATE.length; i++) {
    const { moduleId, submoduleId } = TO_GENERATE[i];
    const mod = MODULES.find(m => m.id === moduleId)!;
    const sub = mod.submodules.find(s => s.id === submoduleId)!;

    console.log(`[${i + 1}/${TO_GENERATE.length}] M${moduleId} — ${mod.nom}`);
    console.log(`         Sous-module : ${submoduleId} — ${sub.nom}`);

    const start = Date.now();

    try {
      const ctx: PromptContext = {
        moduleName: mod.nom,
        submoduleName: sub.nom,
        submoduleDescription: sub.description,
        project: {
          nom: project.nom,
          logline: project.logline,
          synopsisCourt: project.synopsisCourt,
          genre: project.genre,
          cible: project.cible,
          ton: (project.ton as string[]) || [],
          references: (project.references as string[]) || [],
          equipe: (project.equipe as Array<{ nom: string; role: string; bioCourte: string }>) || [],
          budgetTotal: project.budgetTotal,
          montantRecherche: project.montantRecherche,
          avancement: project.avancement,
          societe: project.societe,
          siret: project.siret,
          region: project.region,
        },
        targetPlatform: "claude",
      };

      const planningCtx = await buildPlanningContext(ctx);

      const [expertR, creatifR, templateR] = await Promise.all([
        generateAndScoreVariant(ctx, "expert",   MAX_ITERATIONS, THRESHOLD, planningCtx),
        generateAndScoreVariant(ctx, "creatif",  MAX_ITERATIONS, THRESHOLD, planningCtx),
        generateAndScoreVariant(ctx, "template", MAX_ITERATIONS, THRESHOLD, planningCtx),
      ]);

      const variants = [
        { style: "expert",   content: expertR.content,   scoring: expertR.scoring   },
        { style: "creatif",  content: creatifR.content,  scoring: creatifR.scoring  },
        { style: "template", content: templateR.content, scoring: templateR.scoring },
      ];

      const finalScore = Math.round(
        (expertR.scoring.scoreTotal + creatifR.scoring.scoreTotal + templateR.scoring.scoreTotal) / 3
      );
      const maxIter = Math.max(expertR.iterations, creatifR.iterations, templateR.iterations);
      const mention = finalScore >= 95 ? "god_tier" : finalScore >= 85 ? "excellent" : finalScore >= 70 ? "bon" : "insuffisant";
      const elapsed = Math.round((Date.now() - start) / 1000);

      // Sauvegarde en DB (upsert)
      const existing = await db.select().from(generatedPromptsTable).where(
        and(
          eq(generatedPromptsTable.projectId, PROJECT_ID),
          eq(generatedPromptsTable.moduleId, moduleId),
          eq(generatedPromptsTable.submoduleId, submoduleId)
        )
      );

      if (existing.length > 0) {
        await db.update(generatedPromptsTable)
          .set({ finalScore, mention, iterations: maxIter, variants, moduleName: mod.nom, submoduleName: sub.nom, updatedAt: new Date() })
          .where(eq(generatedPromptsTable.id, existing[0].id));
      } else {
        await db.insert(generatedPromptsTable).values({
          projectId: PROJECT_ID, moduleId, submoduleId,
          moduleName: mod.nom, submoduleName: sub.nom,
          targetPlatform: "claude", finalScore, mention,
          iterations: maxIter, variants,
        });
      }

      const variantScores = `expert:${expertR.scoring.scoreTotal} | creatif:${creatifR.scoring.scoreTotal} | template:${templateR.scoring.scoreTotal}`;
      console.log(`         ✅ Score: ${finalScore}/100 — ${getMention(finalScore)} — ${maxIter} itération(s) — ${elapsed}s`);
      console.log(`         Variantes → ${variantScores}\n`);

      results.push({ moduleId, submoduleId, moduleName: mod.nom, submoduleName: sub.nom, score: finalScore, mention, iterations: maxIter, elapsed, variantScores });

    } catch (err: unknown) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`         ❌ ERREUR après ${elapsed}s : ${msg.substring(0, 120)}\n`);
      results.push({ moduleId, submoduleId, moduleName: mod.nom, submoduleName: sub.nom, score: 0, mention: "erreur", iterations: 0, elapsed, variantScores: "", error: msg });
    }
  }

  const totalMin = ((Date.now() - globalStart) / 1000 / 60).toFixed(1);
  const success = results.filter(r => !r.error);
  const avgScore = success.length > 0 ? Math.round(success.reduce((s, r) => s + r.score, 0) / success.length) : 0;

  // Récupérer aussi M1 et M2 déjà générés
  const allPrompts = await db.select().from(generatedPromptsTable).where(eq(generatedPromptsTable.projectId, PROJECT_ID));

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  RAPPORT FINAL — LUMINA Série Animation 2D");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Modules en base    : ${allPrompts.length}/10`);
  console.log(`  Score moyen (M3-M10) : ${avgScore}/100`);
  console.log(`  Durée M3→M10       : ${totalMin} min`);
  console.log("\n  RÉSUMÉ PAR MODULE (TOUS) :");
  console.log("  ─────────────────────────────────────────────────────────────");
  for (const p of allPrompts.sort((a, b) => a.moduleId - b.moduleId)) {
    console.log(`  M${p.moduleId.toString().padStart(2, "0")} ${getMention(p.finalScore)} — Score: ${p.finalScore}/100 — ${p.moduleName}`);
    console.log(`       Sous-module : ${p.submoduleId} — ${p.submoduleName} | ${p.iterations} iter`);
  }
  const allScores = allPrompts.map(p => p.finalScore);
  const globalAvg = Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length);
  const godTier = allPrompts.filter(p => p.finalScore >= 95).length;
  const excellent = allPrompts.filter(p => p.finalScore >= 85 && p.finalScore < 95).length;
  console.log("\n  ─────────────────────────────────────────────────────────────");
  console.log(`  SCORE GLOBAL MOYEN : ${globalAvg}/100`);
  console.log(`  GOD TIER (≥95)     : ${godTier} module(s)`);
  console.log(`  EXCELLENT (≥85)    : ${excellent} module(s)`);
  console.log("═══════════════════════════════════════════════════════════════");
}

main().catch(err => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});
