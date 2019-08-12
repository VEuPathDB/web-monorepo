import * as React from 'react';

import { HelpIcon, IconAlt, Link } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper, safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { Parameter, ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { QuestionState, QuestionWithMappedParameters } from 'wdk-client/StoreModules/QuestionStoreModule';
import {
  changeGroupVisibility,
  updateParamValue,
  submitQuestion,
  updateCustomQuestionName,
  updateQuestionWeight,
  SubmissionMetadata
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
  submissionMetadata: SubmissionMetadata;
  renderParamGroup?: (group: ParameterGroup, formProps: Props) => JSX.Element;
  onSubmit?: (e: React.FormEvent) => void;
}

const cx = makeClassNameHelper('wdk-QuestionForm');
const tooltipPosition = { my: 'right center', at: 'left center' };

// FIXME Should be made nicer once we upgrade to a version of Redux that supports hooks
export const useDefaultOnSubmit = (dispatchAction: DispatchAction, urlSegment: string, submissionMetadata: SubmissionMetadata) =>
  React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      dispatchAction(submitQuestion({ searchName: urlSegment, submissionMetadata }));
    },
    [ dispatchAction, urlSegment, submissionMetadata ]
  );

export default function DefaultQuestionForm(props: Props) {

  const { dispatchAction, onSubmit, submissionMetadata, state } = props;
  const { question, customName, paramValues, weight } = state;

  let defaultOnSubmit = useDefaultOnSubmit(dispatchAction, question.urlSegment, submissionMetadata);

  let handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      if (onSubmit) {
        onSubmit(event);
      }

      defaultOnSubmit(event);
    },
    [ defaultOnSubmit ]
  );

  let handleCustomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateCustomQuestionName({ searchName: question.urlSegment, customName: event.target.value }));
  }

  let handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateQuestionWeight({ searchName: question.urlSegment, weight: event.target.value }));
  }

  let renderParamGroup = props.renderParamGroup ? props.renderParamGroup : renderDefaultParamGroup;

  return (
    <div className={cx()}>
      <QuestionHeader
        showHeader={submissionMetadata.type === 'create-strategy' || submissionMetadata.type === 'edit-step'}
        headerText={question.displayName}
      />
      <form onSubmit={handleSubmit}>
        {question.groups
          .filter(group => group.displayType !== 'hidden')
          .map(group => renderParamGroup(group, props))
        }
        <SubmitSection
          className={cx('SubmitSection')}
          tooltipPosition={tooltipPosition}
          customName={customName}
          searchName={question.urlSegment}
          paramValues={paramValues}
          weight={weight}
          handleCustomNameChange={handleCustomNameChange}
          handleWeightChange={handleWeightChange}
          submissionMetadata={submissionMetadata}
        />
        <QuestionDescription description={question.description}/>
      </form>
    </div>
  );
}

export function QuestionHeader(props: { headerText: string, showHeader: boolean }) {
  return props.showHeader
    ? <h1>{props.headerText}</h1>
    : <></>;
}

export function renderDefaultParamGroup(group: ParameterGroup, formProps: Props) {
  let { state, eventHandlers, parameterElements } = formProps;
  let { question, groupUIState } = state;
  return (
    <DefaultGroup
      key={group.name}
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

export function Group(props: GroupProps) {
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

export function SubmitButton(props: { submissionMetadata: SubmissionMetadata }) {
  return (
    <button type="submit" className="btn">
      {
        props.submissionMetadata.type === 'create-strategy'
          ? 'Get Answer'
          : 'Run Step'
      }
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

interface WebServicesTutorialLinkProps {
  searchName: string;
  paramValues: Record<string,string>;
  weight: string;
}

function WebServicesTutorialLink(props: WebServicesTutorialLinkProps) {
  let { searchName, paramValues, weight } = props;
  weight = (weight === "" ? "0" : weight);
  let queryString =
    "searchName=" + searchName +
    "&weight=" + weight +
    Object.keys(paramValues).map(
      paramName => "&" + paramName + "=" + encodeURIComponent(paramValues[paramName]));
  let link = "/web-services-help?" + queryString;
  return (
    <div style={{marginBottom:"5px"}}>
      <Link
        to={link}
        title="Build a Web Services URL from this Search"
        className="wdk-ReactRouterLink wdk-RecordActionLink"
        replace={false}>
        Build a Web Services URL from this Search >>
      </Link>
    </div>
  );
}

interface SubmitSectionProps {
  className: string;
  tooltipPosition: TooltipPosition;
  customName?: string;
  searchName: string;
  paramValues: Record<string,string>;
  weight?: string;
  handleCustomNameChange: TextboxChangeHandler;
  handleWeightChange: TextboxChangeHandler;
  submissionMetadata: SubmissionMetadata;
}

export function SubmitSection(props: SubmitSectionProps) {
  let { className, tooltipPosition, customName, handleCustomNameChange, searchName, paramValues, weight, handleWeightChange, submissionMetadata } = props;
  return (
    <div className={className}>
      <SubmitButton
        submissionMetadata={submissionMetadata}
      />
      <WebServicesTutorialLink
        searchName={searchName}
        paramValues={paramValues}
        weight={weight || "0"}
      />
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
