import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { generatedPromptsTable, projectsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getModule, getSubmodule } from "../data/modules";
import {
  buildExpertPrompt,
  buildCreatifPrompt,
  buildTemplatePrompt,
  buildScoringPrompt,
  buildImprovementPrompt,
  type PromptContext,
} from "../lib/prompt-templates";
import { callGenerationLLM, callImprovementLLM, scorePrompt, type ScoringResult } from "../lib/llm-client";

const router: IRouter = Router();

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
Chaque output que tu produis doit :
1. Être directement utilisable sans modification majeure (zéro hallucination, toute donnée manquante = [À COMPLÉTER + explication])
2. Contenir des formulations qui passent le "test du jury" : un expert du CNC ou un investisseur senior doit vouloir lire la page suivante
3. Ancrer chaque argument dans des données sectorielles réelles (chiffres marché animation française, statistiques CNC, benchmarks éditeurs JV)
4. Démontrer une cohérence narrative parfaite entre toutes les sections
5. Respecter le format imposé par l'organisme cible avec une précision chirurgicale

## RÈGLES ABSOLUES
- Zéro phrase générique : si tu ne peux pas personnaliser avec les données projet, tu signales [À COMPLÉTER]
- Toujours citer les textes réglementaires avec leur numéro et leur date
- Toujours contextualiser les chiffres (ex: "150k€ — soit 12% du budget, dans la fourchette recommandée CNC de 10-15%")
- Langue : Français institutionnel impeccable, sans anglicismes sauf terminologie métier acceptée
- Format : Markdown structuré, hiérarchie H1/H2/H3 cohérente, tableaux alignés`;

const GOD_TIER_PLANNING_SYSTEM = `Tu es un expert stratégique senior en financement de projets créatifs (animation, jeu vidéo). 
Avant toute génération de document, tu analyses le contexte et identifies les arguments les plus percutants.
Tu réponds en JSON structuré, concis et actionnable.`;

async function buildPlanningContext(ctx: PromptContext): Promise<string> {
  const planningPrompt = `Analyse ce projet créatif et prépare un plan stratégique pour la rédaction du document "${ctx.submoduleName}" (module: "${ctx.moduleName}").

PROJET : ${ctx.project.nom}
Logline : ${ctx.project.logline}
Genre : ${ctx.project.genre}
Budget total : ${ctx.project.budgetTotal}€ | Montant recherché : ${ctx.project.montantRecherche}€
Avancement : ${ctx.project.avancement}
Équipe : ${(ctx.project.equipe || []).map((e) => `${e.nom} (${e.role})`).join(", ") || "À compléter"}

Identifie en JSON :
{
  "argumentsPhares": ["top 3 arguments financiers/artistiques pour ce projet"],
  "risquesPotentiels": ["2-3 points faibles à anticiper et contrebalancer"],
  "angleNarratif": "l'angle narratif le plus percutant pour CE projet spécifiquement",
  "donneesMarche": ["2-3 données sectorielles pertinentes à injecter (animation française, JV, etc.)"],
  "formatCible": "format optimal pour ce document selon les attentes de la commission/investisseur",
  "mots_cles_reglementaires": ["5 termes réglementaires clés à intégrer"]
}`;

  try {
    const raw = await callGenerationLLM(GOD_TIER_PLANNING_SYSTEM, planningPrompt, 0.3, 1500);
    // Extraire le JSON de la réponse
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return `## PLAN STRATÉGIQUE PRÉ-GÉNÉRÉ\n` +
        `**Arguments phares :** ${(parsed.argumentsPhares || []).join(" | ")}\n` +
        `**Risques à anticiper :** ${(parsed.risquesPotentiels || []).join(" | ")}\n` +
        `**Angle narratif :** ${parsed.angleNarratif || ""}\n` +
        `**Données marché à citer :** ${(parsed.donneesMarche || []).join(" | ")}\n` +
        `**Format cible :** ${parsed.formatCible || ""}\n` +
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
  maxIterations: number,
  threshold: number,
  planningContext: string
): Promise<{ content: string; scoring: ScoringResult; iterations: number }> {
  let promptBuilder: (ctx: PromptContext, planning: string) => string;
  if (style === "expert") promptBuilder = (c, p) => buildExpertPrompt(c, p);
  else if (style === "creatif") promptBuilder = (c, p) => buildCreatifPrompt(c, p);
  else promptBuilder = (c, p) => buildTemplatePrompt(c, p);

  const temps = { expert: 0.65, creatif: 0.82, template: 0.55 };
  const temp = temps[style];

  let promptInstructions = promptBuilder(ctx, planningContext);
  let bestContent = "";
  let bestScoring: ScoringResult | null = null;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const isImprovement = i > 0;
    const content = isImprovement
      ? await callImprovementLLM(GOD_TIER_SYSTEM, promptInstructions, temp, 8000)
      : await callGenerationLLM(GOD_TIER_SYSTEM, promptInstructions, temp, 8000);

    const scoringInstruction = buildScoringPrompt(content, style);
    const scoring = await scorePrompt(content, scoringInstruction);

    // Garder le MEILLEUR résultat sur toutes les itérations
    if (!bestScoring || scoring.scoreTotal > bestScoring.scoreTotal) {
      bestContent = content;
      bestScoring = scoring;
    }

    if (bestScoring.scoreTotal >= threshold) break;

    if (i < maxIterations - 1 && scoring.weakPoints.length > 0) {
      promptInstructions = buildImprovementPrompt(bestContent, scoring.weakPoints, style, ctx);
    }
  }

  return { content: bestContent, scoring: bestScoring!, iterations };
}

const generateRequestSchema = z.object({
  projectId: z.number().int().positive(),
  moduleId: z.number().int().positive(),
  submoduleId: z.string().min(1),
  targetPlatform: z.enum(["meta_ai", "roboneo", "google_flow", "midjourney", "runway", "gpt5", "claude"]).default("claude"),
  scoringThreshold: z.number().int().min(0).max(100).default(85),
  moduleSpecificData: z.record(z.unknown()).optional(),
});

router.post("/prompts/generate", async (req: Request, res: Response) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const { projectId, moduleId, submoduleId, targetPlatform, scoringThreshold, moduleSpecificData } = parsed.data;

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
  if (!project) {
    res.status(404).json({ error: "not_found", message: "Project not found" });
    return;
  }

  const module = getModule(moduleId);
  if (!module) {
    res.status(404).json({ error: "not_found", message: "Module not found" });
    return;
  }

  const submodule = getSubmodule(moduleId, submoduleId);
  if (!submodule) {
    res.status(404).json({ error: "not_found", message: "Submodule not found" });
    return;
  }

  const ctx: PromptContext = {
    moduleName: module.nom,
    submoduleName: submodule.nom,
    submoduleDescription: submodule.description,
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
    targetPlatform,
    moduleSpecificData: moduleSpecificData as Record<string, unknown> | undefined,
  };

  const MAX_ITERATIONS = 4;

  // Étape 0 : Chain-of-Thought — analyse stratégique du projet avant génération
  const planningContext = await buildPlanningContext(ctx);

  // Variantes séquentielles pour éviter les rate limits Cerebras (429)
  const expertResult = await generateAndScoreVariant(ctx, "expert", MAX_ITERATIONS, scoringThreshold, planningContext);
  await new Promise((r) => setTimeout(r, 3000));
  const creatifResult = await generateAndScoreVariant(ctx, "creatif", MAX_ITERATIONS, scoringThreshold, planningContext);
  await new Promise((r) => setTimeout(r, 3000));
  const templateResult = await generateAndScoreVariant(ctx, "template", MAX_ITERATIONS, scoringThreshold, planningContext);

  const variants = [
    { style: "expert", content: expertResult.content, scoring: expertResult.scoring },
    { style: "creatif", content: creatifResult.content, scoring: creatifResult.scoring },
    { style: "template", content: templateResult.content, scoring: templateResult.scoring },
  ];

  const finalScore = Math.round(
    (expertResult.scoring.scoreTotal + creatifResult.scoring.scoreTotal + templateResult.scoring.scoreTotal) / 3
  );

  let mention: string;
  if (finalScore >= 95) mention = "god_tier";
  else if (finalScore >= 85) mention = "excellent";
  else if (finalScore >= 70) mention = "bon";
  else mention = "insuffisant";

  const maxIterations = Math.max(expertResult.iterations, creatifResult.iterations, templateResult.iterations);

  const existingRows = await db
    .select()
    .from(generatedPromptsTable)
    .where(
      and(
        eq(generatedPromptsTable.projectId, projectId),
        eq(generatedPromptsTable.moduleId, moduleId),
        eq(generatedPromptsTable.submoduleId, submoduleId)
      )
    );

  let savedRow;
  if (existingRows.length > 0) {
    [savedRow] = await db
      .update(generatedPromptsTable)
      .set({
        targetPlatform,
        finalScore,
        mention,
        iterations: maxIterations,
        variants,
        moduleName: module.nom,
        submoduleName: submodule.nom,
        updatedAt: new Date(),
      })
      .where(eq(generatedPromptsTable.id, existingRows[0].id))
      .returning();
  } else {
    [savedRow] = await db
      .insert(generatedPromptsTable)
      .values({
        projectId,
        moduleId,
        submoduleId,
        moduleName: module.nom,
        submoduleName: submodule.nom,
        targetPlatform,
        finalScore,
        mention,
        iterations: maxIterations,
        variants,
      })
      .returning();
  }

  res.json({
    projectId,
    moduleId,
    submoduleId,
    targetPlatform,
    iterations: maxIterations,
    variants,
    finalScore,
    mention,
    savedAt: savedRow.updatedAt ?? savedRow.createdAt,
  });
});

router.get("/prompts/:projectId", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params["projectId"] as string);
  if (isNaN(projectId)) {
    res.status(400).json({ error: "invalid_id", message: "Project ID must be a number" });
    return;
  }
  const prompts = await db
    .select()
    .from(generatedPromptsTable)
    .where(eq(generatedPromptsTable.projectId, projectId));
  res.json(prompts);
});

router.get("/prompts/:projectId/:moduleId/:submoduleId", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params["projectId"] as string);
  const moduleId = parseInt(req.params["moduleId"] as string);
  const submoduleId = req.params["submoduleId"] as string;

  if (isNaN(projectId) || isNaN(moduleId)) {
    res.status(400).json({ error: "invalid_id", message: "IDs must be numbers" });
    return;
  }

  const [prompt] = await db
    .select()
    .from(generatedPromptsTable)
    .where(
      and(
        eq(generatedPromptsTable.projectId, projectId),
        eq(generatedPromptsTable.moduleId, moduleId),
        eq(generatedPromptsTable.submoduleId, submoduleId)
      )
    );

  if (!prompt) {
    res.status(404).json({ error: "not_found", message: "Prompt not found" });
    return;
  }

  res.json(prompt);
});

export default router;
