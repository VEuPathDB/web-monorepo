/*
 * Link to the page for a variable
 */
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useStudyMetadata, useMakeVariableLink } from '../hooks/workspace';

export interface Props<S = unknown> extends Omit<LinkProps<S>, 'to'> {
  entityId?: string;
  variableId?: string;
}

export function VariableLink(props: Props) {
  const { entityId, variableId, ...rest } = props;
  const studyMetadata = useStudyMetadata();
  const makeVariableLink = useMakeVariableLink();
  return (
    <Link
      {...rest}
      replace
      to={makeVariableLink({ entityId, variableId }, studyMetadata)}
    />
  );
}
