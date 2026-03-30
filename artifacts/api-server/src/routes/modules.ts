import { Router, type IRouter } from "express";
import { MODULES } from "../data/modules";

const router: IRouter = Router();

router.get("/modules", (_req, res) => {
  res.json(MODULES);
});

export default router;
