import { debounce, get } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  updateActiveQuestion,
  unloadQuestion,
  updateParamValue
} from 'wdk-client/Actions/QuestionActions';
import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { preorder } from 'wdk-client/Utils/TreeUtils';
import { EnumParam, Parameter } from 'wdk-client/Utils/WdkModel';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';

import * as ParamModules from 'wdk-client/Views/Question/Params';
import { isEnumParam } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import TreeBoxEnumParam from 'wdk-client/Views/Question/Params/TreeBoxEnumParam';
import { Context } from 'wdk-client/Views/Question/Params/Utils';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';

const ActionCreators = {
  setActiveQuestion: updateActiveQuestion,
  updateParamValue
}

type OwnProps = {
  searchName: string;
  paramName: string;
  paramValues: Record<string, string>;
  stepId: number | undefined;
}

type StateProps = QuestionState;

type DispatchProps = {
  eventHandlers: typeof ActionCreators;
  dispatch: Dispatch;
}

type Props = { own: OwnProps, mapped: StateProps & DispatchProps };

class LegacyParamController extends ViewController<Props> {

  static readonly UNRECOVERABLE_PARAM_ERROR_EVENT = 'unrecoverable-param-error';
  static readonly PARAM_VALID_EVENT = 'param-valid';
  static readonly PARAM_INVALID_EVENT = 'param-invalid';


  paramModules = ParamModules;

  componentWillUnmount() {
    const { searchName } = this.props.own;
    this.props.mapped.dispatch(unloadQuestion({ searchName }));
  }

  loadData(prevProps?: Props, prevState?: QuestionState) {
    if (
      this.props.mapped.questionStatus == null ||
      this.props.mapped.stepId !== this.props.own.stepId
    ) {
      this.props.mapped.eventHandlers.setActiveQuestion({
        searchName: this.props.own.searchName,
        autoRun: false,
        prepopulateWithLastParamValues: false,
        initialParamData: this.props.own.paramValues,
        stepId: this.props.own.stepId
      });
    }

    else if (prevProps != null) {
      let prevParamValues = prevProps.own.paramValues || {};
      let paramValues = this.props.own.paramValues || {};
      let changedParams = Object.entries(paramValues)
        .filter(([name, value]) => (
          prevParamValues[name] !== value &&
          this.props.mapped.paramValues[name] !== value
        ));
      if (changedParams.length > 1) {
        console.warn('Received multiple changed param values: %o', changedParams);
      }
      changedParams.forEach(([name, paramValue]) => {
        let parameter = this.props.mapped.question.parameters.find(p => p.name === name);
        if (parameter) {
          this.props.mapped.eventHandlers.updateParamValue({
            ...this.getContext(parameter),
            paramValue,
          });
        }
      });
    }

    const node = ReactDOM.findDOMNode(this);

    // Trigger event in case of question error
    if (
      get(prevState, 'questionStatus') !== get(this.state, 'questionStatus') &&
      this.props.mapped.questionStatus === 'error' &&
      this.props.own.paramValues != null
    ) {
      if (node) {
        const event = new CustomEvent(LegacyParamController.UNRECOVERABLE_PARAM_ERROR_EVENT, { bubbles: true, cancelable: false });
        node.dispatchEvent(event);
      }
    }

    // Trigger validation event
    const parameter = this.getParameter();

    if (parameter != null && node != null) {
      const eventType = ParamModules.isParamValueValid(this.getContext(parameter), this.props.mapped.paramUIState[parameter.name])
        ? LegacyParamController.PARAM_VALID_EVENT
        : LegacyParamController.PARAM_INVALID_EVENT;
        const event = new CustomEvent(eventType, { bubbles: true, cancelable: false });
        node.dispatchEvent(event);
    }
  }

  isRenderDataLoadError() {
    return this.props.mapped.questionStatus === 'error';
  }

  isRenderDataLoaded() {
    return this.props.mapped.questionStatus === 'complete';
  }

  isRenderDataNotFound() {
    return this.props.mapped.questionStatus === 'not-found';
  }

  getParameter() {
    return this.isRenderDataLoaded()
      ? this.props.mapped.question.parameters.find(p => p.name === this.props.own.paramName)
      : undefined;
  }

  getContext<T extends Parameter>(parameter: T): Context<T> {
    return {
      searchName: this.props.mapped.question.urlSegment,
      parameter: parameter,
      paramValues: this.props.mapped.paramValues
    }
  }

  renderDataLoadError() {
    const isProbablyRevise = this.props.own.paramValues != null;
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
            <pre>{prettyPrintRawValue(this.props.own.paramValues[this.props.own.paramName])}</pre>
          </div>
        ]}
      </div>
    );
  }

  renderView() {
    const parameter = this.getParameter();

    if (parameter == null) return null;

    const ctx = this.getContext(parameter);

    if (this.props.mapped.paramErrors[parameter.name]) {
      return (
        <div>
          <div style={{ color: 'red', fontSize: '2em', fontStyle: 'italic', margin: '1em 0' }}>
            Oops... something went wrong.
          </div>
          <p>Not all of the data could be loaded. Support staff have been notified of the problem and are looking into it.</p>
        </div>
      )
    }

    const paramInput = isEnumParam(parameter)
      ? <EnumParameterInput
          name={this.props.own.paramName}
          value={this.props.mapped.paramValues[this.props.own.paramName]}
          parameter={parameter}
        />
      : <SimpleParamterInput
          name={this.props.own.paramName}
          value={this.props.mapped.paramValues[this.props.own.paramName]}
          parameter={parameter}
        />

    return (
      <div>
        <this.paramModules.ParamComponent
          ctx={ctx}
          parameter={parameter}
          dispatch={this.props.mapped.dispatch}
          value={this.props.mapped.paramValues[parameter.name]}
          uiState={this.props.mapped.paramUIState[parameter.name]}
          onParamValueChange={(paramValue: string) => {
            this.props.mapped.eventHandlers.updateParamValue({
              ...ctx,
              paramValue,
            });
          }}
        />
        {paramInput}
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
    const options = this.props.parameter.displayType === 'treeBox'
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

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, props) => state.question.questions[props.searchName] || {} as QuestionState,
  dispatch => ({ dispatch, eventHandlers: bindActionCreators(ActionCreators, dispatch) }),
  (stateProps, dispatchProps, ownProps) => ({ mapped: { ...stateProps, ...dispatchProps }, own: ownProps})
)

export default enhance(LegacyParamController);


function prettyPrintRawValue(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 4);
  }
  catch (e) {
    return value;
  }
}
