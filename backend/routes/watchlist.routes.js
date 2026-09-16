// watchlist.routes.js
import { Router } from "express";
import {
  getWatchlist,
  searchWatchlist,
  createWatchlistEntry,
  deleteWatchlistEntry,
} from "../controllers/watchlist.controller.js";

const router = Router();

router.get("/", getWatchlist);
router.post("/search", searchWatchlist);
router.post("/", createWatchlistEntry);
router.delete("/:id", deleteWatchlistEntry);

export default router;
