import { debounce, get } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  ActiveQuestionUpdatedAction,
  ParamValueUpdatedAction,
  UnloadQuestionAction,
} from './QuestionActionCreators';
import AbstractViewController from '../../Core/Controllers/AbstractViewController';
import { Seq } from '../../Utils/IterableUtils';
import { preorder } from '../../Utils/TreeUtils';
import { EnumParam, Parameter } from '../../Utils/WdkModel';
import QuestionStore, { QuestionState } from './QuestionStore';

import * as ParamModules from './Params';
import { isEnumParam } from './Params/EnumParamUtils';
import TreeBoxEnumParam from './Params/TreeBoxEnumParam';
import { Context } from './Params/Utils';

const ActionCreators = {
  setActiveQuestion: ActiveQuestionUpdatedAction.create,
  updateParamValue: ParamValueUpdatedAction.create
}

type Props = {
  questionName: string;
  paramName: string;
  paramValues: Record<string, string>;
  stepId: number | undefined;
}

export default class LegacyParamController extends AbstractViewController<
  QuestionState,
  QuestionStore,
  typeof ActionCreators,
  Props
> {

  static readonly UNRECOVERABLE_PARAM_ERROR_EVENT = 'unrecoverable-param-error';
  static readonly PARAM_VALID_EVENT = 'param-valid';
  static readonly PARAM_INVALID_EVENT = 'param-invalid';


  paramModules = ParamModules;

  getStoreClass() {
    return QuestionStore;
  }

  getStateFromStore() {
    return get(this.store.getState(), ['questions', this.props.questionName], {}) as QuestionState;
  }

  getActionCreators() {
    return ActionCreators;
  }

  getDependentParams(parameter: Parameter): Seq<Parameter> {
    return Seq.from(parameter.dependentParams)
      .map(name => this.state.question.parametersByName[name])
      .flatMap(dependentParam =>
        Seq.of(dependentParam).concat(this.getDependentParams(dependentParam)));
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    const { questionName } = this.props;
    this.dispatchAction(UnloadQuestionAction.create({ questionName }));
  }

  loadData(prevProps?: Props, prevState?: QuestionState) {
    if (
      this.state.questionStatus == null ||
      this.state.stepId !== this.props.stepId
    ) {
      this.eventHandlers.setActiveQuestion({
        questionName: this.props.questionName,
        paramValues: this.props.paramValues,
        stepId: this.props.stepId
      });
    }

    else if (prevProps != null) {
      let prevParamValues = prevProps.paramValues || {};
      let paramValues = this.props.paramValues || {};
      let changedParams = Object.entries(paramValues)
        .filter(([name, value]) => (
          prevParamValues[name] !== value &&
          this.state.paramValues[name] !== value
        ));
      if (changedParams.length > 1) {
        console.warn('Received multiple changed param values: %o', changedParams);
      }
      changedParams.forEach(([name, paramValue]) => {
        let parameter = this.state.question.parameters.find(p => p.name === name);
        if (parameter) {
          const dependentParameters = this.getDependentParams(parameter).toArray();
          this.eventHandlers.updateParamValue({
            ...this.getContext(parameter),
            paramValue,
            dependentParameters
          });
        }
      });
    }

    const node = ReactDOM.findDOMNode(this);

    // Trigger event in case of question error
    if (
      get(prevState, 'questionStatus') !== get(this.state, 'questionStatus') &&
      this.state.questionStatus === 'error' &&
      this.props.paramValues != null
    ) {
      if (node) {
        const event = new CustomEvent(LegacyParamController.UNRECOVERABLE_PARAM_ERROR_EVENT, { bubbles: true, cancelable: false });
        node.dispatchEvent(event);
      }
    }

    // Trigger validation event
    const parameter = this.getParameter();

    if (parameter != null && node != null) {
      const eventType = ParamModules.isParamValueValid(this.getContext(parameter), this.state.paramUIState[parameter.name])
        ? LegacyParamController.PARAM_VALID_EVENT
        : LegacyParamController.PARAM_INVALID_EVENT;
        const event = new CustomEvent(eventType, { bubbles: true, cancelable: false });
        node.dispatchEvent(event);
    }
  }

  isRenderDataLoadError() {
    return this.state.questionStatus === 'error';
  }

  isRenderDataLoaded() {
    return this.state.questionStatus === 'complete';
  }

  isRenderDataNotFound() {
    return this.state.questionStatus === 'not-found';
  }

  getParameter() {
    return this.isRenderDataLoaded()
      ? this.state.question.parameters.find(p => p.name === this.props.paramName)
      : undefined;
  }

  getContext<T extends Parameter>(parameter: T): Context<T> {
    return {
      questionName: this.state.question.urlSegment,
      parameter: parameter,
      paramValues: this.state.paramValues
    }
  }

  renderDataLoadError() {
    const isProbablyRevise = this.props.paramValues != null;
    const errorMessage = 'Data for this parameter could not be loaded.' +
      (isProbablyRevise ? ' The strategy this search belongs to will have to recreated.' : '');

    return (
      <div>
        <div style={{ color: 'red', fontSize: '1.4em', fontWeight: 500 }}>
          {errorMessage}
        </div>

        {isProbablyRevise && [
          <div style={{ fontWeight: 'bold', padding: '1em 0' }}>Current value:</div>,
          <div style={{ maxHeight: 300, overflow: 'auto', background: '#f3f3f3' }}>
            <pre>{prettyPrintRawValue(this.props.paramValues[this.props.paramName])}</pre>
          </div>
        ]}
      </div>
    );
  }

  renderView() {
    const parameter = this.getParameter();

    if (parameter == null) return null;

    const ctx = this.getContext(parameter);

    if (this.state.paramErrors[parameter.name]) {
      return (
        <div>
          <div style={{ color: 'red', fontSize: '2em', fontStyle: 'italic', margin: '1em 0' }}>
            Oops... something went wrong.
          </div>
          <p>Not all of the data could be loaded. Support staff have been notified of the problem and are looking into it.</p>
        </div>
      )
    }

    const ParameterInput = isEnumParam(parameter) ? EnumParameterInput : SimpleParamterInput;

    return (
      <div>
        <this.paramModules.ParamComponent
          ctx={ctx}
          parameter={parameter}
          dispatch={this.dispatchAction}
          value={this.state.paramValues[parameter.name]}
          uiState={this.state.paramUIState[parameter.name]}
          onParamValueChange={(paramValue: string) => {
            const dependentParameters = this.getDependentParams(parameter).toArray();
            this.eventHandlers.updateParamValue({
              ...ctx,
              paramValue,
              dependentParameters
            });
          }}
        />
        <ParameterInput
          name={this.props.paramName}
          value={this.state.paramValues[this.props.paramName]}
          parameter={parameter}
        />
      </div>
    )
  }

}

type ParameterInputProps = {
  name: string;
  value: string;
  parameter: Parameter;
}

/**
 * Input element that emits change events so that it can participate in classic
 * question page (see wdk/js/components/paramterHandlers.js).
 */
class SimpleParamterInput extends React.Component<ParameterInputProps> {

  input: HTMLInputElement | null = null;

  dispatchChangeEvent = debounce(this._dispatchChangeEvent, 1000);

  componentDidUpdate(prevProps: ParameterInputProps) {
    if (prevProps.value !== this.props.value) {
      this.dispatchChangeEvent();
    }
  }

  _dispatchChangeEvent() {
    if (this.input == null) {
      console.warn("Input field is not defined. Skipping event dispatch.");
      return;
    }
    this.input.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  render() {
    return (
      <input
        ref={el => this.input = el}
        type="hidden"
        id={this.props.name}
        name={`value(${this.props.name})`}
        value={this.props.value}
      />
    );
  }

}

type EnumParameterInputProps = {
  name: string;
  value: string;
  parameter: EnumParam;
}

class EnumParameterInput extends React.Component<EnumParameterInputProps> {
  render() {
    const options = TreeBoxEnumParam.isType(this.props.parameter)
      ? Seq.from(preorder(this.props.parameter.vocabulary, node => node.children))
        .filter(node => node.children.length == 0)
        .map(node => node.data.term)
        .toArray()
      : this.props.parameter.vocabulary.map(entry => entry[0])
    const selected = this.props.value ? new Set(this.props.value.split(',')) : new Set();
    return (
      <React.Fragment>
        {options.map(value =>
          <EnumCheckbox key={value} checked={selected.has(value)} name={this.props.name} value={value}/>
        )}
      </React.Fragment>
    );
  }
}

type EnumCheckboxProps = {
  name: string;
  value: string;
  checked: boolean;
}

class EnumCheckbox extends React.Component<EnumCheckboxProps> {
  input: HTMLInputElement | null = null;

  dispatchChangeEvent = debounce(this._dispatchChangeEvent, 1000);

  componentDidUpdate(prevProps: EnumCheckboxProps) {
    if (prevProps.checked !== this.props.checked) {
      this.dispatchChangeEvent();
    }
  }

  _dispatchChangeEvent() {
    if (this.input == null) {
      console.warn("Input field is not defined. Skipping event dispatch.");
      return;
    }
    this.input.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  render() {
    return (
      <input
        ref={el => this.input = el}
        style={{ display: 'none' }}
        type="checkbox"
        checked={this.props.checked}
        readOnly={true}
        name={`array(${this.props.name})`}
        value={this.props.value}
      />
    );
  }

}

function prettyPrintRawValue(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 4);
  }
  catch (e) {
    return value;
  }
}
