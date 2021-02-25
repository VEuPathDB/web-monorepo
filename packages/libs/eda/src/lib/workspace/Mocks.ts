import localforage from 'localforage';
import { Session, NewSession } from '../core';
import { SessionClient } from '../core/api/session-api';

const localStore = localforage.createInstance({
  name: 'mockSessionStore',
});

export const mockSessionStore: SessionClient = {
  async getSessions() {
    const records: Session[] = [];
    await localStore.iterate((value) => {
      records.push(value as Session);
    });
    return records;
  },
  async createSession(newSession: NewSession) {
    const id = String((await localStore.keys()).length + 1);
    const now = new Date().toISOString();
    await localStore.setItem<Session>(id, {
      ...newSession,
      id,
      created: now,
      modified: now,
    });
    return { id };
  },
  async getSession(id: string) {
    const session = await localStore.getItem(id);
    if (session) return session as Session;
    throw new Error(`Could not find session with id "${id}".`);
  },
  async updateSession(session: Session) {
    const now = new Date().toISOString();
    await localStore.setItem(session.id, { ...session, modified: now });
  },
  async deleteSession(id: string) {
    await localStore.removeItem(id);
  },
} as SessionClient;
