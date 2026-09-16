// alert.routes.js
import { Router } from "express";
import { getAlerts, updateAlert } from "../controllers/alert.controller.js";

const router = Router();

router.get("/", getAlerts);
router.patch("/:id", updateAlert);

export default router;
