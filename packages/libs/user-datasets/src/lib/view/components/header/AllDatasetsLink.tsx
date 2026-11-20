import React from 'react';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import { useRouteMatch } from 'react-router-dom';

export type AllDatasetsLinkProps = {
  readonly workspaceTitle: string;
};

export const AllDatasetsLink = (props: AllDatasetsLinkProps): React.ReactElement => {
  const { url } = useRouteMatch();

  return (
    <Link className="AllDatasetsLink" to={url}>
      <Icon fa="chevron-left" />
      &nbsp; Manage {props.workspaceTitle}
    </Link>
  );
};