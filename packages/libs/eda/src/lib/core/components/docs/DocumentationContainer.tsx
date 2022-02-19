import { Modal, Close } from '@veupathdb/core-components';
import { Launch } from '@material-ui/icons';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import React, { useState, PropsWithChildren, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { Documentation } from './Documentation';

interface DocumentContextValue {
  setActiveDocument(name?: string): void;
}
const DocumentationContext = React.createContext<DocumentContextValue | null>(
  null
);

export function useActiveDocument() {
  return useNonNullableContext(DocumentationContext);
}

export function DocumentationContainer(props: PropsWithChildren<{}>) {
  const [activeDocument, setActiveDocument] = useState<string>();
  const value = useMemo(() => ({ setActiveDocument }), [setActiveDocument]);
  const { url } = useRouteMatch();
  const modal = activeDocument ? (
    <Modal
      visible={activeDocument != null}
      toggleVisible={() =>
        activeDocument ? setActiveDocument(undefined) : null
      }
      onClose={() => setActiveDocument(undefined)}
      styleOverrides={{
        content: {
          padding: {
            top: 0,
            right: 50,
            bottom: 25,
            left: 25,
          },
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ marginRight: 'auto' }}>
          <Documentation documentName={activeDocument} />
        </div>
        <button
          style={{
            fontSize: '2em',
            border: 'none',
            background: 'none',
            padding: 0,
          }}
          type="button"
          onClick={() => setActiveDocument(undefined)}
          title="Close"
        >
          <Close />
        </button>
      </div>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '.5em 0',
          background: 'white',
        }}
      >
        <Link to={`${url}/documentation/${activeDocument}`} target="_blank">
          <Launch fontSize="inherit" /> Open in new window
        </Link>
      </div>
    </Modal>
  ) : (
    <></>
  );
  return (
    <DocumentationContext.Provider value={value}>
      {modal}
      {props.children}
    </DocumentationContext.Provider>
  );
}
