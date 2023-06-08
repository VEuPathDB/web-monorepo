import { Redirect, useRouteMatch } from 'react-router';
import { useGetDefaultVariableDescriptor } from '../core/hooks/workspace';

interface Props {
  entityId?: string;
}

export function DefaultVariableRedirect(props: Props) {
  const { url } = useRouteMatch();
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const { entityId, variableId } = getDefaultVariableDescriptor(props.entityId);

  // Prevent <Variables> from rendering multiple times
  const path = props.entityId
    ? `${url}/${variableId}`
    : `${url}/${entityId}/${variableId}`;
  return <Redirect to={path} />;
}
