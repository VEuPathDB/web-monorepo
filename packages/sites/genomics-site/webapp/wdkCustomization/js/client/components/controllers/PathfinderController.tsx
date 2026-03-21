import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { projectId } from '../../config';
import Pathfinder from '../Pathfinder';

export const PathfinderController = () => {
  usePathfinderDocumentTitle();

  const siteId = (projectId ?? 'veupathdb').toLowerCase();
  const src = `/pathfinder-app?embedded=true&siteId=${siteId}`;

  return <Pathfinder src={src} />;
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
