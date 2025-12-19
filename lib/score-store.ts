// import Database from 'better-sqlite3'; // Uncomment for persistent storage in Node/Docker
// import path from 'path';
// import fs from 'fs';

export interface ScoreEntry {
    id?: number;
    user: string;
    metric: string;
    value: number;
    timestamp: number;
}

/**
 * In-Memory fallback store.
 * NOTE: For persistent SQLite storage, uncomment the imports above and the Database logic below.
 * This version is safe for Cloudflare Pages/Edge and environments without native build tools.
 */
export class ScoreStore {
    // private db: Database.Database | null = null;
    private memoryStore: ScoreEntry[] = [];

    constructor() {
        // try {
        //   const DB_PATH = path.resolve(process.cwd(), 'data', 'score.db');
        //   this.db = new Database(DB_PATH);
        //   this.init();
        // } catch (e) {
        //   console.warn("Using in-memory store (SQLite not available)");
        // }
    }

    private init() {
        // if (!this.db) return;
        // this.db.prepare(`...`).run();
    }

    add(entry: ScoreEntry) {
        // In-memory fallback
        const newEntry = { ...entry, id: this.memoryStore.length + 1 };
        this.memoryStore.push(newEntry);

        // if (this.db) { ... }
    }

    getAll() {
        // if (this.db) return this.db.prepare(...).all();
        return [...this.memoryStore].sort((a, b) => b.timestamp - a.timestamp);
    }

    getByUser(user: string) {
        // if (this.db) return this.db.prepare(...).all(user);
        return this.memoryStore
            .filter(s => s.user === user)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
}

export const scoreStore = new ScoreStore();
