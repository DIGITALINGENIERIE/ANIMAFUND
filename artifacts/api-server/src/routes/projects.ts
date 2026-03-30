import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const teamMemberSchema = z.object({
  nom: z.string(),
  role: z.string(),
  bioCourte: z.string().optional().default(""),
});

const createProjectSchema = z.object({
  nom: z.string().min(1),
  logline: z.string().min(1),
  synopsisCourt: z.string().min(1),
  genre: z.enum(["animation_2d", "animation_3d", "jeu_video", "hybride"]),
  cible: z.string().optional().default(""),
  ton: z.array(z.string()).optional().default([]),
  references: z.array(z.string()).optional().default([]),
  equipe: z.array(teamMemberSchema).optional().default([]),
  budgetTotal: z.union([z.number(), z.string()]).transform(Number).optional().default(0),
  montantRecherche: z.union([z.number(), z.string()]).transform(Number).optional().default(0),
  avancement: z.enum(["idee", "ecriture", "concept_art", "prototype", "demo"]).optional().default("idee"),
  societe: z.string().min(1),
  siret: z.string().optional().default(""),
  region: z.string().optional().default(""),
});

router.get("/projects", async (_req: Request, res: Response) => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(projects);
});

router.post("/projects", async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { budgetTotal, montantRecherche, ...rest } = parsed.data;
  const [project] = await db
    .insert(projectsTable)
    .values({
      ...rest,
      budgetTotal: String(budgetTotal),
      montantRecherche: String(montantRecherche),
    })
    .returning();
  res.status(201).json(project);
});

router.get("/projects/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "ID must be a number" });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) {
    res.status(404).json({ error: "not_found", message: "Project not found" });
    return;
  }
  res.json(project);
});

router.put("/projects/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "ID must be a number" });
    return;
  }
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { budgetTotal, montantRecherche, ...rest } = parsed.data;
  const [updated] = await db
    .update(projectsTable)
    .set({ ...rest, budgetTotal: String(budgetTotal), montantRecherche: String(montantRecherche), updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found", message: "Project not found" });
    return;
  }
  res.json(updated);
});

router.delete("/projects/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "invalid_id", message: "ID must be a number" });
    return;
  }
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

export default router;
