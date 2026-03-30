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
import { callLLM, scorePrompt, type ScoringResult } from "../lib/llm-client";

const router: IRouter = Router();

const GOD_TIER_SYSTEM = `Tu es ANIMAFUND — le générateur de prompts God Tier pour l'industrie créative (animation, jeu vidéo, production audiovisuelle). 
Tu génères des documents professionnels de niveau expert, utilisables directement dans des commissions de financement, pitch decks, et dossiers artistiques.
Tes outputs sont toujours en français, précis, complets, et jamais génériques.`;

async function generateAndScoreVariant(
  ctx: PromptContext,
  style: "expert" | "creatif" | "template",
  maxIterations: number,
  threshold: number
): Promise<{ content: string; scoring: ScoringResult; iterations: number }> {
  let promptBuilder: (ctx: PromptContext) => string;
  if (style === "expert") promptBuilder = buildExpertPrompt;
  else if (style === "creatif") promptBuilder = buildCreatifPrompt;
  else promptBuilder = buildTemplatePrompt;

  let promptInstructions = promptBuilder(ctx);
  let content = "";
  let scoring: ScoringResult | null = null;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    content = await callLLM(GOD_TIER_SYSTEM, promptInstructions, 0.75, 6000);
    const scoringInstruction = buildScoringPrompt(content, style);
    scoring = await scorePrompt(content, scoringInstruction);

    if (scoring.scoreTotal >= threshold) {
      break;
    }

    if (i < maxIterations - 1 && scoring.weakPoints.length > 0) {
      promptInstructions = buildImprovementPrompt(content, scoring.weakPoints, style, ctx);
    }
  }

  return { content, scoring: scoring!, iterations };
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

  const MAX_ITERATIONS = 3;

  const [expertResult, creatifResult, templateResult] = await Promise.all([
    generateAndScoreVariant(ctx, "expert", MAX_ITERATIONS, scoringThreshold),
    generateAndScoreVariant(ctx, "creatif", MAX_ITERATIONS, scoringThreshold),
    generateAndScoreVariant(ctx, "template", MAX_ITERATIONS, scoringThreshold),
  ]);

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
  const projectId = parseInt(req.params.projectId);
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
  const projectId = parseInt(req.params.projectId);
  const moduleId = parseInt(req.params.moduleId);
  const { submoduleId } = req.params;

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
