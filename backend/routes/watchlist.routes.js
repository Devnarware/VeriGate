// watchlist.routes.js
import { Router } from "express";
import {
  getWatchlist,
  addWatchlistRecord,
  toggleWatchlistStatus,
  deleteWatchlistRecord,
  resetWatchlist,
} from "../controllers/watchlist.controller.js";

const router = Router();

// GET /api/watchlist — list all watchlist records
router.get("/", getWatchlist);

// POST /api/watchlist — add new test watchlist record
router.post("/", addWatchlistRecord);

// PATCH /api/watchlist/:id/toggle — toggle ACTIVE / INACTIVE
router.patch("/:id/toggle", toggleWatchlistStatus);

// DELETE /api/watchlist/:id — remove record
router.delete("/:id", deleteWatchlistRecord);

// POST /api/watchlist/reset — reset to default prototype records
router.post("/reset", resetWatchlist);

export default router;
