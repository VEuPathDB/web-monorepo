import { Loading } from '@veupathdb/wdk-client/lib/Components';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ComputationProps } from './Types';
import { createComputation } from './Utils';

export interface Props extends ComputationProps {
  autoCreate?: boolean;
}

/**
 * An App configuration component that can be used when no configuration is needed.
 * This component will create a new instance of the app and immediately redirect to it.
 */
function ZeroConfig(props: Props) {
  const { analysisState, computationAppOverview, autoCreate = false } = props;
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const addComputationAndRedirect = useCallback(() => {
    if (analysisState.analysis == null) return;

    setLoading(true);

    const computations = analysisState.analysis.descriptor.computations;
    const computation = createComputation(
      computationAppOverview,
      'Unnamed app',
      null,
      computations
    );
    analysisState.setComputations([computation, ...computations]);
    history.push(`${history.location.pathname}/${computation.computationId}`);
  }, [analysisState, computationAppOverview, history]);

  useEffect(() => {
    if (autoCreate) addComputationAndRedirect();
  }, [addComputationAndRedirect, autoCreate]);

  if (loading) return <Loading />;
  return (
    <button type="button" onClick={addComputationAndRedirect}>
      Add computation
    </button>
  );
}

export function ZeroConfigWithAutoCreate(props: ComputationProps) {
  return <ZeroConfig {...props} autoCreate />;
}

export function ZeroConfigWithButton(props: ComputationProps) {
  return <ZeroConfig {...props} />;
}
