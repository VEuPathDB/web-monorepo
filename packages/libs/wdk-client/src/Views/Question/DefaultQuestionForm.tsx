import * as React from 'react';

import { HelpIcon, IconAlt, Link } from 'wdk-client/Components';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper, safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { Parameter, ParameterGroup, RecordClass } from 'wdk-client/Utils/WdkModel';
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
import { scrollIntoView } from 'wdk-client/Utils/DomUtils';
import StepValidationInfo from 'wdk-client/Views/Question/StepValidationInfo';

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
  recordClass: RecordClass;
  submitButtonText?: string;
  validateForm?: boolean;
  renderParamGroup?: (group: ParameterGroup, formProps: Props) => JSX.Element;
  DescriptionComponent?: (props: { description?: string, navigatingToDescription: boolean }) => JSX.Element;
  onClickDescriptionLink?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onSubmit?: (e: React.FormEvent) => boolean | void;
  containerClassName?: string;
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

  const { dispatchAction, onSubmit, submissionMetadata, state, submitButtonText, recordClass, validateForm = true, containerClassName } = props;
  const { question, customName, paramValues, weight, stepValidation, submitting } = state;

  let defaultOnSubmit = useDefaultOnSubmit(dispatchAction, question.urlSegment, submissionMetadata);

  let handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      if (onSubmit && !onSubmit(event)) {
        return false;
      }

      return defaultOnSubmit(event);
    },
    [ onSubmit, defaultOnSubmit ]
  );

  let handleCustomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateCustomQuestionName({ searchName: question.urlSegment, customName: event.target.value }));
  }

  let handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAction(updateQuestionWeight({ searchName: question.urlSegment, weight: event.target.value }));
  }

  let renderParamGroup = props.renderParamGroup ? props.renderParamGroup : renderDefaultParamGroup;
  let Description = props.DescriptionComponent || QuestionDescription;

  let fullContainerClassName = `${containerClassName || ''} ` + (
    question.parameters.every(({ type }) => type !== 'filter') 
      ? cx('', 'default-width')
      : cx('', 'wide-width')
  );

  let containerRef = React.useRef<HTMLDivElement>(null);

  let [ navigatingToDescription, setNavigatingToDescription ] = React.useState(false);

  let defaultOnClickDescriptionLink = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const descriptionSection = containerRef.current && containerRef.current.querySelector(`.${cx('DescriptionSection')}`);

    if (descriptionSection instanceof HTMLElement) {
      scrollIntoView(descriptionSection);

      setNavigatingToDescription(true);
      setTimeout(() => {
        setNavigatingToDescription(false);
      }, 3000);
    }
  }, []);

  let onClickDescriptionLink = props.onClickDescriptionLink || defaultOnClickDescriptionLink;

  React.useEffect(() => {
    if (stepValidation && !stepValidation.isValid && containerRef.current instanceof HTMLElement) {
      scrollIntoView(containerRef.current);
    }
  }, [ stepValidation ]);

  return (
    <div className={fullContainerClassName} ref={containerRef}>
      <QuestionHeader
        showDescriptionLink={submissionMetadata.type === 'create-strategy'}
        onClickDescriptionLink={onClickDescriptionLink}
        showHeader={submissionMetadata.type === 'create-strategy' || submissionMetadata.type === 'edit-step'}
        headerText={`Identify ${recordClass.displayNamePlural} based on ${question.displayName}`}
      />
      <StepValidationInfo stepValidation={stepValidation} question={question} isRevise={submissionMetadata.type === 'edit-step'}/>
      <form onSubmit={handleSubmit} noValidate={!validateForm}>
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
          submitting={submitting}
          submitButtonText={submitButtonText}
        />
        <Description description={question.description} navigatingToDescription={navigatingToDescription} />
      </form>
    </div>
  );
}

type QuestionHeaderProps = { 
  headerText: string, 
  showHeader: boolean,
  showDescriptionLink?: boolean,
  onClickDescriptionLink?: (e: React.MouseEvent<HTMLAnchorElement>) => void
};

export function QuestionHeader(props: QuestionHeaderProps) {
  return props.showHeader
    ? (
      <div className={cx('QuestionHeader')}>
        {
          !!props.showDescriptionLink && (
            <div className={cx('DescriptionLink')}>
              <IconAlt fa="info-circle" className="fa-fw" />
              <a title="Read more about this search below" href="#" onClick={props.onClickDescriptionLink}>
                Learn more about this search
              </a>
            </div>
          )
        }
        <h1>{props.headerText}</h1>
      </div>
    )
    : <></>;
}

export function renderDefaultParamGroup(group: ParameterGroup, formProps: Props) {
  let { state, eventHandlers, parameterElements } = formProps;
  let { question, groupUIState, paramDependenciesUpdating } = state;
  return (
    <DefaultGroup
      key={group.name}
      question={question}
      group={group}
      uiState={groupUIState[group.name]}
      onVisibilityChange={eventHandlers.setGroupVisibility}
      parameterElements={parameterElements}
      paramDependenciesUpdating={paramDependenciesUpdating}
    />
  );
}

type DefaultGroupProps = {
  question: QuestionWithMappedParameters;
  group: ParameterGroup;
  uiState: any;
  onVisibilityChange: EventHandlers['setGroupVisibility'];
  parameterElements: Record<string, React.ReactNode>;
  paramDependenciesUpdating: Record<string, boolean>;
}

export function DefaultGroup(props: DefaultGroupProps) {
  let { question, group, uiState, onVisibilityChange, parameterElements, paramDependenciesUpdating } = props;
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
        paramDependenciesUpdating={paramDependenciesUpdating}
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
  paramDependenciesUpdating: Record<string, boolean>;
}

export function ParameterList(props: ParameterListProps) {
  const { parameters, parameterMap, parameterElements, paramDependenciesUpdating } = props;
  return (
    <div className={cx('ParameterList')}>
      {Seq.from(parameters)
        .map(paramName => parameterMap[paramName])
        .map(parameter => (
          <React.Fragment key={parameter.name}>
            <ParameterHeading 
              parameter={parameter} 
              paramDependencyUpdating={!!paramDependenciesUpdating[parameter.name]}
            />
            <div className={cx('ParameterControl')}>
              {parameterElements[parameter.name]}
              {
                parameter.visibleHelp !== undefined &&
                <div className={cx('VisibleHelp')}>
                  {safeHtml(parameter.visibleHelp)}
                </div>
              }
            </div>
          </React.Fragment>
        ))}
    </div>
  )
}

function ParameterHeading(props: { parameter: Parameter, paramDependencyUpdating: boolean }) {
  const { parameter, paramDependencyUpdating } = props;
  return (
    <div className={cx('ParameterHeading')}>
      <h2>
        <HelpIcon>{parameter.help}</HelpIcon> {parameter.displayName}
        {paramDependencyUpdating && <IconAlt fa="circle-o-notch" className="fa-spin fa-fw" />}
      </h2>
    </div>
  )
}

export function SubmitButton(
  props: { submissionMetadata: SubmissionMetadata, submitButtonText?: string, submitting: boolean }
) {
  return props.submitting
    ? <div className={cx('SubmittingIndicator')}></div>
    : <button type="submit" className="btn">
        {getSubmitButtonText(props.submissionMetadata, props.submitButtonText)}
      </button>;
}

export const getSubmitButtonText = (submissionMetadata: SubmissionMetadata, submitButtonText?: string) =>
  submitButtonText
    ? submitButtonText
    : submissionMetadata.type === 'create-strategy'
    ? 'Get Answer'
    : submissionMetadata.type === 'edit-step'
    ? 'Revise Step'
    : 'Run Step';

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

export function QuestionDescription(props: { description?: string, navigatingToDescription: boolean }) {
  return !props.description ? null : (
    <div className={cx('DescriptionSection')}>
      <div className={cx('Description')}>
        <hr/>
        <h2 className={props.navigatingToDescription ? 'navigatingToDescription' : undefined}>Description</h2>
        {safeHtml(props.description)}
      </div>
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
    Object.keys(paramValues)
      .map(paramName => "&" + paramName + "=" + encodeURIComponent(paramValues[paramName]))
      .join("");
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
  submitting: boolean;
  submitButtonText?: string;
}

export function SubmitSection(props: SubmitSectionProps) {
  let { 
    className, 
    tooltipPosition, 
    customName, 
    handleCustomNameChange, 
    searchName, 
    paramValues, 
    weight, 
    handleWeightChange, 
    submissionMetadata, 
    submitting,
    submitButtonText 
  } = props;
  return (
    <div className={className}>
      <SubmitButton
        submissionMetadata={submissionMetadata}
        submitting={submitting}
        submitButtonText={submitButtonText}
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
