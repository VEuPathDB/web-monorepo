/* eslint react/prop-types: 0 */
/* eslint require-jsdoc: 0 */

import React from 'react';
import Param from 'ebrc-client/components/Param';

// Property keys
export const observationsGroupNameKey = "observationsGroupName";
export const relatedObservationsGroupNameKey = "relatedObservationsGroupName";
export const useRelativeObservationsParamNameKey = "useRelativeObservationsParamName";
export const dateOperatorParamNameKey = "dateOperatorParamName";
export const daysBetweenParamNameKey = "daysBetweenParamName";
export const dateDirectionParamNameKey = "dateDirectionParamName";
export const numRelativeEventsParamNameKey = "numRelativeEventsParamName";
export const relativeVisitsParamNameKey = "relativeVisitsParamName";

const overlay = (
  <div className="RelativeVisitsLayoutOverlay"/>
);

const Padded = (props) => (
  <span className={ 'Padded' + (props.first? ' Padded__first' : '') + (props.last? ' Padded__last' : '') }>
    {props.children}
  </span>
)

const FakeStep = (props) => (
  <strong>{props.children}</strong>
)

/**
 * Layout for related observations.
 */
function RelativeVisitsLayout(props) {
  const { relatedObservationsLayoutSettings } = props;

  const paramElements = new Map(props.parameters.map(param =>
    [ param.name, paramRenderer(param, props)]))

  return (
    <div>
      <div className="RelativeVisitsLayout">
        <div>
          {paramElements.get(relatedObservationsLayoutSettings[dateOperatorParamNameKey])}
          <Padded><FakeStep>{props.eventsGroup.displayName}</FakeStep> that are</Padded>
          {paramElements.get(relatedObservationsLayoutSettings[daysBetweenParamNameKey])}
          <Padded>days</Padded>
          {paramElements.get(relatedObservationsLayoutSettings[dateDirectionParamNameKey])}
          <Padded>the <FakeStep>{props.group.displayName}</FakeStep> specified below</Padded>
        </div>
      </div>
      {paramElements.has(relatedObservationsLayoutSettings[numRelativeEventsParamNameKey]) && (
        <div className="RelativeVisitsLayout">
          <div>
            <Padded first>Require</Padded>
            {paramElements.get(relatedObservationsLayoutSettings[numRelativeEventsParamNameKey])}
            <Padded><FakeStep>{props.group.displayName}</FakeStep> for each <FakeStep>Observation</FakeStep></Padded>
          </div>
        </div>
      )}
      <div>{paramElements.get(relatedObservationsLayoutSettings[relativeVisitsParamNameKey])}</div>
    </div>
  );
}

function paramRenderer(param, props) {
  const value = props.paramValues[param.name];
  const uiState = props.paramUIState[param.name];
  return (
    <Param
      param={param}
      value={value}
      uiState={uiState}
      onActiveOntologyTermChange={props.setActiveOntologyTerm}
      onParamValueChange={props.setParamValue}
    />
  );
}


/**
 * If the group is relative events, we want to alter the layout.
 *   - If events are not specified, show a warning with params disabled
 *   - If events are specified, show a checkbox
 *     - If checkbox is not checked, disabled params
 *     - If checkbox is checked, don't disabled params.
 *   - Layout params in a sentence, with filter param beneath the sentence.
 */
export default function ClinEpiActiveGroup(props) {
  const {
    wizardState: { question },
    relatedObservationsLayoutSettings: {
      observationsGroupName,
      useRelativeObservationsParamName,
    }
  } = props;

  const modifiedQuestion = Object.assign({}, question, {
    parameters: question.parameters.map(param =>
      Object.assign({}, param, { isVisible: false }))
  });

  const modifiedWizardState = Object.assign({}, props.wizardState, {
    question: modifiedQuestion
  });

  const useRelativeVisitsParam = question.parameters.find(p =>
    p.name === useRelativeObservationsParamName);

  const useRelativeVisits = props.wizardState.paramValues[useRelativeObservationsParamName] === 'Yes';

  const useRelativeVisitsElement = (
    <input
      type="checkbox"
      checked={useRelativeVisits}
      onChange={e => {
        props.eventHandlers.setParamValue(useRelativeVisitsParam, e.target.checked ? 'Yes' : 'No');
      }}
    />
  );

  const eventsGroup = props.wizardState.question.groups.find(group => group.name === observationsGroupName);
  const eventsIsDefault = eventsGroup.parameters.every(paramName =>
    props.wizardState.question.parameters.find(p => p.name === paramName).defaultValue === props.wizardState.paramValues[paramName])

  const warningMessage = eventsIsDefault && (
    <div className="RelativeVisitsMessage RelativeVisitsMessage__warning">
      Before using
      <FakeStep> {props.wizardState.activeGroup.displayName}</FakeStep>,
      please first specify observations in the previous
      <FakeStep> {eventsGroup.displayName} </FakeStep>
      filter.
    </div>
  );
  const message = !eventsIsDefault && (
    <div className="RelativeVisitsMessage">
      <label>
        {useRelativeVisitsElement} Enable the advanced <FakeStep>{props.wizardState.activeGroup.displayName}</FakeStep> filter below.  It allows you to restrict <FakeStep>{eventsGroup.displayName}</FakeStep> by relating them to your choice of <FakeStep>{props.wizardState.activeGroup.displayName}</FakeStep>.
      </label>
    </div>
  );

  const layout = (
    <RelativeVisitsLayout
      group={props.wizardState.activeGroup}
      eventsGroup={eventsGroup}
      parameters={props.wizardState.question.parameters}
      paramValues={props.wizardState.paramValues}
      paramUIState={props.wizardState.paramUIState}
      setActiveOntologyTerm={props.eventHandlers.setActiveOntologyTerm}
      setParamValue={props.eventHandlers.setParamValue}
      useRangeForNumRelativeEvents={props.useRangeForNumRelativeEvents}
      setUseRangeForNumRelativeEvents={props.eventHandlers.setUseRangeForNumRelativeEvents}
      relatedObservationsLayoutSettings={props.relatedObservationsLayoutSettings}
    />
  );

  const wrapperClassName = "RelativeVisitsActiveGroupWrapper" +
    (useRelativeVisits ? '' : ' RelativeVisitsActiveGroupWrapper__off');

  if (eventsIsDefault) {
    return (
      <div className={wrapperClassName}>
        {warningMessage}
        <div className="RelativeVisitsContainer">
          <props.DefaultComponent {...props} wizardState={modifiedWizardState} />
          {layout}
          {!useRelativeVisits && overlay}
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <props.DefaultComponent {...props} wizardState={modifiedWizardState} />
      {message}
      <div className="RelativeVisitsContainer">
        {layout}
        {!useRelativeVisits && overlay}
      </div>
    </div>
  );
}
