import Footer from './components/common/Footer';
import * as Dataset from './components/records/DatasetRecordClasses.DatasetRecordClass';
import * as Transcript from './components/records/TranscriptRecordClasses.TranscriptRecordClass';

// Remove project_id from record links
export function RecordLink(DefaultComponent) {
  return function ApiRecordLink(props) {
    let recordId = props.recordId.filter(p => p.name !== 'project_id');
    return (
      <DefaultComponent {...props} recordId={recordId}/>
    );
  };
}


// Munge url so that we can hide pieces of primary key we don't want users to see.
//
// `splat` refers to a wildcard dynamic url segment
// as defined by the record route. The value of splat is essentially primary key
// values separated by a '/'.
const DEFAULT_TRANSCRIPT_MAGIC_STRING = '_DEFAULT_TRANSCRIPT_';
export function RecordController(DefaultComponent) {
  return function ApiRecordController(props) {
    let { splat, recordClass } = props.params;
    let projectIdUrl = '/' + wdk.MODEL_NAME;
    let hasProjectId = splat.endsWith(projectIdUrl);

    if (hasProjectId) {
      setTimeout(function() {
        props.router.replaceWith(props.path.replace(projectIdUrl, ''));
      }, 0);
      return <Wdk.client.Components.Loading/>;
    }

    if (recordClass === 'dataset') {
      return ( <DefaultComponent {...props} /> );
    }

    let params = recordClass === 'gene' && splat.split('/').length === 1

      ? Object.assign({}, props.params, {
          splat: [ splat, DEFAULT_TRANSCRIPT_MAGIC_STRING, wdk.MODEL_NAME ].join('/')
        })

      : Object.assign({}, props.params, {
          splat: [ splat, wdk.MODEL_NAME ].join('/')
        });

    return (
      <DefaultComponent {...props} params={params}/>
    );
  };
}

// Add footer and beta message to Main content
export function Main(DefaultComponent) {
  return function ApiMain(props) {
    return (
      <DefaultComponent {...props}>
        <div
          className="eupathdb-Beta-Announcement"
          title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
            You are viewing a <strong>BETA</strong> (pre-release) page. <a data-name="contact_us" className="new-window" href="contact.do">Feedback and comments</a> are welcome!
        </div>
        {props.children}
        <Footer/>
      </DefaultComponent>
    );
  };
}

// Customize the Record Component
export function RecordUI(DefaultComponent) {
  return function ApiRecordUI(props) {
    switch (props.recordClass.name) {
      case 'DatasetRecordClasses.DatasetRecordClass':
        return <Dataset.RecordUI {...props}/>

      default:
        return <DefaultComponent {...props}/>
    }
  };
}

export function RecordOverview(DefaultComponent) {
  return function ApiRecordOverview(props) {
    switch (props.recordClass.name) {
      case 'TranscriptRecordClasses.TranscriptRecordClass':
        return (
          <Transcript.RecordOverview
            {...props}
            DefaultComponent={DefaultComponent}
          />
        );

      default:
        return <DefaultComponent {...props}/>
    }
  };
}

export function RecordMainSection(DefaultComponent) {
  return function ApiRecordMainSection(props) {
    if (props.recordClass.name == 'TranscriptRecordClasses.TranscriptRecordClass' && props.depth == null) {
      return <Transcript.RecordMainSection {...props} DefaultComponent={DefaultComponent}/>;
    }
    return <DefaultComponent {...props}/>
  };
}

export function RecordNavigationSectionCategories(DefaultComponent) {
  return function ApiRecordNavigationSectionCategories(props) {
    switch (props.recordClass.name) {
      case 'TranscriptRecordClasses.TranscriptRecordClass':
        return (
          <Transcript.RecordNavigationSectionCategories
            {...props}
            DefaultComponent={DefaultComponent}
          />
        );

      default:
        return <DefaultComponent {...props}/>
    }
  };
}

let expressionRE = /ExpressionGraphs$/;
export function RecordTable(RecordTable) {
  return function ApiRecordTable(props) {
    let Table = RecordTable;
    if (expressionRE.test(props.tableMeta.name)) {
      Table = Transcript.ExpressionGraphTable;
    }
    if (props.tableMeta.name === 'MercatorTable') {
      Table = Transcript.MercatorTable;
    }
    return <Table {...props} DefaultComponent={RecordTable}/>;
  };
}
