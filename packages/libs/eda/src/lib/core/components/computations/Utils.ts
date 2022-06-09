import { Computation, Visualization } from '../../types/visualization';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import { isEqual } from 'lodash';
import { AnalysisState, CollectionVariableTreeNode } from '../..';
import { RouterChildContext } from 'react-router';

/**
 * Creates a new `Computation` with a unique id
 */
export function createComputation(
  computationType: string,
  displayName: string,
  configuration: unknown,
  computations: Computation[] = [],
  visualizations: Visualization[] = [],
  computationId?: string
): Computation {
  if (!computationId) {
    computationId = createNewId(
      new Set(computations.map((c) => c.computationId))
    );
  }

  return {
    computationId,
    displayName,
    descriptor: {
      type: computationType,
      configuration,
    },
    visualizations,
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

export function assertConfigType<ConfigType>(
  config: unknown,
  configDecoder: t.Type<ConfigType, unknown, unknown>
): asserts config is ConfigType {
  const onLeft = (errors: t.Errors) => {
    throw new Error(`Invalid configuration: ${errors}`);
  };
  const onRight = () => null;
  pipe(configDecoder.decode(config), fold(onLeft, onRight));
}

export function getConfigHandlerObjects<ConfigType>(
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

export async function updateAnalysisWithAmendedComputations(
  newOrExistingComputation: Computation,
  computationAfterVizRemoval: Computation,
  analysisState: AnalysisState,
  computations: Computation[],
  filteringCallback: (c: Computation) => void
) {
  computationAfterVizRemoval.visualizations.length
    ? await analysisState.setComputations([
        newOrExistingComputation,
        computationAfterVizRemoval,
        ...computations.filter(filteringCallback),
      ])
    : await analysisState.setComputations([
        newOrExistingComputation,
        ...computations.filter(filteringCallback),
      ]);
}

export function handleRouting(
  history: RouterChildContext['router']['history'],
  baseUrl: string,
  urlToReplace: string,
  urlToReplaceWith: string
) {
  history.push(baseUrl.replace(urlToReplace, urlToReplaceWith));
}

export function handleConfigurationChanges<ConfigType>(
  analysisState: AnalysisState,
  computation: Computation,
  updatedConfiguration: ConfigType,
  visualizationId: string,
  url: string,
  history: RouterChildContext['router']['history'],
  configurationDisplayString: string
) {
  // when a config value changes:
  // 1. remove viz from current computation
  // 2. check if the newConfig exists
  // Y? move viz to the found computation, "existingComputation"
  // N? create new computation
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
      configurationDisplayString,
      updatedConfiguration,
      computations,
      existingVisualization
    );

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
