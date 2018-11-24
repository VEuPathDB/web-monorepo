import React from 'react';
import Param from 'ebrc-client/components/Param';

const CASE_CONTROL_GROUP_NAME = 'relative_case_control';
const TOGGLE_PARAM_NAME = 'use_rel_case_control';
const KEEP_REMOVE_PARAM_NAME = 'keep_remove';
const FILTER_PARAM_NAME = 'relative_event_gems';
const CASE_CONTROL_PARAM_NAME = 'case_control';

export default class RelatedCaseControlGroup extends React.Component {

  static shouldUseLayout(props) {
    return props.wizardState.activeGroup.name === CASE_CONTROL_GROUP_NAME;
  }

  static handleParamChange(controller, param, paramValue) {
    let toggleParam = controller.parameterMap.get(TOGGLE_PARAM_NAME);
    if (
      param.name === CASE_CONTROL_PARAM_NAME &&
      paramValue.startsWith('Both') &&
      controller.state.paramValues[TOGGLE_PARAM_NAME] !== toggleParam.defaultValue
    ) {
      controller.setParamValue(toggleParam, toggleParam.defaultValue);
    }
  }

  /**
   * Show filter summary if one of the following is true:
   * - settings is null (a problem with parsing properties)
   * - props.group is not related case/control
   * - related observations is active
   */
  static showFilterSummary(props) {
    if (props.group.name !== CASE_CONTROL_GROUP_NAME) return true;

    return (
      RelatedCaseControlGroup.isUsable(props) &&
      RelatedCaseControlGroup.isEnabled(props)
    );
  }

  static isUsable(props) {
    return !props.wizardState.paramValues[CASE_CONTROL_PARAM_NAME].startsWith('Both');
  }

  static isEnabled(props) {
    return props.wizardState.paramValues[TOGGLE_PARAM_NAME] === 'Yes';
  }

  renderToggle() {
    return RelatedCaseControlGroup.isUsable(this.props) && (
      <div className="CaseControlMessage">
        <label>
          <input
            type="checkbox"
            checked={RelatedCaseControlGroup.isEnabled(this.props)}
            onClick={() => {
              this.props.eventHandlers.setParamValue(
                this.props.wizardState.question.parameters.find(p => p.name === TOGGLE_PARAM_NAME),
                RelatedCaseControlGroup.isEnabled(this.props) ? 'No' : 'Yes'
              );
            }} /> Enable the advanced <strong>Related Case/Control</strong> filter below. It allows you to restrict Participants using information about their related case or control.
        </label>
      </div>
    )
  }

  renderWarning() {
    return !RelatedCaseControlGroup.isUsable(this.props) && (
      <div className="CaseControlMessage CaseControlMessage__warning">
        Before using <strong>Related Case/Control</strong>, please first specify
        either <strong>Cases</strong> or <strong>Controls</strong> in the
        previous <strong>Personal Characteristics</strong> filter.
      </div>
    );
  }

  renderOverlay() {
    return RelatedCaseControlGroup.isEnabled(this.props) ? null : (
      <div className="CaseControlLayoutOverlay"/>
    );
  }

  renderParam(param) {
    return (
      <Param
        param={param}
        value={this.props.wizardState.paramValues[param.name]}
        uiState={this.props.wizardState.paramUIState[param.name]}
        onActiveOntologyTermChange={this.props.eventHandlers.setActiveOntologyTerm}
        onParamValueChange={this.props.eventHandlers.setParamValue}
        onParamStateChange={this.props.eventHandlers.setParamState}
      />
    );
  }

  render() {
    const modifiedWizardState = Object.assign({}, this.props.wizardState, {
      activeGroup: Object.assign({}, this.props.wizardState.activeGroup, {
        parameters: []
      })
    });

    const paramMap = new Map(this.props.wizardState.question.parameters.map(p => [p.name, p]));
    const keepRemoveParam = paramMap.get(KEEP_REMOVE_PARAM_NAME);
    const filterParam = paramMap.get(FILTER_PARAM_NAME);

    return (
      <div className={'CaseControlGroupWrapper CaseControlGroupWrapper__' +
          (RelatedCaseControlGroup.isEnabled(this.props) ? 'on' : 'off')}>
        <this.props.DefaultComponent {...this.props} wizardState={modifiedWizardState}/>
        {this.renderWarning()}
        {this.renderToggle()}
        <div className="CaseControlContainer">
          <div style={{padding: '1em 0'}}>
            {this.renderParam(keepRemoveParam)} <strong>Participants</strong> based on your choice of <strong>Related Case/Control</strong> Participants below
          </div>
          {this.renderParam(filterParam)}
          {this.renderOverlay()}
        </div>
      </div>
    )
  }
}
