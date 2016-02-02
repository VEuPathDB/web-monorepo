import React from 'react';
import * as Wdk from 'wdk-client';

let utils = Wdk.ReporterUtils;
let ReporterCheckboxList = Wdk.Components.ReporterCheckboxList;

let XmlReporterForm = React.createClass({

  render() {
    return ( <div>I'm the form for XML!</div> );
  }

});

export default XmlReporterForm;