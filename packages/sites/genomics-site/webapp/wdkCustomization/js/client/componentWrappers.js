import Footer from './components/common/Footer';
import * as Dataset from './components/records/DatasetRecordClasses.DatasetRecordClass';
import * as Transcript from './components/records/TranscriptRecordClasses.TranscriptRecordClass';

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
