import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { pathfinderUrl, rootUrl } from '@veupathdb/web-common/lib/config';

import Pathfinder from '../Pathfinder';

type PathfinderControllerProps = RouteComponentProps<{}>;

export const PathfinderController = (props: PathfinderControllerProps) => {
  usePathfinderDocumentTitle();
  const { location, match } = props;
  const subPath = location.pathname
    .slice(match.url.length)
    .replace(/^\/+/, '/');
  const src = pathfinderUrl.replace(/\/+$/, '') + subPath + location.search;
  return <Pathfinder src={src} appBase={rootUrl} />;
};

const usePathfinderDocumentTitle = () => {
  const projectDisplayName = useSelector(
    (state: RootState) =>
      state.globalData.config && state.globalData.config.displayName
  );

  const title = projectDisplayName
    ? `${projectDisplayName} :: PathFinder`
    : 'PathFinder';

  useSetDocumentTitle(title);
};
