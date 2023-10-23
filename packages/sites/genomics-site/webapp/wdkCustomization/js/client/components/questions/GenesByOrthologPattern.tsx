import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import {
  CheckBoxEnumParam,
  ParameterGroup,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import './GenesByOrthologPattern.scss';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

const cx = makeClassNameHelper('GenesByOrthologPattern');
const cxDefaultQuestionForm = makeClassNameHelper('wdk-QuestionForm');

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
  const renderParamGroup = useCallback(
    (group: ParameterGroup, formProps: Props) => {
      return (
        <div
          key={group.name}
          className={cxDefaultQuestionForm('ParameterList')}
        >
          <div className={cxDefaultQuestionForm('ParameterHeading')}>
            <h2>
              <HelpIcon>
                Find genes in these organisms that belong to an ortholog group
                with the profile you select below
              </HelpIcon>{' '}
              Find genes in these organisms
            </h2>
          </div>
          <div className={cxDefaultQuestionForm('ParameterControl')}>
            {formProps.parameterElements[ORGANISM_PARAM_NAME]}
          </div>
          <div className={cxDefaultQuestionForm('ParameterHeading')}>
            <h2>
              <HelpIcon>
                If you do not force the inclusion of any organism you will get
                back all genes, since each gene is in a group by itself.
              </HelpIcon>{' '}
              Select orthology profile
            </h2>
          </div>
          <div className={cxDefaultQuestionForm('ParameterControl')}>
            <ProfileParameter
              questionState={formProps.state}
              eventHandlers={formProps.eventHandlers}
            />
          </div>
        </div>
      );
    },
    []
  );

  return (
    <EbrcDefaultQuestionForm {...props} renderParamGroup={renderParamGroup} />
  );
};

type ProfileParameterProps = {
  questionState: Props['state'];
  eventHandlers: Props['eventHandlers'];
};

function getSpeciesTerms(speciesParamValue: string): Set<string> {
  return speciesParamValue === NO_TERMS
    ? new Set([])
    : speciesParamValue === ALL_ORGANISMS_DISPLAY
    ? new Set([ALL_ORGANISMS_TERM])
    : new Set(
        speciesParamValue
          .split(',')
          .map((species) => species.trim())
          .filter((species) => species.length > 0)
      );
}
function ProfileParameter({
  questionState,
  eventHandlers,
}: ProfileParameterProps) {
  const { vocabulary: profileVocabulary } = questionState.question
    .parametersByName[PHYLETIC_TERM_MAP_PARAM_NAME] as CheckBoxEnumParam;

  const { vocabulary: indentVocabulary } = questionState.question
    .parametersByName[PHYLETIC_INDENT_MAP_PARAM_NAME] as CheckBoxEnumParam;

  const depthMap = useMemo(
    () =>
      indentVocabulary.reduce(
        (depthMap, entry) =>
          Object.assign(depthMap, { [entry[0]]: Number(entry[1]) }),
        { [ALL_ORGANISMS_TERM]: 0 }
      ),
    [indentVocabulary]
  );

  const displayMap = useMemo(
    () =>
      profileVocabulary.reduce(
        (displayMap, entry) =>
          Object.assign(displayMap, { [entry[0]]: entry[1] }),
        {} as Record<string, string>
      ),
    [profileVocabulary]
  );

  const includedTerms = useMemo(
    () =>
      getSpeciesTerms(questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME]),
    [questionState.paramValues[INCLUDED_SPECIES_PARAM_NAME]]
  );

  const excludedTerms = useMemo(
    () =>
      getSpeciesTerms(questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME]),
    [questionState.paramValues[EXCLUDED_SPECIES_PARAM_NAME]]
  );

  const { profileTree, nodeMap } = useMemo(
    () => paramsToProfileTree(profileVocabulary, depthMap, displayMap),
    [profileVocabulary, depthMap, displayMap]
  );

  const constraints = useMemo(
    () => paramsAndTreeToConstraints(profileTree, includedTerms, excludedTerms),
    [profileTree, includedTerms, excludedTerms]
  );

  useEffect(() => {
    const profilePatternLeaves = Object.keys(constraints)
      .filter(
        (term) =>
          nodeMap[term].children.length === 0 &&
          (constraints[term] === 'include' || constraints[term] === 'exclude')
      )
      .sort()
      .map((term) =>
        constraints[term] === 'include' ? `${term}:Y` : `${term}:N`
      );

    const newProfilePatternValue =
      profilePatternLeaves.length === 0
        ? '%'
        : `%${profilePatternLeaves.join('%')}%`;

    eventHandlers.updateParamValue({
      searchName: questionState.question.urlSegment,
      parameter:
        questionState.question.parametersByName[PROFILE_PATTERN_PARAM_NAME],
      paramValues: questionState.paramValues,
      paramValue: newProfilePatternValue,
    });
  }, [constraints]);

  const initialExpandedList = useMemo(
    () => getInitialExpandedList(depthMap),
    [depthMap]
  );

  const [expandedList, setExpandedList] =
    useState<string[]>(initialExpandedList);

  const onExpansionChange = useCallback((newExpandedList: string[]) => {
    setExpandedList([ALL_ORGANISMS_TERM, ...newExpandedList]);
  }, []);

  useEffect(() => {
    setExpandedList(initialExpandedList);
  }, [depthMap]);

  const renderNode = useMemo(
    () =>
      makeRenderNode(
        constraints,
        nodeMap,
        profileTree,
        eventHandlers,
        questionState
      ),
    [constraints, nodeMap, profileTree, eventHandlers, questionState]
  );

  const [searchTerm, setSearchTerm] = useState('');

  const searchPredicate = useCallback(
    (node: ProfileNode, searchTerms: string[]) => {
      return areTermsInString(searchTerms, node.display + ' ' + node.term);
    },
    []
  );

  return (
    <div className={cx('ProfileParameter')}>
      <div className={cx('ProfileParameterHelp')}>
        <div>
          Click on <ConstraintIcon constraintType="free" /> to determine which
          organisms to include or exclude in the orthology profile.
        </div>
        <div className={cx('ConstraintIconLegend')}>
          (
          <ConstraintIcon constraintType="free" /> = no constraints |
          <ConstraintIcon constraintType="include" /> = must be in group |
          <ConstraintIcon constraintType="exclude" /> = must not be in group |
          <ConstraintIcon constraintType="mixed" /> = mixture of constraints )
        </div>
      </div>
      <CheckboxTree<ProfileNode>
        tree={profileTree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={onExpansionChange}
        renderNode={renderNode}
        expandedList={expandedList}
        showRoot
        linksPosition={LinksPosition.Top}
        isSearchable
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchPredicate={searchPredicate}
      />
    </div>
  );
}

function getInitialExpandedList(depthMap: Record<string, number>) {
  return Object.entries(depthMap)
    .filter(([term, depth]) => depth <= 1)
    .map(([term]) => term);
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
      <ConstraintIcon
        constraintType={constraints[node.term]}
        onClick={() => {
          const [newIncludedTermsParam, newExcludedTermsParam] =
            updateProfileTerms(
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
            parameter:
              questionState.question.parametersByName[
                INCLUDED_SPECIES_PARAM_NAME
              ],
            paramValues: questionState.paramValues,
            paramValue: newIncludedTermsParam,
          });

          eventHandlers.updateParamValue({
            searchName: questionState.question.urlSegment,
            parameter:
              questionState.question.parametersByName[
                EXCLUDED_SPECIES_PARAM_NAME
              ],
            paramValues: questionState.paramValues,
            paramValue: newExcludedTermsParam,
          });
        }}
      />
      <span
        className={cx(
          'ProfileNodeDisplay',
          node.term === ALL_ORGANISMS_TERM ? 'root-node' : 'interior-node'
        )}
      >
        {node.display}
      </span>
      {node.term !== ALL_ORGANISMS_TERM && <code>({node.term})</code>}
    </>
  );
}

type ConstraintIconProps = {
  constraintType: TermConstraintState;
  onClick?: () => void;
};

function ConstraintIcon({ constraintType, onClick }: ConstraintIconProps) {
  const onClickSpan = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        e.stopPropagation();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <span
      className={cx('ConstraintIcon', constraintType)}
      onClick={onClickSpan}
    ></span>
  );
}

type ProfileNode = {
  term: string;
  display: string;
  parent: ProfileNode | null;
  children: ProfileNode[];
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
    children: [],
  } as ProfileNode;

  const nodeMap = {
    [ALL_ORGANISMS_TERM]: profileTree,
  } as Record<string, ProfileNode>;

  function traverse(
    depth: number,
    currentNode: ProfileNode,
    vocabIndex: number
  ) {
    if (vocabIndex === profileVocabulary.length) {
      return;
    }

    const [newTerm] = profileVocabulary[vocabIndex];
    const newTermDepth = depthMap[newTerm];
    const newTermDisplay = displayMap[newTerm];

    if (currentNode.parent === null || newTermDepth > depth) {
      const newNode = {
        term: newTerm,
        display: newTermDisplay,
        parent: currentNode,
        children: [],
      } as ProfileNode;

      currentNode.children.push(newNode);
      nodeMap[newNode.term] = newNode;

      traverse(depth + 1, newNode, vocabIndex + 1);
    } else {
      traverse(depth - 1, currentNode.parent, vocabIndex);
    }
  }

  traverse(0, profileTree, 1);

  return {
    profileTree,
    nodeMap,
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

  function traverseIncludeExclude(
    node: ProfileNode,
    ancestorIncluded: boolean,
    ancestorExcluded: boolean
  ) {
    const [nodeState, included, excluded]: [
      TermConstraintState,
      boolean,
      boolean
    ] =
      ancestorIncluded || includedTerms.has(node.term)
        ? ['include', true, false]
        : ancestorExcluded || excludedTerms.has(node.term)
        ? ['exclude', false, true]
        : ['free', false, false];

    constraints[node.term] = nodeState;

    node.children.forEach((child) => {
      traverseIncludeExclude(child, included, excluded);
    });
  }

  function traverseMixed(node: ProfileNode) {
    node.children.forEach(traverseMixed);

    const distinctConstraints = new Set(
      node.children.map((child) => constraints[child.term])
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
    [term]: newTermConstraint,
  };
  const newIncludedSpecies = [] as string[];
  const newExcludedSpecies = [] as string[];

  traverseDescendants(termNode);
  traverseAncestors(termNode);
  traverseSpeciesMemberships(profileTree, false, false);

  return [newIncludedSpecies, newExcludedSpecies].map((terms) =>
    terms.length === 0
      ? NO_TERMS
      : terms[0] === ALL_ORGANISMS_TERM
      ? ALL_ORGANISMS_DISPLAY
      : terms.join(', ')
  );

  function traverseDescendants(node: ProfileNode) {
    node.children.forEach((child) => {
      newConstraints[child.term] = newTermConstraint;

      traverseDescendants(child);
    });
  }

  function traverseAncestors(node: ProfileNode) {
    if (node.parent !== null) {
      if (
        node.parent.children.every(
          (child) => newConstraints[child.term] === newTermConstraint
        )
      ) {
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

      node.children.forEach((child) => {
        traverseSpeciesMemberships(child, true, false);
      });
    } else if (newConstraints[node.term] === 'exclude' && !ancestorExcluded) {
      newExcludedSpecies.push(node.term);

      node.children.forEach((child) => {
        traverseSpeciesMemberships(child, false, true);
      });
    } else {
      node.children.forEach((child) => {
        traverseSpeciesMemberships(child, ancestorIncluded, ancestorExcluded);
      });
    }
  }
}
