// watchlist.controller.js
import { db } from "../config/db.js";
import { AuditService } from "../services/auditService.js";

export const getWatchlist = async (req, res, next) => {
  try {
    const list = db.get("watchlist");
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const searchWatchlist = async (req, res, next) => {
  try {
    const { query, documentNumber, name } = req.body;
    const list = db.get("watchlist");
    const term = (query || documentNumber || name || "").trim().toLowerCase();

    AuditService.log({
      officer: "Alex Singh",
      action: "Watchlist Searched",
      entity: "Watchlist",
      entityId: "QUERY",
      result: `Queried '${term}'`,
    });

    if (!term) {
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    const matches = list.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(term);
      const docMatch = item.documentNumber?.toLowerCase().includes(term);
      const natMatch = item.nationality?.toLowerCase().includes(term);
      const reasonMatch = item.reason?.toLowerCase().includes(term);
      return nameMatch || docMatch || natMatch || reasonMatch;
    });

    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    next(error);
  }
};

export const createWatchlistEntry = async (req, res, next) => {
  try {
    const { name, documentNumber, nationality, reason, riskLevel, source, status } = req.body;
    if (!name || !documentNumber) {
      return res.status(400).json({ success: false, message: "Name and document number are required." });
    }

    const count = db.get("watchlist").length + 1;
    const id = `WL-${String(count).padStart(3, "0")}`;

    const newEntry = {
      id,
      name,
      documentNumber,
      nationality: nationality || "Unknown",
      reason: reason || "Flagged in border advisory",
      status: status || "ACTIVE",
      riskLevel: riskLevel || "HIGH",
      source: source || "Border Security Checkpoint Entry",
      addedDate: new Date().toISOString().split("T")[0],
    };

    db.insert("watchlist", newEntry);

    AuditService.log({
      officer: "Alex Singh",
      action: "Watchlist Entry Created",
      entity: "Watchlist",
      entityId: id,
      result: `Added ${name} (${newEntry.riskLevel})`,
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    next(error);
  }
};

export const deleteWatchlistEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove("watchlist", id);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Entry not found." });
    }

    AuditService.log({
      officer: "Alex Singh",
      action: "Watchlist Entry Removed",
      entity: "Watchlist",
      entityId: id,
      result: "Deleted",
    });

    res.status(200).json({ success: true, message: "Watchlist entry removed successfully." });
  } catch (error) {
    next(error);
  }
};
