import { groupBy, map, mapValues, orderBy, partition } from 'lodash';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { foldStructure, mapStructure } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { TaxonTree } from 'ortho-client/utils/taxons';

export const cxPhyleticExpression = makeClassNameHelper('PhyleticExpression');

export interface PhyleticExpressionUiTree extends TaxonTree {
  children: PhyleticExpressionUiTree[];
  parent?: PhyleticExpressionUiTree;
  speciesCount: number;
}

type HomogeneousConstraintState =
  | 'free'
  | 'include-at-least-one'
  | 'include-all'
  | 'exclude';

export type ConstraintState = HomogeneousConstraintState | 'mixed';

export type ConstraintStates = Record<string, ConstraintState>;

export function getNodeChildren(node: PhyleticExpressionUiTree) {
  return node.children;
}

export function makePhyleticExpressionUiTree(taxonTree: TaxonTree) {
  const phyleticExpressionUiTree = mapStructure(
    (node: TaxonTree, mappedChildren: PhyleticExpressionUiTree[]) => ({
      ...node,
      children: orderBy(
        mappedChildren,
        child => child.species,
        'desc'
      ),
      speciesCount: node.species
        ? 1
        : mappedChildren.reduce(
            (memo, { speciesCount }) => memo + speciesCount,
            0
          )
    }),
    (node: TaxonTree) => node.children,
    taxonTree
  );

  _addParentRefs(phyleticExpressionUiTree, undefined);

  return phyleticExpressionUiTree;

  function _addParentRefs(node: PhyleticExpressionUiTree, parent: PhyleticExpressionUiTree | undefined) {
    if (parent != null) {
      node.parent = parent;
    }

    node.children.forEach(child => {
      _addParentRefs(child, node);
    });
  }
}

export function makeInitialConstraintStates(phyleticExpressionUiTree: PhyleticExpressionUiTree) {
  return foldStructure(
    (constraintStates: ConstraintStates, node: PhyleticExpressionUiTree) => {
      constraintStates[node.abbrev] = 'free';
      return constraintStates;
    },
    {} as ConstraintStates,
    phyleticExpressionUiTree
  );
}

export function getNextConstraintState(currentState: ConstraintState, isSpecies: boolean): HomogeneousConstraintState {
  if (currentState === 'mixed') {
    return 'include-all';
  }

  const stateOrder = isSpecies
    ? SPECIES_STATE_ORDER
    : NON_SPECIES_STATE_ORDER;

  const stateIndex = stateOrder.indexOf(currentState);

  return stateOrder[(stateIndex + 1) % stateOrder.length];
}

const NON_SPECIES_STATE_ORDER = [ 'free', 'include-all', 'include-at-least-one', 'exclude' ] as const;
const SPECIES_STATE_ORDER = [ 'free', 'include-all', 'exclude' ] as HomogeneousConstraintState[];

export function updateParentConstraintStates(
  node: PhyleticExpressionUiTree,
  draftConstraintStates: ConstraintStates,
  changedState: ConstraintState
): void {
  const parent = node.parent;

  if (parent != null) {
    const distinctChildConstraintTypes = new Set(
      parent.children.map(
        child => draftConstraintStates[child.abbrev]
      )
    );

    const newParentState = (
      distinctChildConstraintTypes.size === 1 &&
      changedState !== 'include-at-least-one'     
    )
      ? changedState
      : 'mixed';

    draftConstraintStates[parent.abbrev] = newParentState;

    updateParentConstraintStates(parent, draftConstraintStates, newParentState);
  }
}

export function updateChildConstraintStates(
  node: PhyleticExpressionUiTree,
  draftConstraintStates: ConstraintStates,
  changedState: HomogeneousConstraintState
): void {
  node.children.forEach(child => {
    if (changedState === 'include-at-least-one') {
      draftConstraintStates[child.abbrev] = 'free';
    } else {
      draftConstraintStates[child.abbrev] = changedState;
    }

    updateChildConstraintStates(child, draftConstraintStates, changedState);
  });
}

export function makePhyleticExpression(
  phyleticExpressionUiTree: PhyleticExpressionUiTree,
  constraintStates: ConstraintStates
) {
  const nonSpeciesExpressionTerms = [] as string[];
  const includedSpeciesWithMixedParents = [] as string[];
  const excludedSpeciesWithMixedParents = [] as string[];

  _traverse(phyleticExpressionUiTree);

  const nonSpeciesSubexpression = nonSpeciesExpressionTerms.length == 0
    ? undefined
    : nonSpeciesExpressionTerms.join(' AND ');

  const includedSpeciesSubexpression = includedSpeciesWithMixedParents.length == 0
    ? undefined
    : `${includedSpeciesWithMixedParents.join('+')}=${includedSpeciesWithMixedParents.length}T`;

  const excludedSpeciesSubexpression = excludedSpeciesWithMixedParents.length == 0
    ? undefined
    : `${excludedSpeciesWithMixedParents.join('+')}=0T`;

  const subexpressions = [
    nonSpeciesSubexpression,
    includedSpeciesSubexpression,
    excludedSpeciesSubexpression
  ];

  return (
    subexpressions
      .filter(subexpression => subexpression != null)
      .join(' AND ')
  );

  function _traverse(node: PhyleticExpressionUiTree) {
    const nextConstraintType = constraintStates[node.abbrev];

    if (nextConstraintType === 'include-all') {
      nonSpeciesExpressionTerms.push(`${node.abbrev}=${node.speciesCount}T`);
    } else if (nextConstraintType === 'include-at-least-one') {
      nonSpeciesExpressionTerms.push(`${node.abbrev}>=1T`);
    } else if (nextConstraintType === 'exclude') {
      nonSpeciesExpressionTerms.push(`${node.abbrev}=0T`);
    } else if (nextConstraintType === 'mixed') {
      const [ speciesChildren, nonSpeciesChildren ] = partition(
        node.children,
        child => child.species
      );

      const speciesChildrenAbbrevs = map(
        speciesChildren,
        speciesChild => speciesChild.abbrev
      );

      const speciesChildrenAbbrevsByState = groupBy(
        speciesChildrenAbbrevs,
        speciesChildAbbrev => constraintStates[speciesChildAbbrev]
      );

      const includedSpeciesAbbrevs = speciesChildrenAbbrevsByState['include-all'] ?? [];
      const excludedSpeciesAbbrevs = speciesChildrenAbbrevsByState['exclude'] ?? [];

      includedSpeciesWithMixedParents.push(...includedSpeciesAbbrevs);
      excludedSpeciesWithMixedParents.push(...excludedSpeciesAbbrevs);

      nonSpeciesChildren.forEach(_traverse);
    }
  }
}
