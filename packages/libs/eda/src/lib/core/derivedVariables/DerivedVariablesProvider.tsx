import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { NewAnalysis } from '../types/analysis';
import { DerivedVariableMetadata } from '../api/DataClient/types';
import { useDeepValue } from '../hooks/immutability';
import Loading from '@veupathdb/wdk-client/lib/Components/Loading/Loading';
import { DerivedVariableSpecsContext } from './DerivedVariableSpecsContext';
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
    settled: boolean;
    metadata: DerivedVariableMetadata[];
  }>({ settled: false, metadata: [] });

  useEffect(() => {
    if (supported.length === 0) {
      setFetched({ settled: false, metadata: [] });
      return;
    }
    let cancelled = false;
    dataClient
      .getDerivedVariableMetadata(studyMetadata.id, supported)
      .then((metadata) => {
        if (!cancelled) setFetched({ settled: true, metadata });
      })
      .catch((error) => {
        console.error('Unable to fetch derived variable metadata', error);
        // keep any previous metadata; the first failure leaves it empty
        if (!cancelled) setFetched((prev) => ({ ...prev, settled: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [dataClient, studyMetadata.id, supported]);

  // Requests can always be injected, since that needs no metadata. The tree
  // keeps the last fetched metadata, minus entries whose spec has gone.
  const augmented = useMemo(() => {
    const nodes = supported.flatMap((spec) => {
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
      dataClient: withDerivedVariableSpecs(dataClient, supported),
    };
  }, [fetched, supported, workspace, studyMetadata, dataClient]);

  // No derived variables: nothing to wrap.
  if (supported.length === 0) return <>{children}</>;

  // Hold children until the first fetch settles, so that requests for saved
  // plots using a derived variable aren't made (and cached) without metadata.
  if (!fetched.settled) return <Loading />;

  return (
    <DerivedVariableSpecsContext.Provider value={supported}>
      <WorkspaceContext.Provider value={augmented}>
        {children}
      </WorkspaceContext.Provider>
    </DerivedVariableSpecsContext.Provider>
  );
}
