import { Link, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { isLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';
import * as Path from 'path';
import * as React from 'react';
import { useHistory } from 'react-router';
import { NewSession, Session, useStudyRecord, SessionClient } from '../core';

export interface Props {
  sessionStore: SessionClient;
}

export function SessionList(props: Props) {
  const { sessionStore } = props;
  const studyRecord = useStudyRecord();
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
    const { id } = await sessionStore.createSession({
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
        id,
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
  const loadSession = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (file == null) return;
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (loadEvent) => {
        try {
          const result = loadEvent.target?.result;
          if (typeof result !== 'string') return null;
          const json = JSON.parse(result);
          const decodeResult = NewSession.decode(json);
          if (isLeft(decodeResult)) {
            console.error(
              'Error parsing file\n',
              PathReporter.report(decodeResult)
            );
            alert(
              'Error parsing file. See developer tools console for details.'
            );
            return;
          }
          sessionStore.createSession(decodeResult.right).then((id) => {
            const newLocation = {
              ...history.location,
              pathname:
                history.location.pathname +
                (history.location.pathname.endsWith('/') ? '' : '/') +
                id,
            };
            history.push(newLocation);
          });
        } catch (error) {
          console.error('Error loading file: ' + error);
          alert('Error loading file. See developer tools console for details.');
        }
      };
    },
    [sessionStore, history]
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
        {
          selectionRequired: false,
          element: (
            <>
              <input
                hidden
                id="upload-file"
                type="file"
                className="btn"
                multiple={false}
                onChange={loadSession}
              />
              <label className="btn" htmlFor="upload-file">
                Upload a session from JSON
              </label>
            </>
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
        {
          key: 'download',
          name: 'Download JSON',
          renderCell: (data: { row: Session }) => (
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data.row, null, 2)
              )}`}
              download={`${data.row.name}.json`}
            >
              Download JSON
            </a>
          ),
        },
      ],
    }),
    [
      sessionList,
      createNewSession,
      deleteSessions,
      loadSession,
      selected,
      history.location.pathname,
    ]
  );
  if (sessionList == null) return null;
  return <Mesa.Mesa state={tableState} />;
}
