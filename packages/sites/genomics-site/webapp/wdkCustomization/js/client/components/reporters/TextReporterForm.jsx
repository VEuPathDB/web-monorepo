import React from 'react';
import * as Wdk from 'wdk-client';

let utils = Wdk.ReporterUtils;
let ReporterCheckboxList = Wdk.Components.ReporterCheckboxList;

let TextReporterForm = React.createClass({

  render() {
    return ( <div>I'm the form for Text!</div> );
  }

});

export default TextReporterForm;