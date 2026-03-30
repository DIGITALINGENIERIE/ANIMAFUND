import { pgTable, serial, integer, text, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const generatedPromptsTable = pgTable("generated_prompts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull(),
  submoduleId: text("submodule_id").notNull(),
  moduleName: text("module_name").notNull(),
  submoduleName: text("submodule_name").notNull(),
  targetPlatform: text("target_platform").notNull().default("claude"),
  finalScore: integer("final_score").notNull().default(0),
  mention: text("mention").notNull().default("insuffisant"),
  iterations: integer("iterations").notNull().default(1),
  variants: json("variants").$type<Array<{
    style: string;
    content: string;
    scoring: {
      scoreTotal: number;
      completude?: number;
      specificite?: number;
      precisionReglementaire?: number;
      clartéStructure?: number;
      fewShotQuality?: number;
      controleQualite?: number;
      adaptationPlateforme?: number;
      weakPoints?: string[];
      mention: string;
    };
  }>>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGeneratedPromptSchema = createInsertSchema(generatedPromptsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGeneratedPrompt = z.infer<typeof insertGeneratedPromptSchema>;
export type GeneratedPrompt = typeof generatedPromptsTable.$inferSelect;
