import { useCallback, useMemo, useRef } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { Location } from 'history';

import Path from 'path';

import {
  NewAnalysis,
  makeNewAnalysis,
  useAnalysis,
  useAnalysisClient,
  usePreloadAnalysis,
} from '../../core';

export function useWorkspaceAnalysis(studyId: string, analysisId?: string) {
  const analysisClient = useAnalysisClient();

  const history = useHistory();
  const location = useLocation();
  const { url } = useRouteMatch();

  const preloadAnalysis = usePreloadAnalysis();

  const creatingAnalysis = useRef(false);

  const defaultAnalysis = useMemo(() => makeNewAnalysis(studyId), [studyId]);

  const createAnalysis = useCallback(
    async (newAnalysis: NewAnalysis) => {
      if (!creatingAnalysis.current) {
        creatingAnalysis.current = true;

        const { analysisId } = await analysisClient.createAnalysis(newAnalysis);
        await preloadAnalysis(analysisId);
        creatingAnalysis.current = false;

        const subPath = findSubPath(newAnalysis, location, url);
        const newLocation = {
          ...location,
          pathname: Path.resolve(url, '..', analysisId + subPath),
        };

        history.replace(newLocation);
      }
    },
    [analysisClient, history, location, preloadAnalysis, url]
  );

  return useAnalysis(defaultAnalysis, createAnalysis, analysisId);
}

function findSubPath(
  newAnalysis: NewAnalysis,
  location: Location,
  url: string
) {
  const computationWithNewVisualization = newAnalysis.descriptor.computations.find(
    ({ visualizations }) => visualizations.length > 0
  );

  const newVisualizationId =
    computationWithNewVisualization?.visualizations[0].visualizationId;

  if (newVisualizationId == null) {
    return location.pathname.slice(url.length);
  }

  return Path.join(
    location.pathname.slice(url.length),
    '..',
    newVisualizationId
  );
}
