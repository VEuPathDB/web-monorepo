/**
 * This component demonstrates how to use WDK components and utilities to build
 * a form that easily handles events and maintains its own state.
 * 
 * In this example, form state is maintained in the component's state; however,
 * in most Flux implementations, the state would be maintained in a Store, the
 * modifications of which would be monitored by a View Controller, which would
 * pass the form state down to the form component.
 * 
 * This Form shows usage of the following WDK components:
 * 
 * TextBox
 * PasswordBox (i.e. TextBox with type="password")
 * TextArea
 * CheckBox
 * RadioList
 * SingleSelect
 * MultiSelect
 * CheckboxList
 */

import React from 'react';
import * as utils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { TextBox, TextArea, Checkbox, CheckboxList, RadioList, SingleSelect, MultiSelect } from '@veupathdb/wdk-client/lib/Components';

let convert = arr => arr.map(str => ({ value: str, display: str }));

// define some dummy data to appear in the selection inputs
let option1Values = convert([ 'here', 'is', 'a', 'set', 'of', 'options' ]);
let option2Values = convert([ 'another', 'set', 'of', 'options', 'wow' ]);
let options3Values = convert([ 'how', 'can', 'we', 'have', 'this', 'many', 'options' ]);
let options4Values = convert([ 'options', 'done', 'no', 'more', 'choices' ]);

// define the initial state of the form
let initialState = {
    text1: 'abc',
    pass1: '123',
    textarea1: 'some stuff',
    checkbox1: false,
    option1: 'here',
    option2: 'another',
    options3: [],
    options4: []
};

let divStyle = {
  "width": "45%",
  "display": "inline-block",
  "border": "1px solid lightgray",
  "borderRadius": "10px",
  "padding": "5px",
  "margin": "10px",
  "verticalAlign": "top",
  "overflow": "scroll"
};

let ParamBox = props => {
  return (
    <div>
      <hr/>
      <div style={{margin:'0.4em 0'}}>{props.name}:</div>
      {props.children}
    </div>
  );
};

// Create a React component to control the form.  Since this is an example, it
// will maintain the form state in this.state.  You can see this in the
// onFormChange() function.  In a typical Flux implementation, onFormChange()
// would, instead, call and action creator with the updated state.
class SampleForm extends React.Component {

  constructor(props) {
    super(props);
    // bind method to instance so that it can be called without a receiver (i.e., as a function).
    this.getParamChangeHandler = this.getParamChangeHandler.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
    // set the form state to the initial state defined above
    this.state = initialState;
  }

  // child components (the input fields) will call this function with the
  // updated form state whenever they are modified
  onFormChange(newState) {
    this.setState(newState);
  }

  // uses the getChangeHandler utility to generate an individual input change
  // handler, which will create an updated copy of the form's current state and
  // hand it to the form's onFormChange function
  getParamChangeHandler(name) {
    return utils.getChangeHandler(name, this.onFormChange, this.state);
  }

  // renders a page with two panes: the left contains a form demonstrating
  // various form elements, the right contains the form state in JSON
  render() {
    let values = this.state;
    let handler = this.getParamChangeHandler;
    return (
      <div>
        <div style={divStyle}>
          <h2>Please fill in the form:</h2>
          <ParamBox name="Text 1">
            <TextBox value={values.text1} onChange={handler('text1')}/>
          </ParamBox>
          <ParamBox name="Pass 1">
            <TextBox type="password" value={values.pass1} onChange={handler('pass1')}/>
          </ParamBox>
          <ParamBox name="TextArea 1">
            <TextArea value={values.textarea1} onChange={handler('textarea1')}/>
          </ParamBox>
          <ParamBox name="CheckBox 1">
            <Checkbox value={values.checkbox1} onChange={handler('checkbox1')}/>
          </ParamBox>
          <ParamBox name="Option 1">
            <RadioList value={values.option1} items={option1Values} onChange={handler('option1')}/>
          </ParamBox>
          <ParamBox name="Option 2">
            <SingleSelect value={values.option2} items={option2Values} onChange={handler('option2')}/>
          </ParamBox>
          <ParamBox name="Options 3">
            <MultiSelect value={values.options3} items={options3Values} onChange={handler('options3')} size="6"/>
          </ParamBox>
          <ParamBox name="Options 4">
            <CheckboxList value={values.options4} items={options4Values} onChange={handler('options4')}/>
          </ParamBox>
        </div>
        <div style={divStyle}>
          <h2>Form state in JSON:</h2>
          <pre>
            {JSON.stringify(this.state, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}

export default SampleForm;
