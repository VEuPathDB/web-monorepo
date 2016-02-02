import { Components } from 'wdk-client';
import Footer from './components/common/Footer';
import ExpressionGraph from './components/common/ExpressionGraph';
import * as Dataset from './components/records/DatasetRecordClasses.DatasetRecordClass';

// load individual reporter forms
import TabularReporterForm from './components/reporters/TabularReporterForm';
import FastaReporterForm from './components/reporters/FastaReporterForm';
import Gff3ReporterForm from './components/reporters/Gff3ReporterForm';
import TextReporterForm from './components/reporters/TextReporterForm';
import XmlReporterForm from './components/reporters/XmlReporterForm';
import JsonReporterForm from './components/reporters/JsonReporterForm';

// Add project id to url.
//
// `splat` refers to a wildcard dynamic url segment
// as defined by the record route. The value of splat is essentially primary key
// values separated by a '/'.
export function RecordController(WdkRecordController) {
  return function ApiRecordController(props) {
    let { splat, recordClass } = props.params;
    let projectIdUrl = '/' + wdk.MODEL_NAME;
    let hasProjectId = splat.endsWith(projectIdUrl);

    if (hasProjectId) {
      setTimeout(function() {
        props.router.replaceWith(props.path.replace(projectIdUrl, ''));
      }, 0);
      return <Components.Loading/>;
    }

    if (recordClass != 'dataset' && !hasProjectId) {
      let params = Object.assign({}, props.params, {
        splat: splat + projectIdUrl
      });
      return (
        <WdkRecordController {...props} params={params}/>
      );
    }

    return <WdkRecordController {...props} />
  };
}

// Add footer and beta message to Main content
export function Main(WdkMain) {
  return function ApiMain(props) {
    return (
      <WdkMain {...props}>
        <div
          className="eupathdb-Beta-Announcement"
          title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
            You are viewing a <strong>BETA</strong> (pre-release) page. <a data-name="contact_us" className="new-window" href="contact.do">Feedback and comments</a> are welcome!
        </div>
        {props.children}
        <Footer/>
      </WdkMain>
    );
  };
}

// Customize the Record Component
export function RecordUI(WdkRecordUI) {
  return function ApiRecordUI(props) {
    switch (props.recordClass.name) {
      case 'DatasetRecordClasses.DatasetRecordClass':
        return <Dataset.RecordUI {...props}/>

      default:
        return <WdkRecordUI {...props}/>
    }
  };
}

// Customize the reporter form to select the correct
export function StepDownloadForm(WdkStepDownloadForm) {
  return function ApiStepDownloadForm(props) {
    switch(props.selectedReporter) {
      case 'tabular':
        return ( <TabularReporterForm {...props}/> );
      case 'srt':
        return ( <FastaReporterForm {...props}/> );
      case 'gff3':
        return ( <Gff3ReporterForm {...props}/> );
      case 'fullRecord':
        return ( <TextReporterForm {...props}/> );
      case 'xml':
        return ( <XmlReporterForm {...props}/> );
      case 'json':
        return ( <JsonReporterForm {...props}/> );
      // uncomment if adding service json reporter to model
      //case 'wdk-service-json':
      //  return ( <Components.WdkServiceJsonReporterForm {...props}/> );
      default:
        return ( <noscript/> );
    }
  }
}

let expressionRE = /ExpressionGraphs$/;
export function RecordTable(WdkRecordTable) {
  return function ApiRecordTable(props) {
    if (expressionRE.test(props.tableMeta.name)) {

      let included = props.tableMeta.properties.includeInTable || [];

      let tableMeta = Object.assign({}, props.tableMeta, {
        attributes: props.tableMeta.attributes.filter(tm => included.indexOf(tm.name) > -1)
      });

      return (
        <WdkRecordTable
          {...props}
          tableMeta={tableMeta}
          childRow={childProps =>
            <ExpressionGraph rowData={props.table[childProps.rowIndex]}/>}
          />
      );
    }

    return <WdkRecordTable {...props}/>;
  };
}
