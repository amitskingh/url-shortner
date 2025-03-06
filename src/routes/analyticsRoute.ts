import { getAnalytics } from "../controllers/analyticsController";

import { Router } from "express";

const router = Router();

router.get("/:aliasId", getAnalytics);

export default router;
