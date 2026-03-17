import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { projectId } from '../../config';
import Pathfinder from '../Pathfinder';

const PATHFINDER_PORT =
  '__PATHFINDER_PORT__' in window
    ? (window as any).__PATHFINDER_PORT__
    : '3000';

export const PathfinderController = () => {
  usePathfinderDocumentTitle();

  const siteId = (projectId ?? 'veupathdb').toLowerCase();
  const src = `${window.location.protocol}//${window.location.hostname}:${PATHFINDER_PORT}?embedded=true&siteId=${siteId}`;

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
