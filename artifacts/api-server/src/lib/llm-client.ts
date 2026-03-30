import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-5",
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from LLM");
      }
      return content.text;
    } catch (error) {
      logger.warn({ error, attempt }, `LLM call failed (attempt ${attempt}/${MAX_RETRIES})`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        throw error;
      }
    }
  }
  throw new Error("LLM call failed after max retries");
}

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

  const rawResponse = await callLLM(systemPrompt, scoringPrompt, 0.3, 1024);

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in scoring response");
    }
    const parsed = JSON.parse(jsonMatch[0]) as ScoringResult;
    if (typeof parsed.scoreTotal !== "number") {
      throw new Error("Invalid scoring response structure");
    }
    const score = parsed.scoreTotal;
    if (score >= 95) parsed.mention = "god_tier";
    else if (score >= 85) parsed.mention = "excellent";
    else if (score >= 70) parsed.mention = "bon";
    else parsed.mention = "insuffisant";
    return parsed;
  } catch (error) {
    logger.warn({ error, rawResponse }, "Failed to parse scoring response, using fallback");
    return {
      scoreTotal: 72,
      completude: 14,
      specificite: 14,
      precisionReglementaire: 11,
      clartéStructure: 11,
      fewShotQuality: 7,
      controleQualite: 7,
      adaptationPlateforme: 8,
      weakPoints: ["Impossible d'évaluer précisément — scoring de fallback appliqué"],
      mention: "bon",
    };
  }
}
