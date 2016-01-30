import { Components } from 'wdk-client';
import Footer from './components/common/Footer';
import * as Dataset from './components/records/DatasetRecordClasses.DatasetRecordClass';
import * as Transcript from './components/records/TranscriptRecordClasses.TranscriptRecordClass';

// load individual reporter forms                                                                        
import TabularReporterForm from './components/reporters/TabularReporterForm';
import FastaReporterForm from './components/reporters/FastaReporterForm';
import Gff3ReporterForm from './components/reporters/Gff3ReporterForm';
import TextReporterForm from './components/reporters/TextReporterForm';
import XmlReporterForm from './components/reporters/XmlReporterForm';
import JsonReporterForm from './components/reporters/JsonReporterForm';

// Remove project_id from record links
export function RecordLink(WdkRecordLink) {
  return function ApiRecordLink(props) {
    let recordId = props.recordId.filter(p => p.name !== 'project_id');
    return (
      <WdkRecordLink {...props} recordId={recordId}/>
    );
  };
}

// Munge url so that we can hide pieces of primary key we don't want users to see.
//
// `splat` refers to a wildcard dynamic url segment
// as defined by the record route. The value of splat is essentially primary key
// values separated by a '/'.
const DEFAULT_TRANSCRIPT_MAGIC_STRING = '_DEFAULT_TRANSCRIPT_';

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = [ 'dataset', 'genomic-sequence' ];

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

    // These record classes do not need the project id as a part of the primary key
    // so we just render with the url params as-is.
    if (RECORD_CLASSES_WITHOUT_PROJECT_ID.indexOf(recordClass) > -1) {
      return ( <WdkRecordController {...props} /> );

    if (recordClass != 'dataset' && !hasProjectId) {
      let params = Object.assign({}, props.params, {
        splat: splat + projectIdUrl
      });
      return (
        <WdkRecordController {...props} params={params}/>
      );
    }

    let params = recordClass === 'gene' && splat.split('/').length === 1

      ? Object.assign({}, props.params, {
          splat: [ splat, DEFAULT_TRANSCRIPT_MAGIC_STRING, wdk.MODEL_NAME ].join('/')
        })

      : Object.assign({}, props.params, {
          splat: [ splat, wdk.MODEL_NAME ].join('/')
        });

    return (
      <WdkRecordController {...props} params={params}/>
    );
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

// export function RecordOverview(WdkRecordOverview) {
//   return function ApiRecordOverview(props) {
//     switch (props.recordClass.name) {
//       case 'TranscriptRecordClasses.TranscriptRecordClass':
//         return (
//           <Transcript.RecordOverview
//             {...props}
//             DefaultComponent={WdkRecordOverview}
//           />
//         );
//
//       default:
//         return <WdkRecordOverview {...props}/>
//     }
//   };
// }

export function RecordMainSection(WdkRecordMainSection) {
  return function ApiRecordMainSection(props) {
    if (props.recordClass.name == 'TranscriptRecordClasses.TranscriptRecordClass' && props.depth == null) {
      return <Transcript.RecordMainSection {...props} DefaultComponent={WdkRecordMainSection}/>;
    }
    return <WdkRecordMainSection {...props}/>
  };
}

/*
export function RecordNavigationSectionCategories(WdkRecordNavigationSectionCategories) {
  return function ApiRecordNavigationSectionCategories(props) {
    switch (props.recordClass.name) {
      case 'TranscriptRecordClasses.TranscriptRecordClass':
        return (
          <Transcript.RecordNavigationSectionCategories
            {...props}
            DefaultComponent={WdkRecordNavigationSectionCategories}
          />
        );

      default:
        return <WdkRecordNavigationSectionCategories {...props}/>
    }
  };
}
*/

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
    let Table = WdkRecordTable;
    if (expressionRE.test(props.tableMeta.name)) {
      Table = Transcript.ExpressionGraphTable;
    }
    if (props.tableMeta.name === 'MercatorTable') {
      Table = Transcript.MercatorTable;
    }
    return <Table {...props} DefaultComponent={WdkRecordTable}/>;
  };
}

export function RecordAttribute(WdkRecordAttribute) {
  return function ApiRecordAttribute(props) {
    if (props.name === 'dna_gtracks') {
      return ( <Transcript.GbrowseContext {...props} /> );
    }

    if (props.name === 'protein_gtracks') {
      return ( <Transcript.ProteinContext {...props} /> );
    }

    return ( <WdkRecordAttribute {...props}/> );
  };
}
