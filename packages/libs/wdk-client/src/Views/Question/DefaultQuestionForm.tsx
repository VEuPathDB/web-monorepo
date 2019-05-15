import * as React from 'react';

import { HelpIcon, IconAlt } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper, safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { QuestionWithParameters, Parameter, ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { QuestionState, QuestionWithMappedParameters } from 'wdk-client/StoreModules/QuestionStoreModule';
import {
  changeGroupVisibility,
  updateParamValue,
  submitQuestion,
  updateCustomQuestionName,
  updateQuestionWeight
} from 'wdk-client/Actions/QuestionActions';
import 'wdk-client/Views/Question/DefaultQuestionForm.scss';
import { TooltipPosition } from 'wdk-client/Components/Overlays/Tooltip';

type TextboxChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;

type EventHandlers = {
  setGroupVisibility: typeof changeGroupVisibility,
  updateParamValue: typeof updateParamValue
}

export type Props = {
  state: QuestionState;
  dispatchAction: DispatchAction;
  eventHandlers: EventHandlers;
  parameterElements: Record<string, React.ReactNode>;
  renderParamGroup?: (group: ParameterGroup, formProps: Props) => JSX.Element;
}

const cx = makeClassNameHelper('wdk-QuestionForm');
const tooltipPosition = { my: 'right center', at: 'left center' };

export default function DefaultQuestionForm(props: Props) {

  const { dispatchAction, state } = props;
  const { question, customName, weight } = state;

  let handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchAction(submitQuestion({ searchName: question.urlSegment }));
  }

  let handleCustomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateCustomQuestionName({ searchName: question.urlSegment, customName: event.target.value }));
  }

  let handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateQuestionWeight({ searchName: question.urlSegment, weight: event.target.value }));
  }

  let renderParamGroup = props.renderParamGroup ? props.renderParamGroup : renderDefaultParamGroup;

  return (
    <div className={cx()}>
      <h1>{question.displayName}</h1>
      <form onSubmit={handleSubmit}>
        {question.groups
          .filter(group => group.displayType !== 'hidden')
          .map(group => renderParamGroup(group, props))
        }
        <SubmitSection
          className={cx('SubmitSection')}
          tooltipPosition={tooltipPosition}
          customName={customName}
          weight={weight}
          handleCustomNameChange={handleCustomNameChange}
          handleWeightChange={handleWeightChange}
        />
        <QuestionDescription description={question.description}/>
      </form>
    </div>
  );
}

export function renderDefaultParamGroup(group: ParameterGroup, formProps: Props) {
  let { state, eventHandlers, parameterElements } = formProps;
  let { question, groupUIState } = state;
  return (
    <DefaultGroup
      question={question}
      group={group}
      uiState={groupUIState[group.name]}
      onVisibilityChange={eventHandlers.setGroupVisibility}
      parameterElements={parameterElements}
    />
  );
}

type DefaultGroupProps = {
  question: QuestionWithMappedParameters;
  group: ParameterGroup;
  uiState: any;
  onVisibilityChange: EventHandlers['setGroupVisibility'];
  parameterElements: Record<string, React.ReactNode>;
}

export function DefaultGroup(props: DefaultGroupProps) {
  let { question, group, uiState, onVisibilityChange, parameterElements } = props;
  return (
    <Group
      key={group.name}
      searchName={question.urlSegment}
      group={group}
      uiState={uiState}
      onVisibilityChange={onVisibilityChange}
    >
      <ParameterList
        parameterMap={question.parametersByName}
        parameterElements={parameterElements}
        parameters={group.parameters}
      />
    </Group>
  );
}

type GroupProps = {
  searchName: string;
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
  const { searchName, group, uiState: { isVisible }, onVisibilityChange } = props;
  return (
    <div className={cx('ShowHideGroup')} >
      <button
        type="button"
        className={cx('ShowHideGroupToggle')}
        onClick={() => {
          onVisibilityChange({
            searchName,
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
  parameters: string[];
  parameterMap: Record<string, Parameter>;
  parameterElements: Record<string, React.ReactNode>;
}

export function ParameterList(props: ParameterListProps) {
  const { parameters, parameterMap, parameterElements } = props;
  return (
    <div className={cx('ParameterList')}>
      {Seq.from(parameters)
        .map(paramName => parameterMap[paramName])
        .map(parameter => (
          <React.Fragment key={parameter.name}>
            <ParameterHeading parameter={parameter}/>
            <div className={cx('ParameterControl')}>
              {parameterElements[parameter.name]}
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

export function SubmitButton() {
  return (
    <button type="submit" className="btn">
      Get Answer
    </button>
  );
}

interface SearchNameInputProps {
  tooltipPosition: TooltipPosition;
  customName?: string;
  handleCustomNameChange: TextboxChangeHandler;
}

export function SearchNameInput(props: SearchNameInputProps) {
  let { tooltipPosition, customName, handleCustomNameChange } = props;
  return (
    <div>
      <HelpIcon tooltipPosition={tooltipPosition}>
        Give this search strategy a custom name. The name will appear in the
        first step box (truncated to 15 characters).
      </HelpIcon>
      <input
        type="text"
        placeholder="Give this search a name (optional)"
        value={customName}
        onChange={handleCustomNameChange}
      />
    </div>
  );
}

interface WeightInputProps {
  tooltipPosition: TooltipPosition;
  weight?: string;
  handleWeightChange: TextboxChangeHandler;
}

export function WeightInput(props: WeightInputProps) {
  let { tooltipPosition, weight, handleWeightChange } = props;
  return (
    <div>
      <HelpIcon tooltipPosition={tooltipPosition}>
        Give this search a weight (for example 10, 200, -50, integer only). It
        will show in a column in your result. In a search strategy, unions and
        intersects will sum the weights, giving higher scores to items found in
        multiple searches. Default weight is 10.
      </HelpIcon>
      <input
        type="text"
        pattern="[+-]?\d*"
        placeholder="Give this search a weight (optional)"
        value={weight}
        onChange={handleWeightChange}
      />
    </div>
  );
}

export function QuestionDescription(props: { description?: string }) {
  return !props.description ? null : (
    <div>
      <hr/>
      <h2>Description</h2>
      {safeHtml(props.description)}
    </div>
  );
}

interface SubmitSectionProps {
  className: string;
  tooltipPosition: TooltipPosition;
  customName?: string;
  weight?: string;
  handleCustomNameChange: TextboxChangeHandler;
  handleWeightChange: TextboxChangeHandler;
}

export function SubmitSection(props: SubmitSectionProps) {
  let { className, tooltipPosition, customName, handleCustomNameChange, weight, handleWeightChange } = props;
  return (
    <div className={className}>
      <SubmitButton/>
      <SearchNameInput
        tooltipPosition={tooltipPosition}
        customName={customName}
        handleCustomNameChange={handleCustomNameChange}
      />
      <WeightInput
        tooltipPosition={tooltipPosition}
        weight={weight}
        handleWeightChange={handleWeightChange}
      />
    </div>
  );
}
