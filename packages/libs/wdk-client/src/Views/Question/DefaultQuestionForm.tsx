import * as React from 'react';

import { DispatchAction } from '../../Core/CommonTypes';
import { Seq } from '../../Utils/IterableUtils';
import { Parameter, ParameterGroup } from '../../Utils/WdkModel';
import ParameterControl from './ParameterControl';
import { EventHandlers } from './QuestionController';
import { QuestionState } from './QuestionStore';


type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
}

export default function DefaultQuestionForm(props: Props) {
  const { state, eventHandlers } = props
  return (
    <div className="wdk-QuestionForm">
    <h1>{state.question.displayName}</h1>
    {state.question.groups
      .filter(group => group.displayType !== 'hidden')
      .map(group =>
        <Group
          key={group.name}
          questionName={state.question.urlSegment}
          group={group}
          uiState={state.groupUIState[group.name]}
          onVisibilityChange={eventHandlers.setGroupVisibility}
        >
          <ParameterList
            questionName={state.question.urlSegment}
            dispatch={props.dispatchAction}
            parameterMap={state.question.parametersByName}
            parameters={group.parameters}
            paramValues={state.paramValues}
            paramUIState={state.paramUIState}
            onParamValueChange={eventHandlers.updateParamValue}
          />
        </Group>
      )
    }
    </div>
  )
}

type GroupProps = {
  questionName: string;
  group: ParameterGroup;
  uiState: any;
  onVisibilityChange: EventHandlers['setGroupVisibility'];
  children: React.ReactChild;
}

function Group(props: GroupProps) {
  switch(props.group.displayType) {
    case 'ShowHide':
      return <ShowHideGroup {...props}/>

    default:
      return <div>{props.children}</div>;
  }
}

function ShowHideGroup(props: GroupProps) {
  const { questionName, group, uiState: { isVisible }, onVisibilityChange } = props;
  return (
    <div
      style={{
        border: '1px solid #eaeaea',
        backgroundColor: '#f0f0f0',
        marginTop: '.5em'
      }}
    >
      <button
        type="button"
        style={{
          padding: '.5rem 1.5rem',
          cursor: 'pointer',
          fontSize: '1.2em',
          fontWeight: 'bold',
          display: 'block',
          textAlign: 'left',
          background: 'transparent',
          borderColor: 'transparent',
          width: '100%'
        }}
        onClick={() => {
          onVisibilityChange({
            questionName,
            groupName: group.name,
            isVisible: !isVisible
          })
        }}
      >
        <i className={'fa fa-caret-' + (isVisible ? 'down' : 'right')}/> {group.displayName}
      </button>
      <div
        style={{
          padding: '0 1.5rem'
        }}
      >
        {isVisible ? props.children : null}
      </div>
    </div>
  )
}


type ParameterListProps = {
  questionName: string;
  parameters: string[];
  parameterMap: Record<string, Parameter>;
  paramValues: Record<string, string>;
  paramUIState: Record<string, any>;
  onParamValueChange: EventHandlers['updateParamValue'];
  dispatch: DispatchAction;
}
function ParameterList(props: ParameterListProps) {
  const { dispatch, parameters, parameterMap, paramValues, paramUIState, questionName, onParamValueChange } = props;
  return (
    <div style={{ paddingBottom: '.5rem' }}>
      {Seq.from(parameters)
        .map(paramName => parameterMap[paramName])
        .map(parameter => (
          <ParameterControl
            key={parameter.name}
            ctx={{
              questionName,
              parameter,
              paramValues
            }}
            parameter={parameter}
            value={paramValues[parameter.name]}
            uiState={paramUIState[parameter.name]}
            onParamValueChange={paramValue => {
              onParamValueChange({
                questionName,
                parameter,
                dependentParameters: getDependentParameters(parameterMap, parameter).toArray(),
                paramValues,
                paramValue
              })
            }}
            dispatch={dispatch}
          />
        ))}
    </div>
  )
}

function getDependentParameters(parameterMap: Record<string, Parameter>, parameter: Parameter): Seq<Parameter> {
  return Seq.from(parameter.dependentParams)
    .map(name => parameterMap[name])
    .flatMap(dependentParameter =>
      Seq.of(dependentParameter).concat(getDependentParameters(parameterMap, dependentParameter)))
}