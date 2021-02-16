import * as Path from 'path';
import * as React from 'react';
import { useHistory } from 'react-router';
import { Session, SessionStore, useStudy } from '@veupathdb/eda-workspace-core';
import { Link, Mesa } from '@veupathdb/wdk-client/lib/Components';

export interface Props {
  sessionStore: SessionStore;
}

export function SessionList(props: Props) {
  const { sessionStore } = props;
  const { studyRecord } = useStudy();
  const studyId = studyRecord.id.map((part) => part.value).join('/');
  const [sessionList, setSessionList] = React.useState<Session[]>();
  const history = useHistory();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const updateSessionList = React.useCallback(async () => {
    const list = await sessionStore.getSessions();
    setSessionList(list.filter((a) => a.studyId === studyId));
  }, [sessionStore, studyId]);
  React.useEffect(() => {
    updateSessionList();
  }, [updateSessionList]);
  const createNewSession = React.useCallback(async () => {
    const newId = await sessionStore.createSession({
      name: 'Unnamed Session',
      studyId,
      filters: [],
      starredVariables: [],
      derivedVariables: [],
      visualizations: [],
      variableUISettings: {},
    });
    const newLocation = {
      ...history.location,
      pathname:
        history.location.pathname +
        (history.location.pathname.endsWith('/') ? '' : '/') +
        newId,
    };
    history.push(newLocation);
  }, [sessionStore, history, studyId]);
  const deleteSessions = React.useCallback(
    (sessionIds: Iterable<string>) => {
      for (const sessionId of sessionIds) sessionStore.deleteSession(sessionId);
      updateSessionList();
    },
    [sessionStore, updateSessionList]
  );
  const tableState = React.useMemo(
    () => ({
      options: {
        isRowSelected: (session: Session) => selected.has(session.id),
      },
      eventHandlers: {
        onRowSelect: (session: Session) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.add(session.id);
            return newSet;
          }),
        onRowDeselect: (session: Session) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.delete(session.id);
            return newSet;
          }),
        onMultipleRowSelect: (sessions: Session[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const session of sessions) newSet.add(session.id);
            return newSet;
          }),
        onMultipleRowDeselect: (sessions: Session[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const session of sessions) newSet.delete(session.id);
            return newSet;
          }),
      },
      actions: [
        {
          selectionRequired: true,
          element: (
            <button
              type="button"
              className="btn"
              onClick={() => deleteSessions(selected)}
            >
              Delete selected sessions
            </button>
          ),
        },
        {
          selectionRequired: false,
          element: (
            <button type="button" className="btn" onClick={createNewSession}>
              Start a new session
            </button>
          ),
        },
      ],
      rows: sessionList,
      columns: [
        {
          key: 'name',
          name: 'Name',
          renderCell: (data: { row: Session }) => (
            <Link to={Path.join(history.location.pathname, data.row.id)}>
              {data.row.name}
            </Link>
          ),
        },
        { key: 'created', name: 'Created' },
        { key: 'modified', name: 'Modified' },
      ],
    }),
    [
      sessionList,
      createNewSession,
      deleteSessions,
      selected,
      history.location.pathname,
    ]
  );
  if (sessionList == null) return null;
  return <Mesa.Mesa state={tableState} />;
}
