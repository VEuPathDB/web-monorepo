import React, { Component, ReactNode } from 'react';
import { WdkStatusIcon } from '../../Components/Icon/WdkStatusIcon';
import RadioList from '../../Components/InputControls/RadioList';
import {
  filterOutProps,
  wrappable,
  safeHtml,
} from '../../Utils/ComponentUtils';
import DownloadForm from '../../Views/ReporterForm/DownloadForm';
import { Reporter, RecordClass, FilterValueArray } from '../../Utils/WdkModel';
import { ResultType } from '../../Utils/WdkResult';

const NO_REPORTER_SELECTED = '_none_';

interface ReporterSelectProps {
  reporters: Reporter[];
  selected: string | null;
  onChange: (value: string) => void;
}

const ReporterSelect = (props: ReporterSelectProps): JSX.Element => {
  const { reporters, selected, onChange } = props;
  if (reporters.length < 2) return <noscript />;
  const nestedDivStyle = {
    display: 'inline-block',
    verticalAlign: 'top' as const,
  };
  const items = reporters.map((reporter) => ({
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

function getTitle(
  scope: string | null,
  resultType: ResultType,
  recordClass: RecordClass
): ReactNode {
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

interface DownloadFormContainerProps {
  scope: string | null;
  resultType: ResultType;
  availableReporters: Reporter[];
  selectedReporter: string | null;
  recordClass: RecordClass;
  selectReporter: (value: string) => void;
  submitForm: (
    resultType: ResultType,
    selectedReporter: string,
    formState: any,
    viewFilters?: FilterValueArray
  ) => Promise<void>;
  includeTitle?: boolean;
  includeSubmit?: boolean;
  includeSelector?: boolean;
  [key: string]: any;
}

class DownloadFormContainer extends Component<DownloadFormContainerProps> {
  constructor(props: DownloadFormContainerProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  // create parameterless form submission function for forms to use
  async onSubmit(): Promise<void> {
    const { submitForm, resultType, selectedReporter, formState, viewFilters } =
      this.props;
    if (selectedReporter) {
      await submitForm(resultType, selectedReporter, formState, viewFilters);
    }
  }

  render(): JSX.Element {
    const {
      scope,
      resultType,
      availableReporters,
      selectedReporter,
      recordClass,
      selectReporter,
      includeTitle,
      includeSubmit,
      includeSelector = true,
    } = this.props;

    // create page title element
    const title = getTitle(scope, resultType, recordClass);

    // filter props we don't want to send to the child form
    const formProps = filterOutProps(this.props, [
      'selectReporter',
      'submitForm',
    ]);

    // incoming store value of null indicates no format currently selected
    let currentSelectedReporter = selectedReporter;
    if (currentSelectedReporter == null) {
      currentSelectedReporter = NO_REPORTER_SELECTED;
    }

    return (
      <div style={{ padding: '1em 3em' }}>
        {includeTitle && (
          <>
            {title}
            <hr />
          </>
        )}
        {includeSelector && (
          <ReporterSelect
            reporters={availableReporters}
            selected={currentSelectedReporter}
            onChange={selectReporter}
          />
        )}
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
