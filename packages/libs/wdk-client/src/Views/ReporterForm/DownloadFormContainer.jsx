import React, { Component } from 'react';
import { WdkStatusIcon } from '../../Components/Icon/WdkStatusIcon';
import RadioList from '../../Components/InputControls/RadioList';
import {
  filterOutProps,
  wrappable,
  safeHtml,
} from '../../Utils/ComponentUtils';
import DownloadForm from '../../Views/ReporterForm/DownloadForm';

let NO_REPORTER_SELECTED = '_none_';

let ReporterSelect = (props) => {
  let { reporters, selected, onChange } = props;
  if (reporters.length < 2) return <noscript />;
  let nestedDivStyle = { display: 'inline-block', verticalAlign: 'top' };
  let items = reporters.map((reporter) => ({
    value: reporter.name,
    display: (
      <>
        {reporter.displayName}
        <WdkStatusIcon buildIntroduced={reporter.newBuild} />
      </>
    ),
    description: reporter.description,
    newBuild: reporter.newBuild,
  }));
  return (
    <div style={{ margin: '20px 0' }}>
      <div style={nestedDivStyle}>
        <span style={{ marginRight: '0.5em', fontWeight: 'bold' }}>
          Choose a Report:
        </span>
      </div>
      <div style={nestedDivStyle}>
        <RadioList items={items} value={selected} onChange={onChange} />
      </div>
    </div>
  );
};

function getTitle(scope, resultType, recordClass) {
  switch (scope) {
    case 'results':
      switch (resultType.type) {
        case 'step':
          return (
            <div>
              <h1>
                Download {resultType.step.estimatedSize}{' '}
                {recordClass.displayNamePlural}
              </h1>
              <span style={{ fontSize: '1.5em' }}>
                Results are from search: {resultType.step.displayName}
              </span>
            </div>
          );
        case 'basket':
          return (
            <div>
              <h1>Download {recordClass.displayName} Basket</h1>
            </div>
          );
        default:
          return (
            <div>
              <h1>Download Results</h1>
            </div>
          );
      }
    case 'record': {
      // We should only get here with an answerSpec result
      const displayName =
        resultType.type === 'answerSpec'
          ? safeHtml(resultType.displayName)
          : 'Unknown';
      return (
        <div>
          <h1>
            Download {recordClass.displayName}: {displayName}
          </h1>
        </div>
      );
    }
    default:
      return (
        <div>
          <h1>Download Results</h1>
        </div>
      );
  }
}

class DownloadFormContainer extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  // create parameterless form submission function for forms to use
  onSubmit() {
    let { submitForm, resultType, selectedReporter, formState, viewFilters } =
      this.props;
    submitForm(resultType, selectedReporter, formState, viewFilters);
  }

  render() {
    let {
      scope,
      resultType,
      availableReporters,
      selectedReporter,
      recordClass,
      selectReporter,
      includeTitle,
      includeSubmit,
    } = this.props;

    // create page title element
    let title = getTitle(scope, resultType, recordClass);

    // filter props we don't want to send to the child form
    let formProps = filterOutProps(this.props, [
      'selectReporter',
      'submitForm',
    ]);

    // incoming store value of null indicates no format currently selected
    if (selectedReporter == null) {
      selectedReporter = NO_REPORTER_SELECTED;
    }

    return (
      <div style={{ padding: '1em 3em' }}>
        {includeTitle && title}
        <ReporterSelect
          reporters={availableReporters}
          selected={selectedReporter}
          onChange={selectReporter}
        />
        <DownloadForm
          {...formProps}
          onSubmit={this.onSubmit}
          includeSubmit={includeSubmit}
        />
      </div>
    );
  }
}

export default wrappable(DownloadFormContainer);
