import React, { useCallback, useMemo, useState } from 'react';

import produce from 'immer';

import { IconAlt, Loading } from '@veupathdb/wdk-client/lib/Components';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  Props,
  SubmitButton,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import {
  ConstraintState,
  ConstraintStates,
  PhyleticExpressionUiTree,
  cxPhyleticExpression,
  getNextConstraintState,
  getNodeChildren,
  makeInitialConstraintStates,
  makePhyleticExpression,
  makePhyleticExpressionUiTree,
  updateChildConstraintStates,
  updateParentConstraintStates,
} from 'ortho-client/utils/phyleticPattern';
import {
  getTaxonNodeId,
  makeInitialExpandedNodes,
  taxonSearchPredicate,
} from 'ortho-client/utils/taxons';

import './Form.scss';

const cxDefaultQuestionForm = makeClassNameHelper('wdk-QuestionForm');

const PHYLETIC_EXPRESSION_PARAM_NAME = 'phyletic_expression';

export function Form(props: Props) {
  const taxonUiMetadata = useTaxonUiMetadata();

  const phyleticExpressionUiTree = useMemo(
    () =>
      taxonUiMetadata == null
        ? undefined
        : makePhyleticExpressionUiTree(taxonUiMetadata.taxonTree),
    [taxonUiMetadata]
  );

  const updatePhyleticExpressionParam = useCallback(
    (newParamValue: string) => {
      props.eventHandlers.updateParamValue({
        searchName: props.state.question.urlSegment,
        parameter:
          props.state.question.parametersByName[PHYLETIC_EXPRESSION_PARAM_NAME],
        paramValues: props.state.paramValues,
        paramValue: newParamValue,
      });
    },
    [props.eventHandlers, props.state.question, props.state.paramValues]
  );

  const renderParamGroup = useCallback(
    (group: ParameterGroup, formProps: Props) => {
      return (
        <div
          key={group.name}
          className={cxDefaultQuestionForm('ParameterList')}
        >
          <div className={cxDefaultQuestionForm('ParameterControl')}>
            {phyleticExpressionUiTree == null ? (
              <Loading />
            ) : (
              <PhyleticExpressionParameter
                phyleticExpressionTextField={
                  formProps.parameterElements[PHYLETIC_EXPRESSION_PARAM_NAME]
                }
                phyleticExpressionUiTree={phyleticExpressionUiTree}
                submissionMetadata={formProps.submissionMetadata}
                submitButtonText={formProps.submitButtonText}
                submitting={formProps.state.submitting}
                updatePhyleticExpressionParam={updatePhyleticExpressionParam}
              />
            )}
          </div>
        </div>
      );
    },
    [phyleticExpressionUiTree, updatePhyleticExpressionParam]
  );

  return (
    <EbrcDefaultQuestionForm
      {...props}
      containerClassName={`${cxDefaultQuestionForm()} ${cxDefaultQuestionForm(
        'GroupsByPhyleticPattern'
      )}`}
      renderParamGroup={renderParamGroup}
    />
  );
}

interface PhyleticExpressionParameterProps {
  phyleticExpressionTextField: React.ReactNode;
  phyleticExpressionUiTree: PhyleticExpressionUiTree;
  submissionMetadata: Props['submissionMetadata'];
  submitButtonText: Props['submitButtonText'];
  submitting: Props['state']['submitting'];
  updatePhyleticExpressionParam: (newParamValue: string) => void;
}

function PhyleticExpressionParameter({
  phyleticExpressionTextField,
  phyleticExpressionUiTree,
  submissionMetadata,
  submitButtonText,
  submitting,
  updatePhyleticExpressionParam,
}: PhyleticExpressionParameterProps) {
  const [expandedNodes, setExpandedNodes] = useState(() =>
    makeInitialExpandedNodes(phyleticExpressionUiTree)
  );

  const onExpansionChange = useCallback(
    (newExpandedIds: string[]) => {
      setExpandedNodes(
        !newExpandedIds.includes(phyleticExpressionUiTree.abbrev)
          ? [phyleticExpressionUiTree.abbrev, ...newExpandedIds]
          : newExpandedIds
      );
    },
    [phyleticExpressionUiTree]
  );

  const [constraintStates, setConstraintStates] = useState(() =>
    makeInitialConstraintStates(phyleticExpressionUiTree)
  );

  const [searchTerm, setSearchTerm] = useState('');

  const renderNode = useMemo(
    () =>
      makeRenderNode(
        constraintStates,
        setConstraintStates,
        phyleticExpressionUiTree,
        updatePhyleticExpressionParam
      ),
    [constraintStates, phyleticExpressionUiTree, updatePhyleticExpressionParam]
  );

  return (
    <div className={cxPhyleticExpression('--Parameter')}>
      <div className={cxPhyleticExpression('--Instructions')}>
        <p>
          Find Ortholog Groups that have a particular phyletic pattern, i.e.,
          that include or exclude taxa or species that you specify.
        </p>

        <br />

        <p>
          The search is controlled by the Phyletic Pattern Expression (PPE)
          shown in the text box. Use either the text box or the graphical tree
          display, or both, to specify your pattern. The graphical tree display
          is a friendly way to generate a pattern expression. You can always
          edit the expression directly. For PPE help see the instructions above
          under 'Learn More'.
        </p>

        <br />

        <p>In the graphical tree display:</p>

        <ul>
          <li>
            Click on the <IconAlt fa="caret-right" /> icons to show or hide
            subtaxa and species.
          </li>
          <li>
            Click on the <ConstraintIcon constraintType="free" /> icons to
            specify which taxa or species to include or exclude in the profile.
          </li>
          <li>Refer to the legend below to understand other icons.</li>
        </ul>
      </div>
      <div className={cxPhyleticExpression('--TextField')}>
        Expression:
        {phyleticExpressionTextField}
        <div className={cxPhyleticExpression('--SubmitButtonContainer')}>
          <SubmitButton
            submissionMetadata={submissionMetadata}
            submitButtonText={submitButtonText}
            submitting={submitting}
          />
        </div>
      </div>
      <div className={cxPhyleticExpression('--IconLegend')}>
        <div className={cxPhyleticExpression('--IconLegendHeader')}>Key:</div>
        <div className={cxPhyleticExpression('--IconLegendContents')}>
          <ConstraintIcon constraintType="free" /> = no constraints |
          <ConstraintIcon constraintType="include-all" /> = must be in group |
          <ConstraintIcon constraintType="include-at-least-one" /> = at least
          one subtaxon must be in group |
          <ConstraintIcon constraintType="exclude" /> = must not be in group |
          <ConstraintIcon constraintType="mixed" /> = mixture of constraints
        </div>
      </div>
      <CheckboxTree
        tree={phyleticExpressionUiTree}
        getNodeId={getTaxonNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={onExpansionChange}
        shouldExpandOnClick={false}
        expandedList={expandedNodes}
        renderNode={renderNode}
        isSearchable
        searchBoxPlaceholder="Type a taxonomic name"
        searchBoxHelp={makeSearchHelpText('the taxons below')}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchPredicate={taxonSearchPredicate}
        showRoot
        linksPosition={LinksPosition.Top}
      />
    </div>
  );
}

function makeRenderNode(
  constraintStates: ConstraintStates,
  setConstraintStates: (newConstraintStates: ConstraintStates) => void,
  phyleticExpressionUiTree: PhyleticExpressionUiTree,
  updatePhyleticExpressionParam: (newParamValue: string) => void
) {
  return function (node: PhyleticExpressionUiTree, path: number[] | undefined) {
    const containerClassName = cxPhyleticExpression(
      '--Node',
      path?.length === 1 ? 'root' : 'interior',
      node.species && 'species'
    );

    const constraintClassName = cxPhyleticExpression('--NodeConstraint');

    const descriptionClassName = cxPhyleticExpression('--NodeDescription');

    const onConstraintChange = () => {
      const newConstraintStates = produce(
        constraintStates,
        (draftConstraintStates) => {
          const changedState = getNextConstraintState(
            constraintStates[node.abbrev],
            node.species
          );

          draftConstraintStates[node.abbrev] = changedState;
          updateParentConstraintStates(
            node,
            draftConstraintStates,
            changedState
          );
          updateChildConstraintStates(
            node,
            draftConstraintStates,
            changedState
          );
        }
      );

      const newPhyleticExpression = makePhyleticExpression(
        phyleticExpressionUiTree,
        newConstraintStates
      );

      setConstraintStates(newConstraintStates);
      updatePhyleticExpressionParam(newPhyleticExpression);
    };

    return (
      <div className={containerClassName}>
        <ConstraintIcon
          constraintType={constraintStates[node.abbrev]}
          containerClassName={constraintClassName}
          onClick={onConstraintChange}
        />
        <span className={descriptionClassName}>
          {node.name}
          &nbsp;
          <code>({node.abbrev})</code>
        </span>
      </div>
    );
  };
}

interface ConstraintIconProps {
  constraintType: ConstraintState;
  containerClassName?: string;
  onClick?: () => void;
}

function ConstraintIcon({
  constraintType,
  containerClassName,
  onClick,
}: ConstraintIconProps) {
  const baseClassName = cxPhyleticExpression(
    '--ConstraintIcon',
    constraintType
  );

  const className =
    containerClassName == null
      ? baseClassName
      : `${containerClassName} ${baseClassName}`;

  return (
    <span className={className} onClick={onClick}>
      <IconAlt fa={getContrainstIconFaClass(constraintType)} />
    </span>
  );
}

function getContrainstIconFaClass(constraintType: ConstraintState) {
  if (constraintType === 'free') {
    return 'circle';
  } else if (
    constraintType === 'include-all' ||
    constraintType === 'include-at-least-one'
  ) {
    return 'check';
  } else if (constraintType === 'exclude') {
    return 'remove';
  } else {
    return 'asterisk';
  }
}
