import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { CheckboxTree, Loading } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { mapStructure } from 'wdk-client/Utils/TreeUtils';
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
  const renderParamGroup = useCallback((group: ParameterGroup, formProps: Props) => {
    return (
      <div key={group.name} className={cxDefaultQuestionForm('ParameterList')}>
        <div className={cxDefaultQuestionForm('ParameterControl')}>
          <PhyleticExpressionParameter
            phyleticExpressionTextField={formProps.parameterElements[PHYLETIC_EXPRESSION_PARAM_NAME]}
          />
        </div>
      </div>
    );
  }, []);

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
}

function PhyleticExpressionParameter(props: PhyleticExpressionParameterProps) {
  const taxonUiMetadata = useTaxonUiMetadata();

  const [ expandedNodes, setExpandedNodes ] = useState([] as string[]);

  const initialPhyleticExpressionUiTree = useMemo(
    () => taxonUiMetadata == null
      ? undefined
      : makePhyleticExpressionUiTree(taxonUiMetadata.taxonTree),
    [ taxonUiMetadata ]
  );

  const [ phyleticExpressionUiTree, setPhyleticExpressionUiTree ] = useState(initialPhyleticExpressionUiTree);

  useEffect(() => {
    setPhyleticExpressionUiTree(initialPhyleticExpressionUiTree);
  }, [ initialPhyleticExpressionUiTree ]);

  return phyleticExpressionUiTree == null
    ? <Loading />
    : <div className="PhyleticExpressionParameter">
        {props.phyleticExpressionTextField}
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
      </div>;
}

type ConstraintState =
  | 'free'
  | 'include-at-least-one'
  | 'include-all'
  | 'exclude'
  | 'mixed';

interface PhyleticExpressionUiTree extends TaxonTree {
  children: PhyleticExpressionUiTree[];
  constraintState: ConstraintState;
  speciesCount: number;
}

function makePhyleticExpressionUiTree(taxonTree: TaxonTree): PhyleticExpressionUiTree {
  return mapStructure(
    (node, mappedChildren) => ({
      ...node,
      children: orderBy(
        mappedChildren,
        child => child.species,
        'desc'
      ),
      constraintState: 'free',
      speciesCount: node.species
        ? 1
        : mappedChildren.reduce(
            (memo, { speciesCount }) => memo + speciesCount,
            0
          )
    }),
    taxonTree => taxonTree.children,
    taxonTree
  );
}

function getNodeId(node: PhyleticExpressionUiTree) {
  return node.abbrev;
}

function getNodeChildren(node: PhyleticExpressionUiTree) {
  return node.children;
}

function renderNode(node: PhyleticExpressionUiTree, path: number[] | undefined) {
  const containerClassName = cxPhyleticExpression(
    '--Node',
    path?.length === 1 ? 'root' : 'interior',
    node.species && 'species'
  );

  const constraintClassName = cxPhyleticExpression(
    '--NodeConstraint',
    node.constraintState
  );

  return (
    <div className={containerClassName}>
      <span className={constraintClassName}></span>
      <span>{node.name} ({node.abbrev})</span>
    </div>
  );
}
