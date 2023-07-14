import { useCallback } from 'react';
import { Computation, Visualization } from '../../types/visualization';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import { isEqual } from 'lodash';
import { AnalysisState } from '../..';
import { RouterChildContext, useRouteMatch, useHistory } from 'react-router';

/**
 * Creates a new `Computation` with a unique id
 */
export function createComputation(
  computationType: string,
  configuration: unknown,
  computations: Computation[] = [],
  visualizations: Visualization[] = [],
  computationId?: string,
  displayName?: string
): Computation {
  if (!computationId) {
    computationId = createNewId(
      new Set(computations.map((c) => c.computationId))
    );
  }

  return {
    computationId,
    descriptor: {
      type: computationType,
      configuration,
    },
    visualizations,
    displayName,
  };
}

/**
 * Creates a new ID that is unique amongst the set of provided `ids`.
 */
function createNewId(ids: Set<string>): string {
  const id = createRandomString(5);
  if (ids.has(id)) return createNewId(ids);
  return id;
}

/**
 * Creates a random string with `numChars` characters.
 */
function createRandomString(numChars: number) {
  return Math.random()
    .toString(36)
    .slice(2, numChars + 2);
}

export function assertComputationWithConfig<ConfigType>(
  computation: Computation,
  decoder: t.Type<Computation, unknown, unknown>
): asserts computation is Computation<ConfigType> {
  const onLeft = (errors: t.Errors) => {
    throw new Error(`Invalid computation configuration: ${errors}`);
  };
  const onRight = () => null;
  pipe(decoder.decode(computation), fold(onLeft, onRight));
}

export function useConfigChangeHandler<ConfigType>(
  analysisState: AnalysisState,
  computation: Computation<ConfigType>,
  visualizationId: string
) {
  const { url } = useRouteMatch();
  const history = useHistory();
  return useCallback(
    (
      propertyName: keyof ConfigType,
      value: ConfigType[typeof propertyName]
    ) => {
      const { configuration } = computation.descriptor;
      handleConfigurationChanges(
        analysisState,
        computation,
        { ...configuration, [propertyName]: value },
        visualizationId,
        url,
        history
      );
    },
    [analysisState, computation, history, url, visualizationId]
  );
}

function handleConfigurationChanges<ConfigType>(
  analysisState: AnalysisState,
  computation: Computation,
  updatedConfiguration: ConfigType,
  visualizationId: string,
  url: string,
  history: RouterChildContext['router']['history']
) {
  // when a config value changes:
  // 1. remove viz from current computation
  // 2. check if the newConfig exists
  // Y? move viz to the found computation, "existingComputation"
  // N? create new computation
  // 3. update analysis, during which check if "removed from" computation has any visualizations
  // Y? include the "removed from" and "added to" computations
  // N? only include the "added to" computation
  const computations = analysisState.analysis
    ? analysisState.analysis.descriptor.computations
    : [];

  const {
    existingComputation,
    existingVisualization,
    computationAfterVizRemoval,
  } = getConfigHandlerObjects<ConfigType>(
    computations,
    computation,
    visualizationId,
    updatedConfiguration
  );

  if (existingComputation) {
    // 2Y:  move viz to existingComputation

    const existingComputationWithVizAdded = {
      ...existingComputation,
      visualizations: existingComputation.visualizations.concat(
        existingVisualization
      ),
    };

    // 3: update analysis
    updateAnalysisWithAmendedComputations(
      existingComputationWithVizAdded,
      computationAfterVizRemoval,
      analysisState,
      computations,
      (c) =>
        c.computationId !== existingComputation.computationId &&
        c.computationId !== computation.computationId
    );

    handleRouting(
      history,
      url,
      computation.computationId,
      existingComputation.computationId
    );
  } else {
    // 2N:  existingComputation was not found
    //      get config displayName for new computation
    //      create a new computation with the existing viz
    const newComputation = createComputation(
      computation.descriptor.type,
      updatedConfiguration,
      computations,
      existingVisualization
    );

    // 3: update analysis
    updateAnalysisWithAmendedComputations(
      newComputation,
      computationAfterVizRemoval,
      analysisState,
      computations,
      (c) => c.computationId !== computation.computationId
    );

    handleRouting(
      history,
      url,
      computation.computationId,
      newComputation.computationId
    );
  }
}

function getConfigHandlerObjects<ConfigType>(
  computations: Computation[],
  computation: Computation,
  visualizationId: string,
  updatedConfiguration: ConfigType
) {
  const existingComputation = computations.find(
    (c) =>
      isEqual(c.descriptor.configuration, updatedConfiguration) &&
      c.descriptor.type === computation.descriptor.type
  );
  const existingVisualization = computation.visualizations.filter(
    (viz) => viz.visualizationId === visualizationId
  );
  const computationAfterVizRemoval = {
    ...computation,
    visualizations: computation.visualizations.filter(
      (viz) => viz.visualizationId !== visualizationId
    ),
  };
  return {
    existingComputation,
    existingVisualization,
    computationAfterVizRemoval,
  };
}

function updateAnalysisWithAmendedComputations(
  newOrExistingComputation: Computation,
  computationAfterVizRemoval: Computation,
  analysisState: AnalysisState,
  computations: Computation[],
  filteringCallback: (c: Computation) => void
) {
  if (computationAfterVizRemoval.visualizations.length) {
    analysisState.setComputations([
      newOrExistingComputation,
      computationAfterVizRemoval,
      ...computations.filter(filteringCallback),
    ]);
  } else {
    analysisState.setComputations([
      newOrExistingComputation,
      ...computations.filter(filteringCallback),
    ]);
  }
}

function handleRouting(
  history: RouterChildContext['router']['history'],
  baseUrl: string,
  urlToReplace: string,
  urlToReplaceWith: string
) {
  history.replace(baseUrl.replace(urlToReplace, urlToReplaceWith));
}
