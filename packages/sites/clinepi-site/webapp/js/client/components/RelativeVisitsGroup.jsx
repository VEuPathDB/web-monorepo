/* eslint react/prop-types: 0 */
/* eslint require-jsdoc: 0 */

import React from 'react';
import Param from '@veupathdb/web-common/lib/components/Param';

import { createSettingsParser, groupGetter, parameterGetter } from '../util/questionSettings';

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
  const uiState = props.wizardState.paramUIState[param.name];
  return (
    <Param
      param={param}
      dispatch={props.dispatch}
      paramValues={props.wizardState.paramValues}
      uiState={uiState}
      searchName={props.searchName}
      recordClassName={props.recordClassName}
      eventHandlers={props.parameterEventHandlers}
    />
  );
}

const parseSettings = createSettingsParser('relatedObservationsLayoutSettings', {
  getObservationGroup: groupGetter('observationsGroupName'),
  getRelatedObservationsGroup: groupGetter('relatedObservationsGroupName'),
  getUseRelativeObservationsParam: parameterGetter('useRelativeObservationsParamName'),
  getDateOperationParam: parameterGetter('dateOperatorParamName'),
  getDaysBetweenParam: parameterGetter('daysBetweenParamName'),
  getDateDirectionParam: parameterGetter('dateDirectionParamName'),
  getNumRelativeVisitsParam: parameterGetter('numRelativeEventsParamName', false),
  getRelativeVisitsParam: parameterGetter('relativeVisitsParamName'),
  getTimepointUnits: (_, properties) => () => properties.timepointUnits || 'days',
  isRelatedObservationsGroups: (_, __, settings) => group => group === settings.getRelatedObservationsGroup(),
  isActive: (_, __, settings) => wizardState => {
    const useRelativeObservationsParam = settings.getUseRelativeObservationsParam();
    const observationsGroup = settings.getObservationGroup();
    const observationsIsDefault = observationsGroup.parameters.every(paramName =>
      wizardState.defaultParamValues[paramName] === wizardState.paramValues[paramName])
    return (
      wizardState.paramValues[useRelativeObservationsParam.name] === 'Yes' &&
      !observationsIsDefault
    );
  }
});

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
    const settings = parseSettings(props.wizardState.question);
    const activeGroup = props.wizardState.question.groups[props.wizardState.activeGroupIx];
    return (
      settings != null &&
      settings.getRelatedObservationsGroup() === activeGroup
    );
  }

  /**
   * Show filter summary if one of the following is true:
   * - settings is null (a problem with parsing properties)
   * - props.group is not related observations
   * - related observations is active
   */
  static showFilterSummary(props) {
    const settings = parseSettings(props.wizardState.question);
    return (
      settings == null ||
      !settings.isRelatedObservationsGroups(props.group) ||
      settings.isActive(props.wizardState)
    )
  }

  /**
   * Layout for related observations.
   */
  renderLayout(eventsGroup, settings) {
    const group = this.props.wizardState.question.groups[this.props.wizardState.activeGroupIx];
    return (
      <div>
        <div className="RelativeVisitsLayout">
          <div>
            {paramRenderer(settings.getDateOperationParam(), this.props)}
            <Padded><FakeStep>{eventsGroup.displayName}</FakeStep> that are</Padded>
            {paramRenderer(settings.getDaysBetweenParam(), this.props)}
            <Padded>{settings.getTimepointUnits()}</Padded>
            {paramRenderer(settings.getDateDirectionParam(), this.props)}
            <Padded>the <FakeStep>{group.displayName}</FakeStep> specified below</Padded>
          </div>
        </div>
        {settings.getNumRelativeVisitsParam() && (
          <div className="RelativeVisitsLayout">
            <div>
              <Padded first>Require</Padded>
              {paramRenderer(settings.getNumRelativeVisitsParam(), this.props)}
              <Padded><FakeStep>{group.displayName}</FakeStep> for each <FakeStep>Observation</FakeStep></Padded>
            </div>
          </div>
        )}
        <div>{paramRenderer(settings.getRelativeVisitsParam(), this.props)}</div>
      </div>
    );
  }

  render() {
    const { question, activeGroupIx } = this.props.wizardState;
    const activeGroup = question.groups[activeGroupIx];
    const settings = parseSettings(question);
    const eventsGroup = this.props.wizardState.question.groups.find(group => group === settings.getObservationGroup());
    const eventsIsDefault = eventsGroup.parameters.every(paramName =>
      this.props.wizardState.defaultParamValues[paramName] === this.props.wizardState.paramValues[paramName])

    const modifiedQuestion = Object.assign({}, question, {
      parameters: question.parameters.map(param =>
        Object.assign({}, param, { isVisible: false }))
    });

    const modifiedWizardState = Object.assign({}, this.props.wizardState, {
      question: modifiedQuestion
    });

    const useRelativeVisitsParam = question.parameters.find(p =>
      p === settings.getUseRelativeObservationsParam());

    const useRelativeVisits = settings.isActive(this.props.wizardState);

    const useRelativeVisitsElement = (
      <input
        type="checkbox"
        checked={useRelativeVisits}
        onChange={e => {
          this.props.parameterEventHandlers.onParamValueChange(useRelativeVisitsParam, e.target.checked ? 'Yes' : 'No');
        }}
      />
    );

    const warningMessage = eventsIsDefault && (
      <div className="RelativeVisitsMessage RelativeVisitsMessage__warning">
        Before using
        <FakeStep> {activeGroup.displayName}</FakeStep>,
        please first specify observations in the previous
        <FakeStep> {eventsGroup.displayName} </FakeStep>
        filter.
      </div>
    );
    const message = !eventsIsDefault && (
      <div className="RelativeVisitsMessage">
        <label>
          {useRelativeVisitsElement} Enable the advanced <FakeStep>{activeGroup.displayName}</FakeStep> filter below.  It allows you to restrict <FakeStep>{eventsGroup.displayName}</FakeStep> by relating them to your choice of <FakeStep>{activeGroup.displayName}</FakeStep>.
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
            {this.renderLayout(eventsGroup, settings)}
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
          {this.renderLayout(eventsGroup, settings)}
          {!useRelativeVisits && overlay}
        </div>
      </div>
    );
  }
}
