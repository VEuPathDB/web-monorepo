import { omit } from 'lodash';
import { act, renderHook } from '@testing-library/react-hooks';
import { useSessionState, Status, SessionStore } from '../../src/hooks/useSession';
import { Session, NewSession } from '../../src/types/session';

let store: SessionStore;

let stubSession: NewSession = {
  name: 'My Session',
  studyId: '123',
  filters: [],
  derivedVariables: [],
  starredVariables: [],
  variableUISettings: {},
  visualizations: [],
}

const key = '123'

beforeEach(() => {
  const records: Record<string, Session> = {
    123: {
      ...stubSession,
      id: key,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
  let nextId = 1;
  store = {
    async getSessions() {
      return Object.values(records);
    },
    async getSession(id: string) {
      if (id in records) return records[id];
      throw new Error("Could not find session for id " + id);
    },
    async createSession(newSession: NewSession) {
      const id = String(nextId++);
      records[id] = {
        ...newSession,
        id,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      return id;
    },
    async updateSession(session: Session) {
      records[session.id] = session;
    },
    async deleteSession(id: string) {
      delete records[id];
    }
  }
})

describe('useSession', () => {

  it('should have the correct status on success path', async () => {
    const { result, waitForValueToChange } = renderHook(() => useSessionState(key, store));
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Loaded);
  });

  it('should have the correct status on failure path', async () => {
    const { result, waitForValueToChange } = renderHook(() => useSessionState(key, store));
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Error);
  });

  it('should load an session', async () => {
    const { result, waitFor } = renderHook(() => useSessionState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    expect(result.current.history.current).toBeDefined();
    expect(result.current.history.current?.name).toBe('My Session');
  });

  it('should allow updates', async () => {
    const { result, waitFor } = renderHook(() => useSessionState(key, store));
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.history.current?.name).toBe('New Name');
  });

  it('should update store on save', async () => {
    const { result, waitFor } = renderHook(() => useSessionState(key, store));
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => result.current.setName('New Name'));
    expect(result.current.hasUnsavedChanges).toBeTruthy();
    await act(() => result.current.saveSession());
    const sessions = await store.getSessions();
    const session = sessions.find(session => session.id === key);
    expect(session?.name).toBe('New Name');
    expect(result.current.hasUnsavedChanges).toBeFalsy();
  });

  it('should update store on copy', async () => {
    const { result, waitFor } = renderHook(() => useSessionState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    const newId = await result.current.copySession();
    const sessions = await store.getSessions();
    const newSession = sessions.find(session => session.id === newId);
    expect(omit(result.current.history.current, 'id')).toEqual(omit(newSession, 'id'));
    expect(result.current.history.current).not.toBe(newSession);
  });

  it('should update store on delete', async () => {
    const { result, waitFor } = renderHook(() => useSessionState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    await result.current.deleteSession();
    const sessions = await store.getSessions();
    const session = sessions.find(session => session.id === key);
    expect(session).toBeUndefined();
  });

});
