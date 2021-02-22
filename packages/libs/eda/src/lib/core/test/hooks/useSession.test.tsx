import { omit } from 'lodash';
import { act, renderHook } from '@testing-library/react-hooks';
import { useSession, Status } from '../../src/hooks/session';
import { Session, NewSession } from '../../src/types/session';
import { SessionClient } from '../../src/api/session-api';
import { StudyMetadata, StudyRecord, StudyRecordClass, WorkspaceContext } from '../../src';
import { SubsettingClient } from '../../src/api/eda-api';

const stubSession: NewSession = {
  name: 'My Session',
  studyId: '123',
  filters: [],
  derivedVariables: [],
  starredVariables: [],
  variableUISettings: {},
  visualizations: [],
}

const key = '123'

let records: Record<string, Session>;
let nextId: number;

const sessionClient: SessionClient = {
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
    return { id };
  },
  async updateSession(session: Session) {
    records[session.id] = session;
  },
  async deleteSession(id: string) {
    delete records[id];
  }
} as SessionClient;


const wrapper: React.ComponentType = ({ children }) => (
  <WorkspaceContext.Provider value={{
    sessionClient,
    studyMetadata: {} as StudyMetadata,
    studyRecord: {} as StudyRecord,
    studyRecordClass: {} as StudyRecordClass,
    subsettingClient: {} as SubsettingClient
  }}>
    {children}
  </WorkspaceContext.Provider>
)

beforeEach(() => {
  records = {
    123: {
      ...stubSession,
      id: key,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
  nextId = 1;  
});

const render = () => renderHook(() => useSession(key), { wrapper });

describe('useSession', () => {

  it('should have the correct status on success path', async () => {
    const { result, waitForValueToChange } = render();
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Loaded);
  });

  it('should have the correct status on failure path', async () => {
    const { result, waitForValueToChange } = render();
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Error);
  });

  it('should load an session', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    expect(result.current.session).toBeDefined();
    expect(result.current.session?.name).toBe('My Session');
  });

  it('should allow updates', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.session?.name).toBe('New Name');
  });

  it('should update store on save', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => result.current.setName('New Name'));
    expect(result.current.hasUnsavedChanges).toBeTruthy();
    await act(() => result.current.saveSession());
    const sessions = await sessionClient.getSessions();
    const session = sessions.find(session => session.id === key);
    expect(session?.name).toBe('New Name');
    expect(result.current.hasUnsavedChanges).toBeFalsy();
  });

  it('should update store on copy', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    const res = await result.current.copySession();
    const sessions = await sessionClient.getSessions();
    const newSession = sessions.find(session => session.id === res.id);
    expect(omit(result.current.session, 'id')).toEqual(omit(newSession, 'id'));
    expect(result.current.session).not.toBe(newSession);
  });

  it('should update store on delete', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    await result.current.deleteSession();
    const sessions = await sessionClient.getSessions();
    const session = sessions.find(session => session.id === key);
    expect(session).toBeUndefined();
  });

});
