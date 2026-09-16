// routes/index.js
import { Router } from "express";
import screeningRoutes from "./screening.routes.js";
import caseRoutes from "./case.routes.js";
import alertRoutes from "./alert.routes.js";
import watchlistRoutes from "./watchlist.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import reportRoutes from "./report.routes.js";
import auditRoutes from "./audit.routes.js";
import settingsRoutes from "./settings.routes.js";

const apiRouter = Router();

apiRouter.use("/screening", screeningRoutes);
apiRouter.use("/cases", caseRoutes);
apiRouter.use("/alerts", alertRoutes);
apiRouter.use("/watchlist", watchlistRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/reports", reportRoutes);
apiRouter.use("/audit", auditRoutes);
apiRouter.use("/settings", settingsRoutes);

export default apiRouter;
