// routes/index.js
import { Router } from "express";
import screeningRoutes from "./screening.routes.js";

const apiRouter = Router();

apiRouter.use("/screening", screeningRoutes);

export default apiRouter;
