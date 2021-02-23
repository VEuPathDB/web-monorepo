import { useStateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';
import { useCallback, useEffect, useState } from 'react';
import { useSessionClient } from './workspace';
import { Session } from '../types/session';
import { usePromise } from './promise';

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
  session?: Session;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setName: Setter<'name'>;
  setFilters: Setter<'filters'>;
  setVisualizations: Setter<'visualizations'>;
  setDerivedVariables: Setter<'derivedVariables'>;
  setStarredVariables: Setter<'starredVariables'>;
  setVariableUISettings: Setter<'variableUISettings'>;
  copySession: () => Promise<{ id: string }>;
  deleteSession: () => Promise<void>;
  saveSession: () => Promise<void>;
};

export function useSession(sessionId: string): SessionState {
  const sessionClient = useSessionClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {
    current: session,
    setCurrent,
    canRedo,
    canUndo,
    redo,
    undo,
  } = useStateWithHistory<Session>({
    size: 10,
    onUndo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
    onRedo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
  });
  const savedSession = usePromise(
    useCallback((): Promise<Session> => {
      return sessionClient.getSession(sessionId);
    }, [sessionId, sessionClient])
  );

  useEffect(() => {
    if (savedSession.value) {
      setCurrent(savedSession.value);
    }
  }, [savedSession.value, setCurrent]);

  const status = savedSession.pending
    ? Status.InProgress
    : savedSession.error
    ? Status.Error
    : Status.Loaded;

  const useSetter = <T extends keyof Session>(propertyName: T) =>
    useCallback(
      (value: Session[T]) => {
        setCurrent((_a) => _a && { ..._a, [propertyName]: value });
        setHasUnsavedChanges(true);
      },
      [propertyName]
    );

  const setName = useSetter('name');
  const setFilters = useSetter('filters');
  const setVisualizations = useSetter('visualizations');
  const setDerivedVariables = useSetter('derivedVariables');
  const setStarredVariables = useSetter('starredVariables');
  const setVariableUISettings = useSetter('variableUISettings');

  const saveSession = useCallback(async () => {
    if (session == null)
      throw new Error("Attempt to save an session that hasn't been loaded.");
    await sessionClient.updateSession(session);
    setHasUnsavedChanges(false);
  }, [sessionClient, session]);

  const copySession = useCallback(async () => {
    if (session == null)
      throw new Error("Attempt to copy an session that hasn't been loaded.");
    if (hasUnsavedChanges) await saveSession();
    return await sessionClient.createSession(session);
  }, [sessionClient, session, saveSession, hasUnsavedChanges]);

  const deleteSession = useCallback(async () => {
    return sessionClient.deleteSession(sessionId);
  }, [sessionClient, sessionId]);

  return {
    status,
    session,
    canRedo,
    canUndo,
    hasUnsavedChanges,
    redo,
    undo,
    setName,
    setFilters,
    setVisualizations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    copySession,
    deleteSession,
    saveSession,
  };
}
