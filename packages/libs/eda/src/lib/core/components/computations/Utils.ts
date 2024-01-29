import { useCallback } from 'react';
import {
  Computation,
  Visualization,
  makeComputationWithConfigDecoder,
} from '../../types/visualization';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import { isEqual } from 'lodash';
import {
  AnalysisState,
  CollectionVariableTreeNode,
  useEntityAndVariableCollection,
} from '../..';
import { RouterChildContext, useRouteMatch, useHistory } from 'react-router';
import { VariableCollectionDescriptor } from '../../types/variable';
import { EntityAndVariableCollection } from '../../utils/study-metadata';

export type VariableCollectionItem = {
  value: VariableCollectionDescriptor;
  disabled?: boolean;
  display: string;
};

/**
 * Generates a collection of variable items based on the provided variable collections.
 *
 * @param {VariableCollectionDescriptor[]} variableCollections - An array of possible variable collection nodes.
 * @param {VariableCollectionDescriptor[]} disabledVariableCollections - An array of disabled variable collection nodes.
 * @return {VariableCollectionItem[]} An array of variable collection items.
 */
export function makeVariableCollectionItems(
  variableCollections: VariableCollectionDescriptor[],
  disabledVariableCollections: VariableCollectionDescriptor[] | undefined
): VariableCollectionItem[] {
  return variableCollections.map((variableCollection) => ({
    value: {
      collectionId: variableCollection.collectionId,
      entityId: variableCollection.entityId,
    },
    disabled: disabledVariableCollections?.some((disabledVariableCollection) =>
      isEqual(disabledVariableCollection, variableCollection)
    ),
    display:
      useEntityAndVariableCollection(variableCollection)?.entity.displayName +
      ' > ' +
      useEntityAndVariableCollection(variableCollection)?.variableCollection
        .displayName,
  }));
}

/**
 * Removes absolute abundance variable collections based on certain conditions.
 *
 * @param {CollectionVariableTreeNode[]} variableCollections - The array of variable collections.
 * @return {CollectionVariableTreeNode[]} The filtered array of variable collections.
 */
export function removeAbsoluteAbundanceVariableCollections(
  variableCollections: CollectionVariableTreeNode[]
): CollectionVariableTreeNode[] {
  return variableCollections.filter(isNotAbsoluteAbundanceVariableCollection);
}

/**
 * Returns false for absolute abundance variable collections, based on certain conditions.
 *
 * @param {CollectionVariableTreeNode} variableCollection - A variable collection.
 * @return {boolean} True if the collection is not an absolute abundance variable collection.
 */
export function isNotAbsoluteAbundanceVariableCollection(
  variableCollection: CollectionVariableTreeNode
): boolean {
  // Absolute abundance collections have the following annotations:
  // 1. normalizationMethod = NULL
  // 2. isCompositional = true
  // 3. isProportion = false
  return variableCollection.normalizationMethod
    ? variableCollection.normalizationMethod !== 'NULL' ||
        !variableCollection.isCompositional ||
        !!variableCollection.isProportion
    : true;
  // DIY may not have these annotations, but we still want those datasets to pass.
}

/**
 * Returns true for taxonomic variable collections and false for all others.
 *
 * @param {CollectionVariableTreeNode} variableCollection - A variable collection.
 * @return {boolean}
 */
export function isTaxonomicVariableCollection(
  variableCollection: CollectionVariableTreeNode
): boolean {
  return (
    isNotAbsoluteAbundanceVariableCollection(variableCollection) &&
    variableCollection.normalizationMethod === 'sumToUnity'
  );
}

/**
 * Returns true for functional genomics (eg pathways, gene abundances) variable collections and false for all others.
 *
 * @param {CollectionVariableTreeNode} variableCollection - A variable collection.
 * @return {boolean}
 */
export function isFunctionalCollection(
  variableCollection: CollectionVariableTreeNode
): boolean {
  return variableCollection.normalizationMethod === 'RPK'; // reads per kilobase
}

/**
 * Find a specific variable collection from a given array of variableCollections
 * based on the provided variableCollectionDescriptor.
 *
 * @param {EntityAndVariableCollection[]} variableCollections - The array of variableCollections to search through.
 * @param {VariableCollectionDescriptor} variableCollectionDescriptor - The descriptor to match against.
 * @return {EntityAndVariableCollection | undefined} - The matched variable collection, or undefined if not found.
 */
export function findEntityAndVariableCollectionFromDescriptor(
  entityAndVariableCollections: EntityAndVariableCollection[],
  variableCollectionDescriptor: VariableCollectionDescriptor | undefined
): EntityAndVariableCollection | undefined {
  return entityAndVariableCollections.find((entityAndVariableCollection) =>
    isEqual(
      {
        collectionId: entityAndVariableCollection.variableCollection.id,
        entityId: entityAndVariableCollection.entity.id,
      },
      variableCollectionDescriptor
    )
  );
}

/**
 * Finds a variable collection item from a given descriptor in an array of variable collection items.
 *
 * @param {VariableCollectionItem[]} variableCollections - The array of variable collection items to search through.
 * @param {VariableCollectionDescriptor} variableCollectionDescriptor - The descriptor to match against.
 * @return {VariableCollectionItem | undefined} The found variable collection item, or undefined if not found.
 */
export function findVariableCollectionItemFromDescriptor(
  variableCollections: VariableCollectionItem[],
  variableCollectionDescriptor: VariableCollectionDescriptor | undefined
): VariableCollectionItem | undefined {
  return variableCollections.find((collectionVariable) =>
    isEqual(
      {
        collectionId: collectionVariable.value.collectionId,
        entityId: collectionVariable.value.entityId,
      },
      variableCollectionDescriptor
    )
  );
}

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
  configDecoder: t.Type<ConfigType>
): asserts computation is Computation<ConfigType> {
  const decoder = makeComputationWithConfigDecoder(configDecoder);
  const onLeft = (errors: t.Errors) => {
    throw new Error(`Invalid computation configuration provided.`);
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
  if (isEqual(computation.descriptor.configuration, updatedConfiguration))
    return;

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

/**
 * Takes a partial codec and returns a new codec where all properties
 * are required.
 * @param partialCodec An io-ts codec made using the `partial` combinator
 * @returns An io-ts codec made using the `type` combinator
 */
export function partialToCompleteCodec<T extends {}>(
  partialCodec: t.PartialC<T>
): t.TypeC<T> {
  return t.type(partialCodec.props);
}
