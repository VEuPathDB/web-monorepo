import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { NewAnalysis } from '../types/analysis';
import { DerivedVariableMetadata } from '../api/DataClient/types';
import { useDeepValue } from '../hooks/immutability';
import { withDerivedVariableSpecs } from './dataClient';
import { addDerivedVariablesToEntity, toVariableTreeNode } from './metadata';
import { decodeDerivedVariables } from './types';

interface Props {
  analysis: NewAnalysis;
  children: ReactNode;
}

/**
 * Makes an analysis's derived variables available to descendants: they appear
 * in the variable tree and are sent along with visualization requests.
 */
export function DerivedVariablesProvider(props: Props) {
  const { analysis, children } = props;
  const workspace = useContext(WorkspaceContext);
  if (workspace == null) throw new Error('Missing WorkspaceContext');
  const { dataClient, studyMetadata } = workspace;

  const entries = useDeepValue(analysis.descriptor.derivedVariables);
  const supported = useMemo(
    () => decodeDerivedVariables(entries).supported,
    [entries]
  );
  const [fetched, setFetched] = useState<{
    specs: typeof supported;
    metadata: DerivedVariableMetadata[];
  }>();

  useEffect(() => {
    if (supported.length === 0) {
      setFetched(undefined);
      return;
    }
    let cancelled = false;
    dataClient
      .getDerivedVariableMetadata(studyMetadata.id, supported)
      .then((metadata) => {
        if (!cancelled) setFetched({ specs: supported, metadata });
      })
      .catch((error) => {
        console.error('Unable to fetch derived variable metadata', error);
        if (!cancelled) setFetched(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [dataClient, studyMetadata.id, supported]);

  const augmented = useMemo(() => {
    if (fetched == null || fetched.specs !== supported) return workspace;
    const nodes = fetched.specs.flatMap((spec) => {
      const meta = fetched.metadata.find(
        (m) => m.entityId === spec.entityId && m.variableId === spec.variableId
      );
      return meta
        ? [{ entityId: spec.entityId, node: toVariableTreeNode(meta, spec) }]
        : [];
    });
    return {
      ...workspace,
      studyMetadata: {
        ...studyMetadata,
        rootEntity: addDerivedVariablesToEntity(
          studyMetadata.rootEntity,
          nodes
        ),
      },
      dataClient: withDerivedVariableSpecs(dataClient, fetched.specs),
    };
  }, [fetched, supported, workspace, studyMetadata, dataClient]);

  return (
    <WorkspaceContext.Provider value={augmented}>
      {children}
    </WorkspaceContext.Provider>
  );
}
