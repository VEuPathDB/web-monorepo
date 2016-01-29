import React from 'react';
import * as Wdk from 'wdk-client';

let utils = Wdk.ReporterUtils;
let ReporterCheckboxList = Wdk.Components.ReporterCheckboxList;

let TabularReporterForm = React.createClass({

  render() {
    return ( <div>I'm the form for Tab-delimited!</div> );
  }

});

export default TabularReporterForm;