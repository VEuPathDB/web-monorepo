import React from 'react';
import * as Wdk from 'wdk-client';

let utils = Wdk.ReporterUtils;
let ReporterCheckboxList = Wdk.Components.ReporterCheckboxList;

let Gff3ReporterForm = React.createClass({

  render() {
    return ( <div>I'm the form for GFF 3!</div> );
  }

});

export default Gff3ReporterForm;