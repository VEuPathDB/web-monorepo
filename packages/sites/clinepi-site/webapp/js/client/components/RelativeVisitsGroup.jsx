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

const layoutProperyKey = 'relatedObservationsLayoutSettings';

const requiredLayoutSettingKeys = [
  observationsGroupNameKey,
  relatedObservationsGroupNameKey,
  useRelativeObservationsParamNameKey,
  dateOperatorParamNameKey,
  daysBetweenParamNameKey,
  dateDirectionParamNameKey,
  numRelativeEventsParamNameKey,
  relativeVisitsParamNameKey
];


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

function paramRenderer(param, props) {
  const value = props.wizardState.paramValues[param.name];
  const uiState = props.wizardState.paramUIState[param.name];
  return (
    <Param
      param={param}
      value={value}
      uiState={uiState}
      onActiveOntologyTermChange={props.eventHandlers.setActiveOntologyTerm}
      onParamValueChange={props.eventHandlers.setParamValue}
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
export default class RelativeVisitsGroup extends React.Component {

  static shouldUseLayout(props) {
    if (!(layoutProperyKey in props.wizardState.question.properties)) {
      return false;
    }

    try {
      const relatedObservationsLayoutSettings =
        JSON.parse(props.wizardState.question.properties[layoutProperyKey]);

      if (relatedObservationsLayoutSettings[relatedObservationsGroupNameKey] !== props.wizardState.activeGroup.name) {
        return false;
      }

      const missingKeys = requiredLayoutSettingKeys.filter(key =>
        !(key in relatedObservationsLayoutSettings));

      if (missingKeys.length > 0) {
        throw new Error("The following keys are missing from the " +
          layoutProperyKey + " object: " + missingKeys.join(', '));
      }

      return true;

    }

    catch(error) {
      console.error('Could not use relative observations layout. Using standard layout', error);
      return false;
    }
  }

  /**
   * Layout for related observations.
   */
  renderLayout(eventsGroup, relatedObservationsLayoutSettings) {
    const group = this.props.wizardState.activeGroup;
    const parameters = this.props.wizardState.question.parameters;
    // const useRangeForNumRelativeEvents = this.props.useRangeForNumRelativeEvents;
    // const setUseRangeForNumRelativeEvents = this.props.eventHandlers.setUseRangeForNumRelativeEvents;

    const paramElements = new Map(parameters.map(param =>
      [ param.name, paramRenderer(param, this.props)]))

    return (
      <div>
        <div className="RelativeVisitsLayout">
          <div>
            {paramElements.get(relatedObservationsLayoutSettings[dateOperatorParamNameKey])}
            <Padded><FakeStep>{eventsGroup.displayName}</FakeStep> that are</Padded>
            {paramElements.get(relatedObservationsLayoutSettings[daysBetweenParamNameKey])}
            <Padded>days</Padded>
            {paramElements.get(relatedObservationsLayoutSettings[dateDirectionParamNameKey])}
            <Padded>the <FakeStep>{group.displayName}</FakeStep> specified below</Padded>
          </div>
        </div>
        {paramElements.has(relatedObservationsLayoutSettings[numRelativeEventsParamNameKey]) && (
          <div className="RelativeVisitsLayout">
            <div>
              <Padded first>Require</Padded>
              {paramElements.get(relatedObservationsLayoutSettings[numRelativeEventsParamNameKey])}
              <Padded><FakeStep>{group.displayName}</FakeStep> for each <FakeStep>Observation</FakeStep></Padded>
            </div>
          </div>
        )}
        <div>{paramElements.get(relatedObservationsLayoutSettings[relativeVisitsParamNameKey])}</div>
      </div>
    );
  }

  render() {
    const { question } = this.props.wizardState;

    const relatedObservationsLayoutSettings =
      JSON.parse(question.parameters[layoutProperyKey]);

    const { observationsGroupName, useRelativeObservationsParamName } =
      relatedObservationsLayoutSettings;

    const modifiedQuestion = Object.assign({}, question, {
      parameters: question.parameters.map(param =>
        Object.assign({}, param, { isVisible: false }))
    });

    const modifiedWizardState = Object.assign({}, this.props.wizardState, {
      question: modifiedQuestion
    });

    const useRelativeVisitsParam = question.parameters.find(p =>
      p.name === useRelativeObservationsParamName);

    const useRelativeVisits = this.props.wizardState.paramValues[useRelativeObservationsParamName] === 'Yes';

    const useRelativeVisitsElement = (
      <input
        type="checkbox"
        checked={useRelativeVisits}
        onChange={e => {
          this.props.eventHandlers.setParamValue(useRelativeVisitsParam, e.target.checked ? 'Yes' : 'No');
        }}
      />
    );

    const eventsGroup = this.props.wizardState.question.groups.find(group => group.name === observationsGroupName);
    const eventsIsDefault = eventsGroup.parameters.every(paramName =>
      this.props.wizardState.question.parameters.find(p => p.name === paramName).defaultValue === this.props.wizardState.paramValues[paramName])

    const warningMessage = eventsIsDefault && (
      <div className="RelativeVisitsMessage RelativeVisitsMessage__warning">
        Before using
        <FakeStep> {this.props.wizardState.activeGroup.displayName}</FakeStep>,
        please first specify observations in the previous
        <FakeStep> {eventsGroup.displayName} </FakeStep>
        filter.
      </div>
    );
    const message = !eventsIsDefault && (
      <div className="RelativeVisitsMessage">
        <label>
          {useRelativeVisitsElement} Enable the advanced <FakeStep>{this.props.wizardState.activeGroup.displayName}</FakeStep> filter below.  It allows you to restrict <FakeStep>{eventsGroup.displayName}</FakeStep> by relating them to your choice of <FakeStep>{this.props.wizardState.activeGroup.displayName}</FakeStep>.
        </label>
      </div>
    );

    const wrapperClassName = "RelativeVisitsActiveGroupWrapper" +
      (useRelativeVisits ? '' : ' RelativeVisitsActiveGroupWrapper__off');

    if (eventsIsDefault) {
      return (
        <div className={wrapperClassName}>
          {warningMessage}
          <div className="RelativeVisitsContainer">
            <this.props.DefaultComponent {...this.props} wizardState={modifiedWizardState} />
            {this.renderLayout(eventsGroup, relatedObservationsLayoutSettings)}
            {!useRelativeVisits && overlay}
          </div>
        </div>
      )
    }

    return (
      <div className={wrapperClassName}>
        <this.props.DefaultComponent {...this.props} wizardState={modifiedWizardState} />
        {message}
        <div className="RelativeVisitsContainer">
          {this.renderLayout(eventsGroup, relatedObservationsLayoutSettings)}
          {!useRelativeVisits && overlay}
        </div>
      </div>
    );
  }
}
