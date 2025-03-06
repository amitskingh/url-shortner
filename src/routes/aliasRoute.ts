import { Router } from "express";
import {
  createAlias,
  fetchAllAlias,
  redirectAlias,
} from "../controllers/aliasController";

const router = Router();

router.get("/", fetchAllAlias);

router.post("/short", createAlias);

router.get("/:shortURL", redirectAlias);

export = router;
