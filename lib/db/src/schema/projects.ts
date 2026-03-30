import { pgTable, serial, text, numeric, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  logline: text("logline").notNull(),
  synopsisCourt: text("synopsis_court").notNull(),
  genre: text("genre").notNull(),
  cible: text("cible").notNull().default(""),
  ton: json("ton").$type<string[]>().notNull().default([]),
  references: json("references").$type<string[]>().notNull().default([]),
  equipe: json("equipe").$type<Array<{ nom: string; role: string; bioCourte: string }>>().notNull().default([]),
  budgetTotal: numeric("budget_total", { precision: 12, scale: 2 }).notNull().default("0"),
  montantRecherche: numeric("montant_recherche", { precision: 12, scale: 2 }).notNull().default("0"),
  avancement: text("avancement").notNull().default("idee"),
  societe: text("societe").notNull(),
  siret: text("siret").notNull().default(""),
  region: text("region").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
