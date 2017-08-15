import Param from 'ebrc-client/components/Param';

const overlay = (
  <div style={{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.8,
    zIndex: 1,
    background: 'white'
  }}/>
);

const Padded = (props) => (
  <span style={{ padding: '0 .5em' }}>{props.children}</span>
)

const FakeStep = (props) => (
  <div style={{
    padding: '.5em',
    background: '#eee',
    borderRadius: '4px',
    border: '1px solid #444',
    color: '#444',
    fontSize: '0.7em',
    fontWeight: 'bold',
    boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.2)',
    maxWidth: '9em',
    display: 'inline-block',
    textAlign: 'center'
  }}>
    {props.children}
  </div>
)

function RelativeVisitsLayout(props) {
  const params = props.parameters.reduce(function(layoutProps, param) {
    return Object.assign(layoutProps, {
      [param.name]: (
        <Param
          param={param}
          value={props.paramValues[param.name]}
          uiState={props.paramUIState[param.name]}
          onActiveOntologyTermChange={props.onActiveOntologyTermChange}
          onParamValueChange={props.onParamValueChange}
        />
      )
    });
  }, {});

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexFlow: 'row wrap',
      padding: '1em 2em'
    }}>
      {params.dateOperator_fv}
      <Padded>previously selected events that are</Padded>
      {params.days_between}
      <Padded>days</Padded>
      {params.date_direction_fv}
      <Padded>events specified below, and match</Padded>
      {params.num_relative_events}
      <Padded>events:</Padded>
    </div>
  );
}

// Vars used in function below... we might make these props in the future so
// that we reuse this for multiple questions.
const relativeEventsGroupName = 'relative_events';
const relativeEventsFilterParamName = 'relative_visits_nf_maled';
const useRelativeVisitsParamName = 'use_relative_visits';
const eventsGroupName = 'part_event_characteristics';

/**
 * If the group is relative events, we want to alter the layout.
 *   - If events are not specified, show a warning with params disabled
 *   - If events are specified, show a checkbox
 *     - If checkbox is not checked, disabled params
 *     - If checkbox is checked, don't disabled params.
 *   - Layout params in a sentence, with filter param beneath the sentence.
 */
export default function ClinEpiActiveGroup(props) {
  if (props.activeGroup.name !== relativeEventsGroupName) {
    return <props.DefaultComponent {...props}/>
  }

  const activeGroupOnlyFilterParam = Object.assign({}, props.activeGroup, {
    parameters: props.activeGroup.parameters.filter(paramName => paramName === relativeEventsFilterParamName)
  });

  const useRelativeVisitsParam = props.question.parameters.find(p => p.name === useRelativeVisitsParamName);
  const useRelativeVisits = (
    <input
      type="checkbox"
      checked={props.paramValues.use_relative_visits === 'Yes'}
      onChange={e => {
        props.onParamValueChange(useRelativeVisitsParam, e.target.checked ? 'Yes' : 'No');
      }}
    />
  );

  const eventsGroup = props.question.groups.find(group => group.name === eventsGroupName);
  const eventsIsDefault = eventsGroup.parameters.every(paramName =>
    props.question.parameters.find(p => p.name === paramName).defaultValue === props.paramValues[paramName])

  const message = eventsIsDefault ? (
    <div style={{
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
      padding: '1em 2em',
      margin: '1em 0',
      background: 'rgba(139, 0, 0, 0.1)',
      border: '1px solid darkred',
      borderRadius: '4px'
    }}>
      <Padded>Before using</Padded>
      <FakeStep>{props.activeGroup.displayName}</FakeStep>,
      <Padded>please first specify events in the previous</Padded>
      <FakeStep>{eventsGroup.displayName}</FakeStep>
      <Padded>filter.</Padded>
    </div>
  ) : (
    <div>
      <label style={{
        display: 'flex',
        flexFlow: 'row wrap',
        alignItems: 'center',
        padding: '1em 2em',
        margin: '1em 0',
        background: '#cfe6ff',
        border: '1px solid #a5c9f1',
        borderRadius: '4px'
      }}>
        {useRelativeVisits}
        <Padded>Restrict the events specified in</Padded>
        <FakeStep>Events</FakeStep>
        <Padded>to those that have a comparison event, as specified below.</Padded>
      </label>
    </div>
  );

  return (
    <div>
      {message}
      <div style={{ position: 'relative' }}>
        <RelativeVisitsLayout
          group={props.activeGroup}
          parameters={props.question.parameters}
          paramValues={props.paramValues}
          paramUIState={props.paramUIState}
          onActiveOntologyTermChange={props.onActiveOntologyTermChange}
          onParamValueChange={props.onParamValueChange}
        />
        <props.DefaultComponent {...props} activeGroup={activeGroupOnlyFilterParam}/>
        {props.paramValues.use_relative_visits === 'No' && overlay}
      </div>
    </div>
  );
}
