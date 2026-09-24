// routes/index.js
import { Router } from "express";
import screeningRoutes from "./screening.routes.js";
import caseHistoryRoutes from "./caseHistory.routes.js";
import watchlistRoutes from "./watchlist.routes.js";

const apiRouter = Router();

apiRouter.use("/screening", screeningRoutes);
apiRouter.use("/cases", caseHistoryRoutes);
apiRouter.use("/watchlist", watchlistRoutes);

export default apiRouter;
