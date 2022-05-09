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

import { createComputation } from '../../core/components/computations/Utils';

export function useWorkspaceAnalysis(
  studyId: string,
  analysisId?: string,
  singleAppMode?: string
) {
  const analysisClient = useAnalysisClient();

  const history = useHistory();
  const location = useLocation();
  const { url } = useRouteMatch();

  const preloadAnalysis = usePreloadAnalysis();

  const creatingAnalysis = useRef(false);

  // When we only want to use a single app, extract the computation and pass it to
  // makeNewAnalysis so that by default we will only use this single computation.
  const singleAppComputationId =
    singleAppMode === 'pass' ? 'pass-through' : singleAppMode; // for backwards compatibility

  // If using singleAppMode, create a computation object that will be used in our default analysis.
  const computation = useMemo(() => {
    return singleAppMode
      ? createComputation(
          singleAppMode,
          singleAppMode,
          null,
          [],
          singleAppComputationId
        )
      : undefined;
  }, [singleAppMode, singleAppComputationId]);

  const defaultAnalysis = useMemo(() => makeNewAnalysis(studyId, computation), [
    studyId,
    computation,
  ]);

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
        return analysisId;
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
