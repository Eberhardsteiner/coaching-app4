/**
 * Persistence layer for sessions — thin async wrappers around Dexie.
 * No React here; the store (sessionStore.ts) calls into this.
 */

import { db } from "@/lib/db";
import {
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

/** Load a single session by id. */
export async function getSession(id: string): Promise<Session | undefined> {
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
