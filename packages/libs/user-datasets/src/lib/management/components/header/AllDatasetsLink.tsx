import React from 'react';

import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import Link from '@veupathdb/wdk-client/lib/Components/Link';
import { useRouteMatch } from 'react-router-dom';
import { useUserDatasetRouterContext } from '../../../Controllers/UserDatasetRouterContext';

export const AllDatasetsLink = (): React.ReactElement => {
  const { url } = useRouteMatch();
  const { workspaceTitle } = useUserDatasetRouterContext();

  return (
    <Link className="AllDatasetsLink" to={url}>
      <Icon fa="chevron-left" />
      &nbsp; Manage {workspaceTitle}
    </Link>
  );
};