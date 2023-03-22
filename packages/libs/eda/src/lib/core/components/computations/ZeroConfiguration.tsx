import React, { useEffect } from 'react';
import { ComputationConfigProps } from './Types';

export interface Props extends ComputationConfigProps {
  autoCreate?: boolean;
}

/**
 * An App configuration component that can be used when no configuration is needed.
 * This component will create a new instance of the app and immediately redirect to it.
 */
// alphadiv abundance null as any needs to be be used here if ComputationConfiguration is typed
function ZeroConfig(props: Props) {
  const { autoCreate = false, addNewComputation } = props;
  useEffect(() => {
    if (autoCreate) addNewComputation('Unnamed computation', undefined);
  }, [addNewComputation, autoCreate]);

  return null;
}

export function ZeroConfigWithAutoCreate(props: ComputationConfigProps) {
  return <ZeroConfig {...props} autoCreate />;
}

export function ZeroConfigWithButton(props: ComputationConfigProps) {
  return <ZeroConfig {...props} />;
}
