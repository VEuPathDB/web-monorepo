import React, { useCallback, useEffect, useMemo, useState } from 'react';

import produce from 'immer';
import { groupBy, mapValues, orderBy, partition } from 'lodash';

import { CheckboxTree, Loading } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { foldStructure, mapStructure } from 'wdk-client/Utils/TreeUtils';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { TaxonTree } from 'ortho-client/utils/taxons';

import './Form.scss';

const cxDefaultQuestionForm = makeClassNameHelper('wdk-QuestionForm');
const cxPhyleticExpression = makeClassNameHelper('PhyleticExpression');

const PHYLETIC_EXPRESSION_PARAM_NAME = 'phyletic_expression';

export function Form(props: Props) {
  const taxonUiMetadata = useTaxonUiMetadata();

  const phyleticExpressionUiTree = useMemo(
    () => taxonUiMetadata == null
      ? undefined
      : makePhyleticExpressionUiTree(taxonUiMetadata.taxonTree),
    [ taxonUiMetadata ]
  );

  const updatePhyleticExpressionParam = useCallback((newParamValue: string) => {
    props.eventHandlers.updateParamValue({
      searchName: props.state.question.urlSegment,
      parameter: props.state.question.parametersByName[PHYLETIC_EXPRESSION_PARAM_NAME],
      paramValues: props.state.paramValues,
      paramValue: newParamValue
    });
  }, [ props.eventHandlers, props.state.question, props.state.paramValues ]);

  const renderParamGroup = useCallback((group: ParameterGroup, formProps: Props) => {
    return (
      <div key={group.name} className={cxDefaultQuestionForm('ParameterList')}>
        <div className={cxDefaultQuestionForm('ParameterControl')}>
        {
          phyleticExpressionUiTree == null
            ? <Loading />
            : <PhyleticExpressionParameter
                phyleticExpressionTextField={formProps.parameterElements[PHYLETIC_EXPRESSION_PARAM_NAME]}
                phyleticExpressionUiTree={phyleticExpressionUiTree}
                updatePhyleticExpressionParam={updatePhyleticExpressionParam}
              />
        }
        </div>
      </div>
    );
  }, [ phyleticExpressionUiTree, updatePhyleticExpressionParam ]);

  return (
    <EbrcDefaultQuestionForm
      {...props}
      containerClassName={`${cxDefaultQuestionForm()} ${cxDefaultQuestionForm('GroupsByPhyleticPattern')}`}
      renderParamGroup={renderParamGroup}
    />
  );
}

interface PhyleticExpressionParameterProps {
  phyleticExpressionTextField: React.ReactNode;
  phyleticExpressionUiTree: PhyleticExpressionUiTree;
  updatePhyleticExpressionParam: (newParamValue: string) => void;
}

interface PhyleticExpressionUiTree extends TaxonTree {
  children: PhyleticExpressionUiTree[];
  parent?: PhyleticExpressionUiTree;
  speciesCount: number;
}

type ConstraintStates = Record<string, ConstraintState>;

type HomogeneousConstraintState =
  | 'free'
  | 'include-at-least-one'
  | 'include-all'
  | 'exclude';

type ConstraintState = HomogeneousConstraintState | 'mixed';

function PhyleticExpressionParameter({
  phyleticExpressionTextField,
  phyleticExpressionUiTree,
  updatePhyleticExpressionParam
}: PhyleticExpressionParameterProps) {
  const [ expandedNodes, setExpandedNodes ] = useState([] as string[]);

  const [ constraintStates, setConstraintStates ] = useState(
    () => makeInitialConstraintStates(phyleticExpressionUiTree)
  );

  useEffect(() => {
    setConstraintStates(makeInitialConstraintStates(phyleticExpressionUiTree));
  }, [ phyleticExpressionUiTree ]);

  const renderNode = useMemo(
    () => makeRenderNode(
      constraintStates,
      setConstraintStates,
      phyleticExpressionUiTree,
      updatePhyleticExpressionParam
    ),
    [ constraintStates, phyleticExpressionUiTree, updatePhyleticExpressionParam ]
  );

  return (
    <div className="PhyleticExpressionParameter">
      {phyleticExpressionTextField}
      <CheckboxTree
        tree={phyleticExpressionUiTree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={setExpandedNodes}
        shouldExpandOnClick={false}
        expandedList={expandedNodes}
        renderNode={renderNode}
        showRoot
        linksPosition={LinksPosition.Top}
      />
    </div>
  );
}

function makePhyleticExpressionUiTree(taxonTree: TaxonTree) {
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

function makeInitialConstraintStates(phyleticExpressionUiTree: PhyleticExpressionUiTree) {
  return foldStructure(
    (constraintStates: ConstraintStates, node: PhyleticExpressionUiTree) => {
      constraintStates[node.abbrev] = 'free';
      return constraintStates;
    },
    {} as ConstraintStates,
    phyleticExpressionUiTree
  );
}

function getNodeId(node: PhyleticExpressionUiTree) {
  return node.abbrev;
}

function getNodeChildren(node: PhyleticExpressionUiTree) {
  return node.children;
}

function makeRenderNode(
  constraintStates: ConstraintStates,
  setConstraintStates: (newConstraintStates: ConstraintStates) => void,
  phyleticExpressionUiTree: PhyleticExpressionUiTree,
  updatePhyleticExpressionParam: (newParamValue: string) => void
) {
  return function(node: PhyleticExpressionUiTree, path: number[] | undefined) {
    const containerClassName = cxPhyleticExpression(
      '--Node',
      path?.length === 1 ? 'root' : 'interior',
      node.species && 'species'
    );

    const constraintClassName = cxPhyleticExpression(
      '--NodeConstraint',
      constraintStates[node.abbrev]
    );

    const onConstraintChange = () => {
      const newConstraintStates = produce(constraintStates, draftConstraintStates => {
        const changedState = getNextConstraintState(
          constraintStates[node.abbrev],
          node.species
        );

        draftConstraintStates[node.abbrev] = changedState;
        updateParentConstraintStates(node, draftConstraintStates, changedState);
        updateChildConstraintStates(node, draftConstraintStates, changedState);
      });

      const newPhyleticExpression = makePhyleticExpression(
        phyleticExpressionUiTree,
        newConstraintStates
      );

      setConstraintStates(newConstraintStates);
      updatePhyleticExpressionParam(newPhyleticExpression);
    };

    return (
      <div className={containerClassName}>
        <span onClick={onConstraintChange} className={constraintClassName}></span>
        <span>{node.name} ({node.abbrev})</span>
      </div>
    );
  }
}

function getNextConstraintState(currentState: ConstraintState, isSpecies: boolean): HomogeneousConstraintState {
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

function updateParentConstraintStates(
  node: PhyleticExpressionUiTree,
  draftConstraintStates: ConstraintStates,
  changedState: HomogeneousConstraintState
): void {
  const parent = node.parent;

  if (parent != null) {
    const distinctChildConstraintTypes = new Set(
      parent.children.map(
        child => draftConstraintStates[child.abbrev]
      )
    );

    if (
      distinctChildConstraintTypes.size === 1 &&
      changedState !== 'include-at-least-one'
    ) {
      draftConstraintStates[parent.abbrev] = changedState;
    } else {
      draftConstraintStates[parent.abbrev] = 'mixed';
    }

    updateParentConstraintStates(parent, draftConstraintStates, changedState);
  }
}

function updateChildConstraintStates(
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

function makePhyleticExpression(
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

      const speciesChildrenAbbrevs = mapValues(
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
