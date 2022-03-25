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
  useDataClient,
} from '../../core';

import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { createComputation } from '../../core/components/computations/Utils';
import { Computation } from '../../core/types/visualization';
import { usePromise } from '../../core/hooks/promise';

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
  // makeNewAnalysis so that it will by default only use this single computation.
  const singleAppComputationId =
    singleAppMode === 'pass' ? 'pass-through' : singleAppMode;

  const dataClient = useDataClient();
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  // Get apps that are appropriate for this project and check singleAppMode is one of these approved apps
  const promiseState = usePromise(
    useCallback(async () => {
      let { apps } = await dataClient.getApps();

      const { projectId } = await wdkService.getConfig();
      apps = apps.filter((app) => app.projects?.includes(projectId));

      if (singleAppMode) {
        apps = apps.filter((app) => app.name === singleAppMode);
      }

      if (apps == null || !apps.length)
        throw new Error('Could not find any computation app.');

      return apps;
    }, [dataClient, wdkService, singleAppMode])
  );
  const singleApp =
    promiseState.value !== undefined ? promiseState.value[0] : null;

  // If using singleAppMode, create a computation object that will be used in our default analysis.
  let computation: Computation | undefined = undefined;
  if (singleAppMode && singleApp) {
    computation = createComputation(
      singleApp,
      singleAppMode,
      null,
      [],
      singleAppComputationId
    );
  }

  const defaultAnalysis = useMemo(() => makeNewAnalysis(studyId, computation), [
    studyId,
    singleApp,
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
