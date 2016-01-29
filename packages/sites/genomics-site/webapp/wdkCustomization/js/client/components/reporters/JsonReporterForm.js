import React from 'react';
import * as Wdk from 'wdk-client';

let utils = Wdk.ReporterUtils;
let ReporterCheckboxList = Wdk.Components.ReporterCheckboxList;

let JsonReporterForm = React.createClass({

  render() {
    return ( <div>I'm the form for JSON!</div> );
  }

});

export default JsonReporterForm;