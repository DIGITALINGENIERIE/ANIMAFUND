import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import promptsRouter from "./prompts";
import modulesRouter from "./modules";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(promptsRouter);
router.use(modulesRouter);

export default router;
