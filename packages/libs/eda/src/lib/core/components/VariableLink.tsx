/*
 * Link to the page for a variable
 */
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useVariableLink } from '../hooks/workspace';

export interface Props<S = unknown> extends LinkProps<S> {
  entityId: string;
  variableId: string;
}

export function VariableLink(props: Props) {
  const { entityId, variableId, ...rest } = props;
  return <Link {...rest} to={useVariableLink(entityId, variableId)} />;
}
