import { Computation, Visualization } from '../../types/visualization';
// alphadiv abundance
import { ComputationConfiguration } from '../../types/visualization';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import { isEqual } from 'lodash';

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
  updatedConfiguration: t.Type<ConfigType, unknown, unknown>
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
