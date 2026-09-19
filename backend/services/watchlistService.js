// watchlistService.js
// Prototype watchlist screening against local database entries
// NOTE: This checks against a LOCAL prototype database only.
// It is NOT connected to any authoritative source (Interpol, government, etc.)
import { db } from "../config/db.js";

export class WatchlistService {
  /**
   * Search prototype watchlist for subject attributes
   * @param {string|null} personName
   * @param {string|null} documentNumber
   * @param {string|null} nationality
   */
  static check(personName = null, documentNumber = null, nationality = null) {
    const watchlist = db.get("watchlist");

    if (!personName && !documentNumber) {
      return {
        matched: false,
        matchCount: 0,
        matchedField: null,
        recordIdentifier: null,
        alertType: null,
        matchReason: null,
        status: "UNAVAILABLE",
        matchDetails: null,
        summary: "Identity attributes unextracted; watchlist queries unavailable.",
      };
    }

    const normName = (personName || "").trim().toLowerCase().replace(/[^a-z\s]/g, "");
    const normDoc = (documentNumber || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    const inputTokens = normName.split(/\s+/).filter((t) => t.length >= 3);

    const hits = [];

    for (const item of watchlist) {
      // Invariant: Inactive records must never match
      if (item.status !== "ACTIVE") continue;

      const itemName = (item.name || "").toLowerCase().replace(/[^a-z\s]/g, "");
      const itemDoc = (item.documentNumber || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const itemTokens = itemName.split(/\s+/).filter((t) => t.length >= 3);

      // 1. Exact document number match (Highest fidelity)
      const docMatch = normDoc.length >= 6 && itemDoc.length >= 6 && itemDoc === normDoc;

      // 2. Exact or multi-token biographic name match
      let nameMatch = false;
      let matchType = null;

      if (docMatch) {
        matchType = "documentNumber";
      } else if (normName.length >= 5 && itemName === normName) {
        nameMatch = true;
        matchType = "fullName";
      } else if (inputTokens.length >= 2 && itemTokens.length >= 2) {
        // Require at least 2 distinct significant tokens to match (prevents single-token false positives)
        const commonTokens = inputTokens.filter((t) => itemTokens.includes(t));
        if (commonTokens.length >= 2) {
          nameMatch = true;
          matchType = "fullName";
        }
      }

      if (docMatch || nameMatch) {
        hits.push({
          item,
          matchedField: matchType,
        });
      }
    }

    if (hits.length > 0) {
      const primary = hits[0];
      const primaryHit = primary.item;
      return {
        matched: true,
        matchCount: hits.length,
        matchedField: primary.matchedField,
        recordIdentifier: primaryHit.id,
        alertType: primaryHit.source,
        matchReason: primaryHit.reason,
        status: "ALERT",
        matchDetails: primaryHit,
        matchType: primary.matchedField === "documentNumber"
          ? "Exact Document Number Match"
          : "Biographic Name Match",
        summary: `MATCH: Flagged in prototype watchlist under ${primaryHit.source} (${primaryHit.reason})`,
      };
    }

    return {
      matched: false,
      matchCount: 0,
      matchedField: null,
      recordIdentifier: null,
      alertType: null,
      matchReason: null,
      status: "CLEAR",
      matchDetails: null,
      summary: "No matches found in local prototype watchlist database.",
    };
  }
}
