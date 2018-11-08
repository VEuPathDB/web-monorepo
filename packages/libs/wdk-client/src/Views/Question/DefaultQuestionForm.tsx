import * as React from 'react';

import { HelpIcon, IconAlt } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper, safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { Parameter, ParameterGroup } from 'wdk-client/Utils/WdkModel';
import ParameterComponent from 'wdk-client/Views/Question/ParameterComponent';
import { QuestionState } from 'wdk-client/Views/Question/QuestionStoreModule';
import {
  changeGroupVisibility,
  updateParamValue,
  submitQuestion,
  updateCustomQuestionName,
  updateQuestionWeight
} from 'wdk-client/Actions/QuestionActions';
import 'wdk-client/Views/Question/DefaultQuestionForm.scss';

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
}

type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
}

const cx = makeClassNameHelper('wdk-QuestionForm');
const tooltipPosition = { my: 'right center', at: 'left center' };

export default class DefaultQuestionForm extends React.Component<Props> {

  handleSubmit = (e: React.FormEvent) => {
    const { dispatchAction, state: { question } } = this.props;
    e.preventDefault();
    dispatchAction(submitQuestion({ questionName: question.urlSegment }));
  }

  handleCustomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatchAction, state: { question } } = this.props;
    dispatchAction(updateCustomQuestionName({ questionName: question.urlSegment, customName: event.target.value }));
  }

  handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatchAction, state: { question } } = this.props;
    dispatchAction(updateQuestionWeight({ questionName: question.urlSegment, weight: event.target.value }));
  }

  render() {
    const { state, eventHandlers, dispatchAction } = this.props
    const { customName, groupUIState, paramValues, paramUIState, question, weight } = state;
    return (
      <div className={cx()}>
        <h1>{question.displayName}</h1>
        <form onSubmit={this.handleSubmit}>
          {question.groups
            .filter(group => group.displayType !== 'hidden')
            .map(group =>
              <Group
                key={group.name}
                questionName={question.urlSegment}
                group={group}
                uiState={groupUIState[group.name]}
                onVisibilityChange={eventHandlers.setGroupVisibility}
              >
                <ParameterList
                  questionName={question.urlSegment}
                  dispatch={dispatchAction}
                  parameterMap={question.parametersByName}
                  parameters={group.parameters}
                  paramValues={paramValues}
                  paramUIState={paramUIState}
                  onParamValueChange={eventHandlers.updateParamValue}
                />
              </Group>
            )
          }
          <div className={cx('SubmitSection')}>
            <button type="submit" className="btn">
              Get Answer
            </button>
            <div>
              <HelpIcon tooltipPosition={tooltipPosition}>Give this search strategy a custom name. The name will appear in the first step box (truncated to 15 characters).</HelpIcon>
              <input
                type="text"
                placeholder="Give this search a name (optional)"
                value={customName}
                onChange={this.handleCustomNameChange}
              />
            </div>
            <div>
              <HelpIcon tooltipPosition={tooltipPosition}>Give this search a weight (for example 10, 200, -50, integer only). It will show in a column in your result. In a search strategy, unions and intersects will sum the weights, giving higher scores to items found in multiple searches. Default weight is 10.</HelpIcon>
              <input
                type="text"
                pattern="[+-]?\d*"
                placeholder="Give this search a weight (optional)"
                value={weight}
                onChange={this.handleWeightChange}
              />
            </div>
          </div>
          {question.description && (
            <div>
              <hr/>
              <h2>Description</h2>
              {safeHtml(question.description)}
            </div>
          )}
        </form>
      </div>
    )
  }
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

