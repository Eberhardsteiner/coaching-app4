import Dexie, { type Table } from "dexie";

import { STORAGE_PREFIX } from "@/config/constants";
import type { Session } from "@/features/session/types";

/** Generic key/value row for small app-level state (e.g. lastActiveSessionId). */
export interface KvRow {
  key: string;
  value: unknown;
}

/**
 * Local IndexedDB (no backend). The full Session is stored under its nested
 * primary key `meta.id`; `meta.updatedAt` is indexed so sessions can be listed
 * newest-first. A tiny `kv` table holds app-level flags.
 */
class AppDatabase extends Dexie {
  // `!` — Dexie assigns these in version().stores().
  sessions!: Table<Session, string>;
  kv!: Table<KvRow, string>;

  constructor() {
    super(STORAGE_PREFIX);
    this.version(1).stores({
      sessions: "meta.id, meta.updatedAt, meta.branch",
      kv: "key",
    });
  }
}

/** Singleton database instance. */
export const db = new AppDatabase();
