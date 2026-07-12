/**
 * Persistence layer for sessions — thin async wrappers around Dexie.
 * No React here; the store (sessionStore.ts) calls into this.
 */

import { db } from "@/lib/db";
import { ensureUniqueIds, normalizeClusters } from "@/features/cards/clusters";
import { migrateSession } from "@/features/session/migrations";
import {
  CURRENT_SCHEMA_VERSION,
  createEmptySession,
  type Branch,
  type Persona,
  type Session,
} from "@/features/session/types";

const LAST_ACTIVE_KEY = "lastActiveSessionId";

/** Create a fresh session for a branch and persist it. */
export async function createSession(
  branch: Branch,
  persona?: Persona,
): Promise<Session> {
  const session = createEmptySession(branch, persona);
  await db.sessions.put(session);
  return session;
}

/**
 * Load a single session by id. If it predates the current schema, migrate it
 * (e.g. add `progress`) and persist the upgrade so local data stays consistent.
 * Independently of the schema version, heal any legacy Phase-1 cards or clusters
 * that lack a stable, unique id: a missing/duplicate id collapses identity, so an
 * id-scoped update (assign/rename) leaks onto every item sharing the id, and
 * duplicate React keys can crash the board (see ensureUniqueIds). Corrupt data
 * can sit in already-current sessions, so this runs every load, not only on a
 * version upgrade; it persists once when something actually changed.
 */
export async function getSession(id: string): Promise<Session | undefined> {
  const raw = await db.sessions.get(id);
  if (!raw) return undefined;

  let session: Session = raw;
  let dirty = false;

  if (session.meta.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrated = migrateSession(session, session.meta.schemaVersion);
    session = {
      ...migrated,
      meta: { ...migrated.meta, schemaVersion: CURRENT_SCHEMA_VERSION },
    };
    dirty = true;
  }

  const healedCards = ensureUniqueIds(session.phase1.cards);
  const healedClusters = ensureUniqueIds(session.phase1.clusters);
  if (
    healedCards !== session.phase1.cards ||
    healedClusters !== session.phase1.clusters
  ) {
    session = {
      ...session,
      phase1: {
        ...session.phase1,
        cards: healedCards,
        // Re-derive cardIds/isCore from the healed ids so the persisted
        // membership stays consistent after a re-mint.
        clusters: normalizeClusters(healedCards, healedClusters),
      },
    };
    dirty = true;
  }

  if (dirty) await db.sessions.put(session);
  return session;
}

/**
 * Read a session WITHOUT migrating or persisting — strictly read-only. Used by
 * the presenter stage window, which must never write to Dexie. (Active sessions
 * are already at the current schema, having been migrated on load in the main
 * window.)
 */
export async function peekSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

/** All sessions, newest-first (by meta.updatedAt). */
export async function listSessions(): Promise<Session[]> {
  return db.sessions.orderBy("meta.updatedAt").reverse().toArray();
}

/** Persist a session, stamping a fresh meta.updatedAt. Returns the saved copy. */
export async function saveSession(session: Session): Promise<Session> {
  const next: Session = {
    ...session,
    meta: { ...session.meta, updatedAt: new Date().toISOString() },
  };
  await db.sessions.put(next);
  return next;
}

/** Delete a session by id. */
export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

/**
 * Delete a session AND clean up the last-active pointer when it referenced it
 * (extracted from the SessionsPage flow, MP5): a deleted session must never be
 * resumed — no orphan pointer state. Callers still clear their in-memory store
 * themselves (clearActive) when the deleted session is the active one.
 */
export async function deleteSessionAndPointer(id: string): Promise<void> {
  await db.sessions.delete(id);
  if ((await getLastActiveId()) === id) {
    await clearLastActiveId();
  }
}

/**
 * Delete ALL local app data (MP5, "Alle lokalen Daten löschen"): every session
 * plus every kv flag (last-active pointer, consent/intro/tour/phase-start
 * flags). The notebook lives inside the sessions and goes with them. After
 * this the app starts in its pristine first-run state.
 */
export async function deleteAllData(): Promise<void> {
  await Promise.all([db.sessions.clear(), db.kv.clear()]);
}

/**
 * Switch a session's branch (coach ↔ coachee). This is a view/role change only
 * — it never migrates data or touches the schema. No-op if the session is gone.
 */
export async function setSessionBranch(
  id: string,
  branch: Branch,
): Promise<void> {
  const existing = await db.sessions.get(id);
  if (!existing) return;
  await db.sessions.put({
    ...existing,
    meta: { ...existing.meta, branch },
  });
}

/** Id of the most recently active session, if any. */
export async function getLastActiveId(): Promise<string | null> {
  const row = await db.kv.get(LAST_ACTIVE_KEY);
  return typeof row?.value === "string" ? row.value : null;
}

/** Remember the most recently active session. */
export async function setLastActiveId(id: string): Promise<void> {
  await db.kv.put({ key: LAST_ACTIVE_KEY, value: id });
}

/** Forget the most recently active session (e.g. after deleting it). */
export async function clearLastActiveId(): Promise<void> {
  await db.kv.delete(LAST_ACTIVE_KEY);
}

/** Read a boolean flag from the kv table (false when unset). */
export async function getKvFlag(key: string): Promise<boolean> {
  const row = await db.kv.get(key);
  return row?.value === true;
}

/** Write a boolean flag to the kv table. */
export async function setKvFlag(key: string, value: boolean): Promise<void> {
  await db.kv.put({ key, value });
}
