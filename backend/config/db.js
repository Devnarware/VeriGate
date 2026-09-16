import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  initialWatchlist,
  initialScreenings,
  initialCases,
  initialAlerts,
  initialAuditLogs,
  initialSettings,
} from "../data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/store.json");

class DataStore {
  constructor() {
    this.data = {
      watchlist: [],
      screenings: [],
      cases: [],
      alerts: [],
      auditLogs: [],
      settings: {},
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.data = JSON.parse(raw);
        console.log("[DataStore] Loaded existing data from store.json");
      } else {
        this.seed();
      }
    } catch (err) {
      console.warn("[DataStore] Could not read store.json, seeding defaults:", err.message);
      this.seed();
    }
  }

  seed() {
    this.data = {
      watchlist: [...initialWatchlist],
      screenings: [...initialScreenings],
      cases: [...initialCases],
      alerts: [...initialAlerts],
      auditLogs: [...initialAuditLogs],
      settings: { ...initialSettings },
    };
    this.persist();
    console.log("[DataStore] Initialized with seed data");
  }

  persist() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DataStore] Error saving store.json:", err.message);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    const list = this.get(collection);
    return list.find((item) => item.id === id || item.verificationId === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].unshift(item);
    this.persist();
    return item;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(
      (item) => item.id === id || item.verificationId === id
    );
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.persist();
    return this.data[collection][index];
  }

  remove(collection, id) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(
      (item) => item.id !== id && item.verificationId !== id
    );
    if (this.data[collection].length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  getSettings() {
    return this.data.settings || initialSettings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.persist();
    return this.data.settings;
  }
}

export const db = new DataStore();
