// watchlist.controller.js
import { db } from "../config/db.js";
import { initialWatchlist } from "../data/seedData.js";

export const getWatchlist = (req, res) => {
  try {
    const list = db.get("watchlist") || [];
    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
      schemaInfo: {
        standard: "Modeled after ICAO Doc 9303 & Interpol SLTD (Stolen & Lost Travel Documents)",
        localFixture: true,
        notice: "Simulated prototype database for offline demonstration.",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve watchlist: " + err.message,
    });
  }
};

export const addWatchlistRecord = (req, res) => {
  try {
    const { name, documentNumber, nationality, reason, riskLevel, source } = req.body;

    if (!name && !documentNumber) {
      return res.status(400).json({
        success: false,
        message: "At least a Name or Document Number must be provided to create a watchlist entry.",
      });
    }

    const newRecord = {
      id: `WL-${Date.now().toString().slice(-4)}`,
      name: (name || "").trim(),
      documentNumber: (documentNumber || "").trim().toUpperCase(),
      nationality: (nationality || "Unknown").trim(),
      reason: (reason || "Prototype Test Entry: Flagged Identity").trim(),
      status: "ACTIVE",
      riskLevel: (riskLevel || "HIGH").toUpperCase(),
      source: (source || "Interpol SLTD Mock").trim(),
      addedDate: new Date().toISOString().split("T")[0],
    };

    if (!db.data.watchlist) {
      db.data.watchlist = [];
    }

    db.data.watchlist.unshift(newRecord);
    db.persist();

    res.status(201).json({
      success: true,
      message: "Watchlist entry created successfully",
      data: newRecord,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create watchlist record: " + err.message,
    });
  }
};

export const toggleWatchlistStatus = (req, res) => {
  try {
    const { id } = req.params;
    const list = db.data.watchlist || [];
    const item = list.find((w) => w.id === id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Watchlist record ${id} not found`,
      });
    }

    item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    db.persist();

    res.status(200).json({
      success: true,
      message: `Watchlist record ${id} status updated to ${item.status}`,
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update status: " + err.message,
    });
  }
};

export const deleteWatchlistRecord = (req, res) => {
  try {
    const { id } = req.params;
    const list = db.data.watchlist || [];
    const index = list.findIndex((w) => w.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Watchlist record ${id} not found`,
      });
    }

    const removed = list.splice(index, 1)[0];
    db.persist();

    res.status(200).json({
      success: true,
      message: `Watchlist record ${id} removed`,
      data: removed,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete record: " + err.message,
    });
  }
};

export const resetWatchlist = (req, res) => {
  try {
    db.data.watchlist = [...initialWatchlist];
    db.persist();

    res.status(200).json({
      success: true,
      message: "Watchlist reset to initial default entries",
      data: db.data.watchlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reset watchlist: " + err.message,
    });
  }
};
