import * as React from 'react';

import { DispatchAction } from '../../Core/CommonTypes';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Seq } from '../../Utils/IterableUtils';
import { Parameter, ParameterGroup } from '../../Utils/WdkModel';
import ParameterComponent from './ParameterComponent';
import { QuestionState } from './QuestionStoreModule';
import { GroupVisibilityChangedAction, ParamValueUpdatedAction } from './QuestionActionCreators';
import { HelpIcon, IconAlt } from '../../Components';

type EventHandlers = {
  setGroupVisibility: typeof GroupVisibilityChangedAction.create,
  updateParamValue: typeof ParamValueUpdatedAction.create
}
import './DefaultQuestionForm.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
}

export default function DefaultQuestionForm(props: Props) {
  const { state, eventHandlers } = props
  return (
    <div className={cx()}>
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
    <div className={cx('ShowHideGroup')} >
      <button
        type="button"
        className={cx('ShowHideGroupToggle')}
        onClick={() => {
          onVisibilityChange({
            questionName,
            groupName: group.name,
            isVisible: !isVisible
          })
        }}
      >
        <IconAlt fa={`caret-${isVisible ? 'down' : 'right'}`}/> {group.displayName}
      </button>
      <div className={cx('ShowHideGroupContent')} >
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
    <div className={cx('ParameterList')}>
      {Seq.from(parameters)
        .map(paramName => parameterMap[paramName])
        .map(parameter => (
          <React.Fragment key={parameter.name}>
            <ParameterHeading parameter={parameter}/>
            <div className={cx('ParameterControl')}>
              <ParameterComponent
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
            </div>
          </React.Fragment>
        ))}
    </div>
  )
}

function ParameterHeading(props: { parameter: Parameter}) {
  const { parameter } = props;
  return (
    <div className={cx('ParameterHeading')} >
      <h2>
        <HelpIcon>{parameter.help}</HelpIcon> {parameter.displayName}
      </h2>
    </div>
  )
}

function getDependentParameters(parameterMap: Record<string, Parameter>, parameter: Parameter): Seq<Parameter> {
  return Seq.from(parameter.dependentParams)
    .map(name => parameterMap[name])
    .flatMap(dependentParameter =>
      Seq.of(dependentParameter).concat(getDependentParameters(parameterMap, dependentParameter)))
}
