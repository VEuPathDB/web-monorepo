import React, { Component } from 'react';
import RadioList from 'wdk-client/Components/InputControls/RadioList';
import { filterOutProps, wrappable } from 'wdk-client/Utils/ComponentUtils';
import DownloadForm from 'wdk-client/Views/ReporterForm/DownloadForm';
import PrimaryKeySpan from 'wdk-client/Views/ReporterForm/PrimaryKeySpan';

let NO_REPORTER_SELECTED = "_none_";

let ReporterSelect = props => {
  let { reporters, selected, onChange } = props;
  if (reporters.length < 2) return ( <noscript/> );
  let nestedDivStyle = { display: 'inline-block', verticalAlign: 'top' };
  let items = reporters.map(reporter =>
    ({ value: reporter.name, display: reporter.displayName, description: reporter.description }));
  return (
    <div style={{ margin: '20px 0'}}>
      <div style={nestedDivStyle}>
        <span style={{marginRight:'0.5em', fontWeight:'bold'}}>Choose a Report:</span>
      </div>
      <div style={nestedDivStyle}>
        <RadioList items={items} value={selected} onChange={onChange}/>
      </div>
    </div>
  );
};

function getTitle(scope, resultType, recordClass) {
  const estimatedSize = resultType.type === 'step' ? resultType.step.estimatedSize : '';
  const displayName = resultType.type === 'step' ? resultType.step.displayName
    : resultType.type === 'basket' ? 'basket'
    : 'records';
  switch (scope) {
    case 'results':
      return (
        <div>
          <h1>Download {estimatedSize} {recordClass.displayNamePlural}</h1>
          <span style={{fontSize: "1.5em"}}>Results are from search: {displayName}</span>
        </div>
      );
    case 'record':
      return ( <div><h1>Download {recordClass.displayName}: <PrimaryKeySpan primaryKeyString={displayName}/></h1></div> );
    default:
      return ( <div><h1>Download Results</h1></div> );
  }
}

class DownloadFormContainer extends Component {

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  // create parameterless form submission function for forms to use
  onSubmit() {
    let { submitForm, resultType, selectedReporter, formState } = this.props;
    submitForm(resultType, selectedReporter, formState);
  }

  render() {

    let { scope, resultType, availableReporters, selectedReporter, recordClass, selectReporter } = this.props;

    // create page title element
    let title = getTitle(scope, resultType, recordClass);

    // filter props we don't want to send to the child form
    let formProps = filterOutProps(this.props, [ 'selectReporter', 'submitForm' ]);

    // incoming store value of null indicates no format currently selected
    if (selectedReporter == null) {
      selectedReporter = NO_REPORTER_SELECTED;
    }

    return (
      <div style={{padding: '1em 3em'}}>
        {title}
        <ReporterSelect reporters={availableReporters} selected={selectedReporter} onChange={selectReporter}/>
        <DownloadForm {...formProps} onSubmit={this.onSubmit}/>
      </div>
    );
  }

}

export default wrappable(DownloadFormContainer);
