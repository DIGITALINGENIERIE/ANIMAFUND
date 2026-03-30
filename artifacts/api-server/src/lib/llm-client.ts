import Cerebras from "@cerebras/cerebras_cloud_sdk";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { logger } from "./logger";

// ─── Clients ──────────────────────────────────────────────────────────────────

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY ?? "",
});

const anthropic = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    })
  : null;

const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

// ─── Modèles ──────────────────────────────────────────────────────────────────

const CEREBRAS_MODEL = "qwen-3-235b-a22b-instruct-2507";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const GPT_MODEL = "gpt-5.2";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Génération initiale via Cerebras (ultra-rapide) ─────────────────────────

export async function callGenerationLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await cerebras.chat.completions.create({
        model: CEREBRAS_MODEL,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Réponse vide de Cerebras");
      logger.info({ model: CEREBRAS_MODEL, tokens: response.usage?.total_tokens }, "Cerebras — génération OK");
      return content;
    } catch (error) {
      logger.warn({ error, attempt }, `Cerebras échoué (tentative ${attempt}/${MAX_RETRIES})`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Cerebras — nombre max de tentatives atteint");
}

// ─── Amélioration via Claude > GPT > Cerebras ────────────────────────────────

export async function callImprovementLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 6000
): Promise<string> {
  // 1. Préférence : Claude (Anthropic)
  if (anthropic) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const content = response.content[0];
        if (content.type !== "text") throw new Error("Type de réponse Claude inattendu");
        logger.info({ model: CLAUDE_MODEL }, "Claude — amélioration OK");
        return content.text;
      } catch (error) {
        logger.warn({ error, attempt }, `Claude échoué (tentative ${attempt}/${MAX_RETRIES})`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // 2. Fallback : GPT-4o (OpenAI)
  if (openai) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: GPT_MODEL,
          max_tokens: maxTokens,
          temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Réponse GPT vide");
        logger.info({ model: GPT_MODEL }, "GPT — amélioration OK");
        return content;
      } catch (error) {
        logger.warn({ error, attempt }, `GPT échoué (tentative ${attempt}/${MAX_RETRIES})`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // 3. Fallback ultime : Cerebras
  logger.info("Aucun Claude/GPT disponible — Cerebras utilisé pour l'amélioration");
  return callGenerationLLM(systemPrompt, userPrompt, temperature, maxTokens);
}

// ─── Alias rétrocompatible ────────────────────────────────────────────────────

export const callLLM = callGenerationLLM;

// ─── Scoring via Cerebras (rapide et précis) ──────────────────────────────────

export interface ScoringResult {
  scoreTotal: number;
  completude: number;
  specificite: number;
  precisionReglementaire: number;
  clartéStructure: number;
  fewShotQuality: number;
  controleQualite: number;
  adaptationPlateforme: number;
  weakPoints: string[];
  mention: "insuffisant" | "bon" | "excellent" | "god_tier";
}

export async function scorePrompt(promptText: string, scoringPrompt: string): Promise<ScoringResult> {
  const systemPrompt = `Tu es un expert en évaluation de qualité de prompts IA pour l'industrie créative. 
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires, sans texte avant ou après.`;

  const rawResponse = await callGenerationLLM(systemPrompt, scoringPrompt, 0.2, 1024);

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Aucun JSON trouvé dans la réponse de scoring");

    const parsed = JSON.parse(jsonMatch[0]) as ScoringResult;
    if (typeof parsed.scoreTotal !== "number") throw new Error("Structure de scoring invalide");

    const score = parsed.scoreTotal;
    if (score >= 95) parsed.mention = "god_tier";
    else if (score >= 85) parsed.mention = "excellent";
    else if (score >= 70) parsed.mention = "bon";
    else parsed.mention = "insuffisant";

    return parsed;
  } catch (error) {
    logger.warn({ error, rawResponse }, "Parsing scoring échoué — fallback appliqué");
    return {
      scoreTotal: 72,
      completude: 14,
      specificite: 14,
      precisionReglementaire: 11,
      clartéStructure: 11,
      fewShotQuality: 7,
      controleQualite: 7,
      adaptationPlateforme: 8,
      weakPoints: ["Scoring automatique indisponible — valeur de fallback appliquée"],
      mention: "bon",
    };
  }
}
