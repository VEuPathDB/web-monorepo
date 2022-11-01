/*
 * Link to the page for a variable
 */
import { useMemo } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useMakeVariableLink } from '../hooks/workspace';

export interface Props<S = unknown> extends Omit<LinkProps<S>, 'to'> {
  entityId?: string;
  variableId?: string;
}

export function VariableLink(props: Props) {
  const { entityId, variableId, ...rest } = props;
  const makeVariableLink = useMakeVariableLink();
  const variableLink = useMemo(
    () =>
      makeVariableLink({
        entityId,
        variableId,
      }),
    [makeVariableLink, entityId, variableId]
  );

  return (
    <Link
      replace
      {...rest}
      to={{ pathname: variableLink, state: { scrollToTop: false } }}
    />
  );
}
