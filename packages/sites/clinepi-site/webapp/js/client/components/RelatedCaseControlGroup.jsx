import React from 'react';
import Param from 'ebrc-client/components/Param';

import { createSettingsParser, groupGetter, parameterGetter } from '../util/questionSettings';

const parseSettings = createSettingsParser('relatedCaseControlLayoutSettings', {
  getCaseControlGroup: groupGetter('relatedCaseControlGroupName'),
  getToggleParam: parameterGetter('toggleParamName'),
  getKeepRemoveParam: parameterGetter('keepRemoveParamName'),
  getFilterParam: parameterGetter('filterParamName'),
  getCaseControlParam: parameterGetter('caseControlParamName')
});

export default class RelatedCaseControlGroup extends React.Component {

  static shouldUseLayout(props) {
    const settings = parseSettings(props.wizardState.question);
    return (
      settings != null &&
      settings.getCaseControlGroup() === props.wizardState.activeGroup
    );
  }

  static handleParamChange(controller, param, paramValue) {
    const settings = parseSettings(controller.state.question);
    if (settings == null) return;

    const toggleParam = settings.getToggleParam();
    const caseControlParam = settings.getCaseControlParam();
    if (
      param === caseControlParam &&
      paramValue.startsWith('Both') &&
      controller.state.paramValues[toggleParam.name] !== toggleParam.defaultValue
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
    const settings = parseSettings(props.wizardState.question);
    if (settings == null) return true;

    const caseControlGroup = settings.getCaseControlGroup();
    if (props.group !== caseControlGroup) return true;

    return (
      RelatedCaseControlGroup.isUsable(props) &&
      RelatedCaseControlGroup.isEnabled(props)
    );
  }

  static isUsable(props) {
    const settings = parseSettings(props.wizardState.question);
    if (settings == null) return true;

    const caseControlParam = settings.getCaseControlParam();
    return !props.wizardState.paramValues[caseControlParam.name].startsWith('Both');
  }

  static isEnabled(props) {
    const settings = parseSettings(props.wizardState.question);
    if (settings == null) return true;

    const toggleParam = settings.getToggleParam()
    return props.wizardState.paramValues[toggleParam.name] === 'Yes';
  }

  renderToggle() {
    return RelatedCaseControlGroup.isUsable(this.props) && (
      <div className="CaseControlMessage">
        <label>
          <input
            type="checkbox"
            checked={RelatedCaseControlGroup.isEnabled(this.props)}
            onChange={() => {
              const settings = parseSettings(this.props.wizardState.question);
              this.props.parameterEventHandlers.onParamValueChange(
                settings.getToggleParam(),
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
        Before using <strong>Related Case/Control</strong>, please specify
        either <strong>Cases</strong> or <strong>Controls</strong> in the
        <strong> First </strong> step.
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
        {...this.props.parameterEventHandlers}
      />
    );
  }

  render() {
    const settings = parseSettings(this.props.wizardState.question);
    const modifiedWizardState = Object.assign({}, this.props.wizardState, {
      activeGroup: Object.assign({}, this.props.wizardState.activeGroup, {
        parameters: []
      })
    });

    const keepRemoveParam = settings.getKeepRemoveParam();
    const filterParam = settings.getFilterParam();

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
