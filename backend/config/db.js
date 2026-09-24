// db.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initialWatchlist, initialSettings, initialCases } from "../data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/store.json");

class DataStore {
  constructor() {
    this.data = {
      watchlist: [],
      settings: {},
      cases: [],
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure required collections exist
        if (!this.data.watchlist || !Array.isArray(this.data.watchlist)) this.data.watchlist = [...initialWatchlist];
        if (!this.data.settings) this.data.settings = { ...initialSettings };
        if (!this.data.cases || !Array.isArray(this.data.cases) || this.data.cases.length === 0) {
          this.data.cases = [...initialCases];
        }
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
      settings: { ...initialSettings },
      cases: [...initialCases],
    };
    this.persist();
    console.log("[DataStore] Initialized with clean prototype data");
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
    return list.find((item) => item.id === id);
  }

  getSettings() {
    return this.data.settings || initialSettings;
  }
}

export const db = new DataStore();
