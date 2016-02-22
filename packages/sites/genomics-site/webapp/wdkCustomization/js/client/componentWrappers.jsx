import { Components } from 'wdk-client';
import Footer from './components/common/Footer';
import * as Dataset from './components/records/DatasetRecordClasses.DatasetRecordClass';
import * as Gene from './components/records/GeneRecordClasses.GeneRecordClass';

// load individual reporter forms
import TabularReporterForm from './components/reporters/TabularReporterForm';
import TextReporterForm from './components/reporters/TextReporterForm';
import XmlReporterForm from './components/reporters/XmlReporterForm';
import JsonReporterForm from './components/reporters/JsonReporterForm';
import Gff3ReporterForm from './components/reporters/Gff3ReporterForm';
import FastaGeneReporterForm from './components/reporters/FastaGeneReporterForm';
import FastaGenomicSequenceReporterForm from './components/reporters/FastaGenomicSequenceReporterForm';
import FastaOrfReporterForm from './components/reporters/FastaOrfReporterForm';

// Remove project_id from record links
export function RecordLink(WdkRecordLink) {
  return function ApiRecordLink(props) {
    let recordId = props.recordId.filter(p => p.name !== 'project_id');
    return (
      <WdkRecordLink {...props} recordId={recordId}/>
    );
  };
}

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = [ 'dataset', 'genomic-sequence' ];


/**
 * Munge url so that we can hide pieces of primary key we don't want users to see.
 *
 * The general operation that is happening below is that we are intercepting the
 * props sent to the WDK RecordController component and adding the project id
 * when it is needed.
 *
 * Conceptually, this could also be done at the action creator level. If WDK
 * provided a way to customize a view controller's action creator, we could
 * just append the project id when needed.
 *
 * Note that we are doing a few other things here, which is to say this override
 * is a bit of a jumble at the moment.
 *
 * `splat` refers to a wildcard dynamic url segment
 * as defined by the record route. The value of splat is essentially primary key
 * values separated by a '/'.
 */
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
    }

    /*
    if (recordClass === Gene.GENE_ID) {
      let [ geneId, transcriptId ] = splat.split('/');

      if (transcriptId == null) {

        // only the gene id is requested... either use the last transcript id the
        // user requested for the gene id, or use the default
        transcriptId = window.sessionStorage.getItem(
          Gene.TRANSCRIPT_ID_KEY_PREFIX + geneId) || DEFAULT_TRANSCRIPT_MAGIC_STRING;

        // add transcript id to request
        splat = `${geneId}/${transcriptId}`;
      }
    }
    */

    // Append project id to request
    let params = Object.assign({}, props.params, {
      splat: `${splat}/${wdk.MODEL_NAME}`
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
        {/*
        <div
          className="eupathdb-Beta-Announcement"
          title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
            You are viewing a <strong>BETA</strong> (pre-release) page. <a data-name="contact_us" className="new-window" href="contact.do">Feedback and comments</a> are welcome!
        </div>
        */}
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

export function RecordOverview(WdkRecordOverview) {
  return function ApiRecordOverview(props) {
    switch (props.recordClass.name) {
      case Gene.RECORD_CLASS_NAME:
        return (
          <Gene.RecordOverview
            {...props}
            DefaultComponent={WdkRecordOverview}
          />
        );

      default:
        return <WdkRecordOverview {...props}/>
    }
  };
}

/*
export function RecordMainSection(WdkRecordMainSection) {
  return function ApiRecordMainSection(props) {
    if (props.recordClass.name ==  Gene.RECORD_CLASS_NAME && props.depth == null) {
      return <Gene.RecordMainSection {...props} DefaultComponent={WdkRecordMainSection}/>;
    }
    return <WdkRecordMainSection {...props}/>
  };
}
*/

/*
export function RecordNavigationSectionCategories(WdkRecordNavigationSectionCategories) {
  return function ApiRecordNavigationSectionCategories(props) {
    switch (props.recordClass.name) {
      case 'TranscriptRecordClasses.TranscriptRecordClass':
        return (
          <Gene.RecordNavigationSectionCategories
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

// Customize StepDownloadForm to show the appropriate form based on the
//   selected reporter and record class
export function StepDownloadForm(WdkStepDownloadForm) {
  return function ApiStepDownloadForm(props) {
    switch (props.selectedReporter) {
      case 'tabular':
        return ( <TabularReporterForm {...props}/> );
      case 'srt':
        switch (props.recordClass.name) {
          case 'GeneRecordClasses.GeneRecordClass':
            return ( <FastaGeneReporterForm {...props}/> );
          case 'SequenceRecordClasses.SequenceRecordClass':
            return ( <FastaGenomicSequenceReporterForm {...props}/> );
          case 'OrfRecordClasses.OrfRecordClass':
            return ( <FastaOrfReporterForm {...props}/> );
          default:
            console.error("Unsupported FASTA recordClass: " + props.recordClass.name);
            return ( <noscript/> );
        }
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
    if (expressionRE.test(props.table.name)) {
      Table = Gene.ExpressionGraphTable;
    }
    if (props.table.name === 'MercatorTable') {
      Table = Gene.MercatorTable;
    }
    return <Table {...props} DefaultComponent={WdkRecordTable}/>;
  };
}

export function RecordAttribute(WdkRecordAttribute) {
  return function ApiRecordAttribute(props) {
    switch (props.recordClass.name) {
      case Gene.RECORD_CLASS_NAME:
        return <Gene.GeneRecordAttribute {...props} WdkRecordAttribute={WdkRecordAttribute}/>

      default:
        return <WdkRecordAttribute {...props}/>
    }
  };
}
