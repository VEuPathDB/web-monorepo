import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { mapValues } from 'lodash'

import { Props as FormProps, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';
import { CheckboxEnumParam, ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { valueToArray } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { CheckboxTree } from 'wdk-client/Components';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './GenesByOrthologPattern.scss';

const cx = makeClassNameHelper('GenesByOrthologPattern');

const PHYLETIC_INDENT_MAP_PARAM_NAME = 'phyletic_indent_map';
const PHYLETIC_TERM_MAP_PARAM_NAME = 'phyletic_term_map';
const INCLUDED_SPECIES_PARAM_NAME = 'included_species';
const EXCLUDED_SPECIES_PARAM_NAME = 'excluded_species';
const PROFILE_PATTERN_PARAM_NAME = 'profile_pattern';
const ORGANISM_PARAM_NAME = 'organism';

const NO_TERMS = 'n/a';

const ALL_ORGANISMS_TERM = 'ALL';
const ALL_ORGANISMS_DISPLAY = 'All Organisms';

type OwnProps = FormProps;

type Props = OwnProps;

export const GenesByOrthologPattern = (props: Props) => {
  const renderParamGroup = useCallback((group: ParameterGroup, formProps: Props) => {
    return renderDefaultParamGroup(
      {
        ...group,
        parameters: [ ORGANISM_PARAM_NAME, PROFILE_PATTERN_PARAM_NAME ]
      },
      {
        ...formProps,
        parameterElements: {
          [ ORGANISM_PARAM_NAME ]: formProps.parameterElements[ORGANISM_PARAM_NAME],
          [ PROFILE_PATTERN_PARAM_NAME ]: (
            <ProfileParameter
              questionState={formProps.state}
              eventHandlers={formProps.eventHandlers}
            />
          )
        }
      }
    );
  }, []);

  return (
    <EbrcDefaultQuestionForm
      {...props} 
      renderParamGroup={renderParamGroup}
    />
  );
};

type ProfileParameterProps = {
  questionState: Props['state'],
  eventHandlers: Props['eventHandlers']
};

function ProfileParameter({
  questionState,
  eventHandlers
}: ProfileParameterProps) {
  const depthMap = useMemo(
    () => mapValues(
      {
        ...(questionState.question.parametersByName[PHYLETIC_INDENT_MAP_PARAM_NAME] as CheckboxEnumParam).vocabularyMap,
        'ALL': 0
      },
      value => +value
    ),
    [ questionState.question.parametersByName[PHYLETIC_INDENT_MAP_PARAM_NAME] ]
  );

  const { 
    vocabulary: profileVocabulary, 
    vocabularyMap: displayMap 
  } = questionState.question.parametersByName[PHYLETIC_TERM_MAP_PARAM_NAME] as CheckboxEnumParam;

  const includedTerms = useMemo(
    () => questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME] === NO_TERMS
      ? new Set([])
      : questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME] === ALL_ORGANISMS_DISPLAY
      ? new Set([ ALL_ORGANISMS_TERM ])
      : new Set(valueToArray(questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME])),
    [ questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME] ]
  );

  const excludedTerms = useMemo(
    () => questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME] === NO_TERMS
      ? new Set([])
      : questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME] === ALL_ORGANISMS_DISPLAY
      ? new Set([ ALL_ORGANISMS_TERM ])
      : new Set(valueToArray(questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME])),
    [ questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME] ]
  );

  const { profileTree, nodeMap } = useMemo(
    () => paramsToProfileTree(profileVocabulary, depthMap, displayMap),
    [ profileVocabulary, depthMap, displayMap ]
  );

  const constraints = useMemo(
    () => paramsAndTreeToConstraints(profileTree, includedTerms, excludedTerms),
    [ profileTree, includedTerms, excludedTerms ]
  );

  useEffect(
    () => {
      const profilePatternLeaves = Object.keys(constraints)
        .filter(
          term => 
            nodeMap[term].children.length === 0 && (
              constraints[term] === 'include' ||
              constraints[term] === 'exclude'
            )
        )
        .sort()
        .map(
          term => constraints[term] === 'include'
            ? `${term}:Y`
            : `${term}:N`
        );

      const newProfilePatternValue = profilePatternLeaves.length === 0
        ? '%'
        : `%${profilePatternLeaves.join('%')}%`;

      eventHandlers.updateParamValue({
        searchName: questionState.question.urlSegment,
        parameter: questionState.question.parametersByName[PROFILE_PATTERN_PARAM_NAME],
        paramValues: questionState.paramValues,
        paramValue: newProfilePatternValue
      });
    },
    [ constraints ]
  );

  const [ expandedList, setExpandedList ] = useState<string[]>([]);

  const renderNode = useMemo(
    () => makeRenderNode(constraints, nodeMap, profileTree, eventHandlers, questionState),
    [ constraints, nodeMap, profileTree, eventHandlers, questionState ]
  );
  
  return (
    <CheckboxTree<ProfileNode>
      tree={profileTree}
      getNodeId={getNodeId}
      getNodeChildren={getNodeChildren}
      onExpansionChange={setExpandedList}
      renderNode={renderNode}
      expandedList={expandedList}
      showRoot
    />
  );
}

function getNodeId(node: ProfileNode) {
  return node.term;
}

function getNodeChildren(node: ProfileNode) {
  return node.children;
}

function makeRenderNode(
  constraints: Record<string, TermConstraintState>,
  nodeMap: Record<string, ProfileNode>,
  profileTree: ProfileNode,
  eventHandlers: Props['eventHandlers'],
  questionState: Props['state']
) {
  return (node: ProfileNode) => (
    <>
      <span className={cx('ConstraintIcon', constraints[node.term])}
        onClick={e => {
          e.stopPropagation();

          const [ newIncludedTermsParam, newExcludedTermsParam ] = updateProfileTerms(
            node.term,
            nodeMap[node.term],
            constraints[node.term] === 'include'
              ? 'exclude'
              : constraints[node.term] === 'exclude'
              ? 'free'
              : 'include',
            constraints,
            profileTree
          );

          eventHandlers.updateParamValue({
            searchName: questionState.question.urlSegment,
            parameter: questionState.question.parametersByName[INCLUDED_SPECIES_PARAM_NAME],
            paramValues: questionState.paramValues,
            paramValue: newIncludedTermsParam
          });

          eventHandlers.updateParamValue({
            searchName: questionState.question.urlSegment,
            parameter: questionState.question.parametersByName[EXCLUDED_SPECIES_PARAM_NAME],
            paramValues: questionState.paramValues,
            paramValue: newExcludedTermsParam
          });
        }}>  
      </span>
      {node.display}
      <code>({node.term})</code>
    </>
  );
}

type ProfileNode = {
  term: string,
  display: string,
  parent: ProfileNode | null,
  children: ProfileNode[]
};

function paramsToProfileTree(
  profileVocabulary: [string, string, null][],
  depthMap: Record<string, number>,
  displayMap: Record<string, string>
) {
  const profileTree = {
    term: ALL_ORGANISMS_TERM,
    display: ALL_ORGANISMS_DISPLAY,
    parent: null,
    children: []
  } as ProfileNode;

  const nodeMap = {
    [ALL_ORGANISMS_TERM]: profileTree
  } as Record<string, ProfileNode>;

  function traverse(depth: number, currentNode: ProfileNode, vocabIndex: number) {
    if (vocabIndex === profileVocabulary.length) {
      return;
    }

    const [ newTerm ] = profileVocabulary[vocabIndex];
    const newTermDepth = depthMap[newTerm];
    const newTermDisplay = displayMap[newTerm];

    if (currentNode.parent === null || newTermDepth > depth) {
      const newNode = {
        term: newTerm,
        display: newTermDisplay,
        parent: currentNode,
        children: []
      } as ProfileNode;

      currentNode.children.push(newNode);
      nodeMap[newNode.term] = newNode;

      traverse(depth + 1, newNode, vocabIndex + 1);
    } else {
      traverse(depth - 1, currentNode.parent, vocabIndex)
    }
  }

  traverse(0, profileTree, 1);

  return { 
    profileTree,
    nodeMap
  };
}

type TermConstraintState = 'free' | 'include' | 'exclude' | 'mixed';
type Constraints = Record<string, TermConstraintState>;

function paramsAndTreeToConstraints(
  profileTree: ProfileNode,
  includedTerms: Set<string>,
  excludedTerms: Set<string>
) {
  const constraints = {} as Constraints;

  traverseIncludeExclude(profileTree, false, false);
  traverseMixed(profileTree);

  return constraints;

  function traverseIncludeExclude(node: ProfileNode, ancestorIncluded: boolean, ancestorExcluded: boolean) {
    const [ nodeState, included, excluded ]: [ TermConstraintState, boolean, boolean ] = ancestorIncluded || includedTerms.has(node.term)
      ? [ 'include', true, false ]
      : ancestorExcluded || excludedTerms.has(node.term)
      ? [ 'exclude', false, true ]
      : [ 'free', false, false ];

    constraints[node.term] = nodeState;

    node.children.forEach(child => {
      traverseIncludeExclude(child, included, excluded);
    });
  }

  function traverseMixed(node: ProfileNode){
    node.children.forEach(traverseMixed);

    const distinctConstraints = new Set(
      node.children.map(child => constraints[child.term])
    );

    if (distinctConstraints.size >= 2) {
      constraints[node.term] = 'mixed';
    }
  }
}

function updateProfileTerms(
  term: string,
  termNode: ProfileNode,
  newTermConstraint: TermConstraintState,
  constraints: Record<string, TermConstraintState>,
  profileTree: ProfileNode
) {
  const newConstraints = { 
    ...constraints,
    [term]: newTermConstraint
  };
  const newIncludedSpecies = [] as string[];
  const newExcludedSpecies = [] as string[];

  traverseDescendants(termNode);
  traverseAncestors(termNode);
  traverseSpeciesMemberships(profileTree, false, false);

  return [ newIncludedSpecies, newExcludedSpecies ].map(
    terms => terms.length === 0
      ? NO_TERMS
      : terms[0] === ALL_ORGANISMS_TERM
      ? ALL_ORGANISMS_DISPLAY
      : terms.join(', ')
  );

  function traverseDescendants(node: ProfileNode) {
    node.children.forEach(child => {
      newConstraints[child.term] = newTermConstraint;

      traverseDescendants(child);
    });
  }

  function traverseAncestors(node: ProfileNode) {
    if (node.parent !== null) {
      if (node.parent.children.every(child => newConstraints[child.term] === newTermConstraint)) {
        newConstraints[node.parent.term] = newTermConstraint;
      } else {
        newConstraints[node.parent.term] = 'mixed';
      }

      traverseAncestors(node.parent);
    }
  }

  function traverseSpeciesMemberships(
    node: ProfileNode, 
    ancestorIncluded: boolean, 
    ancestorExcluded: boolean
  ) {
    if (newConstraints[node.term] === 'include' && !ancestorIncluded) {
      newIncludedSpecies.push(node.term);

      node.children.forEach(child => {
        traverseSpeciesMemberships(child, true, false);
      });
    } else if (newConstraints[node.term] === 'exclude' && !ancestorExcluded) {
      newExcludedSpecies.push(node.term);

      node.children.forEach(child => {
        traverseSpeciesMemberships(child, false, true);
      });
    } else {
      node.children.forEach(child => {
        traverseSpeciesMemberships(child, ancestorIncluded, ancestorExcluded);
      });
    };
  }
}
