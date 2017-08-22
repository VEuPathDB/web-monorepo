/* eslint react/prop-types: 0 */
/* eslint require-jsdoc: 0 */

import React from 'react';
import Param from 'ebrc-client/components/Param';
import NumberParam from 'ebrc-client/components/NumberParam';

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
// const FakeStep = (props) => (
//   <div style={{
//     padding: '.5em',
//     margin: '0 .5em',
//     background: '#eee',
//     borderRadius: '4px',
//     border: '1px solid #444',
//     color: '#444',
//     fontSize: '0.7em',
//     fontWeight: 'bold',
//     boxShadow: 'rgba(0, 0, 0, 0.6) 1px 1px 3px',
//     maxWidth: '9em',
//     display: 'inline-block',
//     textAlign: 'center'
//   }}>
//     {props.children}
//   </div>
// )


/** 
 * Layout for related observations.
 */
function RelativeVisitsLayout(props) {
  const { relatedObservationsLayoutSettings } = props;

  const paramElements = new Map(props.parameters.map(param =>
    [ param.name, paramRenderer(param, props)]))

  // const eventString = (
  //   props.useRangeForNumRelativeEvents == false &&
  //   JSON.parse(props.paramValues[numRelativeEventsParamName]).min == 1
  // ) ? 'event' : 'events';

  return (
    <div>
      <div className="RelativeVisitsLayout">
        <div>
          {paramElements.get(relatedObservationsLayoutSettings[dateOperatorParamNameKey])}
          <Padded><FakeStep>{props.eventsGroup.displayName}</FakeStep> that are</Padded>
          {paramElements.get(relatedObservationsLayoutSettings[daysBetweenParamNameKey])}
          <Padded>days</Padded>
          {paramElements.get(relatedObservationsLayoutSettings[dateDirectionParamNameKey])}
          {/*<Padded first>&nbsp;</Padded>*/}
          {/*paramElements.get(numRelativeEventsParamName)*/}
          <Padded>the <FakeStep>{props.group.displayName}</FakeStep> specified below</Padded>
        </div>
      </div>
      <div>{paramElements.get(relatedObservationsLayoutSettings[relativeVisitsParamNameKey])}</div>
    </div>
  );
}

function paramRenderer(param, props) {
  const numRelativeEventsParamName =
    props.relatedObservationsLayoutSettings[numRelativeEventsParamNameKey];
  const value = props.paramValues[param.name];
  const uiState = props.paramUIState[param.name];
  const selectValues = {
    between: 'between',
    atLeast: 'at-least'
  }

  if (param.name === numRelativeEventsParamName) {
    return [(
      <select
        value={props.useRangeForNumRelativeEvents ? selectValues.between : selectValues.atLeast}
        onChange={event => {
          if (event.target.value === selectValues.atLeast) {
            const parsedValue = JSON.parse(value);
            props.onParamValueChange(
              param,
              JSON.stringify({ min: parsedValue.min, max: param.max })
            );
          }
          props.onUseRangeForNumRelativeEventsChange(event.target.value === selectValues.between);
        }}
      >
        <option value={selectValues.between}>between</option>
        <option value={selectValues.atLeast}>at least</option>
      </select>
    ), <Padded first>&nbsp;</Padded>, props.useRangeForNumRelativeEvents ? (
      <Param
        param={param}
        value={value}
        uiState={uiState}
        onActiveOntologyTermChange={props.onActiveOntologyTermChange}
        onParamValueChange={props.onParamValueChange}
      />
    ) : (
      <NumberParam
        param={param}
        value={JSON.parse(value).min}
        uiState={uiState}
        onActiveOntologyTermChange={props.onActiveOntologyTermChange}
        onParamValueChange={(param, newValue) => props.onParamValueChange(
          param,
          JSON.stringify({ min: Number(newValue), max: param.max })
        )}/>
    )]
  }
  return (
    <Param
      param={param}
      value={value}
      uiState={uiState}
      onActiveOntologyTermChange={props.onActiveOntologyTermChange}
      onParamValueChange={props.onParamValueChange}
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
    question,
    relatedObservationsLayoutSettings: {
      observationsGroupName,
      useRelativeObservationsParamName,
    }
  } = props;

  const modifiedQuestion = Object.assign({}, question, {
    parameters: question.parameters.map(param =>
      Object.assign({}, param, { isVisible: false }))
  });

  const useRelativeVisitsParam = question.parameters.find(p =>
    p.name === useRelativeObservationsParamName);

  const useRelativeVisits = props.paramValues[useRelativeObservationsParamName] === 'Yes';

  const useRelativeVisitsElement = (
    <input
      type="checkbox"
      checked={useRelativeVisits}
      onChange={e => {
        props.onParamValueChange(useRelativeVisitsParam, e.target.checked ? 'Yes' : 'No');
      }}
    />
  );

  const eventsGroup = props.question.groups.find(group => group.name === observationsGroupName);
  const eventsIsDefault = eventsGroup.parameters.every(paramName =>
    props.question.parameters.find(p => p.name === paramName).defaultValue === props.paramValues[paramName])

  const warningMessage = eventsIsDefault && (
    <div className="RelativeVisitsMessage RelativeVisitsMessage__warning">
      Before using
      <FakeStep> {props.activeGroup.displayName}</FakeStep>,
      please first specify observations in the previous
      <FakeStep> {eventsGroup.displayName} </FakeStep>
      filter.
    </div>
  );
  const message = !eventsIsDefault && (
    <div className="RelativeVisitsMessage">
      <label>
        {useRelativeVisitsElement} Enable the <FakeStep>{props.activeGroup.displayName}</FakeStep> filter below.  It allows you to restrict <FakeStep>{eventsGroup.displayName}</FakeStep> by relating them to your choice of <FakeStep>{props.activeGroup.displayName}</FakeStep>.
      </label>
    </div>
  );

  const layout = (
    <RelativeVisitsLayout
      group={props.activeGroup}
      eventsGroup={eventsGroup}
      parameters={props.question.parameters}
      paramValues={props.paramValues}
      paramUIState={props.paramUIState}
      onActiveOntologyTermChange={props.onActiveOntologyTermChange}
      onParamValueChange={props.onParamValueChange}
      useRangeForNumRelativeEvents={props.useRangeForNumRelativeEvents}
      onUseRangeForNumRelativeEventsChange={props.onUseRangeForNumRelativeEventsChange}
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
          <props.DefaultComponent {...props} question={modifiedQuestion} />
          {layout}
          {!useRelativeVisits && overlay}
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClassName}>
      <props.DefaultComponent {...props} question={modifiedQuestion} />
      {message}
      <div className="RelativeVisitsContainer">
        {layout}
        {!useRelativeVisits && overlay}
      </div>
    </div>
  );
}
