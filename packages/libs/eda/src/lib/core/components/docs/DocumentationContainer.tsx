import { Modal } from '@material-ui/core';
import { Close } from '@veupathdb/coreui';
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
      style={{ margin: '2em', zIndex: 2000 }}
      open={activeDocument != null}
      onClose={() => setActiveDocument(undefined)}
    >
      <div
        style={{
          height: '100%',
          borderRadius: '1em',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'white',
            height: '100%',
            overflow: 'auto',
            padding: '2em',
          }}
        >
          <button
            style={{
              position: 'absolute',
              right: '1em',
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
          <div>
            <Documentation documentName={activeDocument} />
          </div>
        </div>
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            padding: '.5em 2em',
            marginRight: '2em',
            background: 'white',
          }}
        >
          <Link to={`${url}/documentation/${activeDocument}`} target="_blank">
            <Launch fontSize="inherit" /> Open in new window
          </Link>
        </div>
      </div>
    </Modal>
  ) : null;
  return (
    <DocumentationContext.Provider value={value}>
      {modal}
      {props.children}
    </DocumentationContext.Provider>
  );
}
