import { createContext, useCallback, useEffect, useState } from 'react';
import { useStateWithHistory, StateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';
import { Session, NewSession } from '../types/session';
import { usePromise } from './usePromise';
import { useNonNullableContext } from './useNonNullableContext';

type Setter<T extends keyof Session> = (value: Session[T]) => void;

export const enum Status {
  InProgress = 'in-progress',
  Loaded = 'loaded',
  NotFound = 'not-found',
  Error = 'error',
}

export type SessionState = {
  status: Status;
  hasUnsavedChanges: boolean;
  history: Omit<StateWithHistory<Session|undefined>, 'setCurrent'>;
  setName: Setter<'name'>;
  setFilters: Setter<'filters'>;
  setVisualizations: Setter<'visualizations'>;
  setDerivedVariables: Setter<'derivedVariables'>;
  setStarredVariables: Setter<'starredVariables'>;
  setVariableUISettings: Setter<'variableUISettings'>;
  copySession: () => Promise<string>;
  deleteSession: () => Promise<void>;
  saveSession: () => Promise<void>;
}

export interface SessionStore {
  getSessions(): Promise<Session[]>;
  createSession(newSession: NewSession): Promise<string>;
  getSession(sessionId: string): Promise<Session>;
  updateSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}

export const SessionListContext = createContext<Session[] | undefined>(undefined);

export function useSessionList() {
  return useNonNullableContext(SessionListContext);
}

export const SessionContext = createContext<SessionState | undefined>(undefined);

export function useSession() {
  return useNonNullableContext(SessionContext);
}

export function useSessionState(sessionId: string, store: SessionStore): SessionState {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const history = useStateWithHistory<Session>({
    size: 10,
    onUndo: useCallback(() => setHasUnsavedChanges(true), [setHasUnsavedChanges]),
    onRedo: useCallback(() => setHasUnsavedChanges(true), [setHasUnsavedChanges])
  });
  const savedSession = usePromise(useCallback((): Promise<Session> => {
    return store.getSession(sessionId);
  }, [sessionId, store]));

  useEffect(() => {
    if (savedSession.value) {
      history.setCurrent(savedSession.value);
    }
  }, [savedSession.value]);

  const status = savedSession.pending ? Status.InProgress
               : savedSession.error   ? Status.Error
               : Status.Loaded;

  const useSetter = <T extends keyof Session>(propertyName: T) => useCallback((value: Session[T]) => {
    history.setCurrent(_a => _a && ({ ..._a, [propertyName]: value }));
    setHasUnsavedChanges(true);
  }, [propertyName]);

  const setName = useSetter('name');
  const setFilters = useSetter('filters');
  const setVisualizations = useSetter('visualizations');
  const setDerivedVariables = useSetter('derivedVariables');
  const setStarredVariables = useSetter('starredVariables');
  const setVariableUISettings = useSetter('variableUISettings');

  const saveSession = useCallback(async () => {
    if (history.current == null) throw new Error("Attempt to save an session that hasn't been loaded.");
    await store.updateSession(history.current);
    setHasUnsavedChanges(false);
  }, [store, history.current])

  const copySession = useCallback(async () => {
    if (history.current == null) throw new Error("Attempt to copy an session that hasn't been loaded.");
    if (hasUnsavedChanges) await saveSession();
    return await store.createSession(history.current);
  }, [store, history.current, saveSession, hasUnsavedChanges]);

  const deleteSession = useCallback(async () => {
    return store.deleteSession(sessionId);
  }, [store, sessionId]);

  return {
    status,
    history,
    hasUnsavedChanges,
    setName,
    setFilters,
    setVisualizations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    copySession,
    deleteSession,
    saveSession
  };
}
