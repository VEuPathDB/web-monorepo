import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { useCombinedResultProps } from '../hooks/combinedResults';
import { useIndividualResultProps } from '../hooks/individualResult';
import { IndividualQuery, SelectedResult } from '../utils/CommonTypes';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import { BlastRequestError } from './BlastRequestError';
import { MultiQueryReportResult } from './BlastWorkspaceResult';
import { CombinedResult } from './CombinedResult';
import { IndividualResult } from './IndividualResult';

export interface Props {
  multiQueryReportResult?: MultiQueryReportResult;
  filesToOrganisms: Record<string, string>;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  jobId: string;
  lastSelectedIndividualResult: number;
  multiQueryParamValues: ParameterValues;
  individualQueries: IndividualQuery[];
  selectedResult: SelectedResult;
  targetTypeTerm: string;
  wdkRecordType: string;
}

export function ResultContainer(props: Props) {
  const individualResultProps = useIndividualResultProps({
    ...props,
    combinedResult:
      props.multiQueryReportResult?.value?.status !== 'ok'
        ? undefined
        : props.multiQueryReportResult.value.value,
  });

  return (
    <div className="ResultContainer">
      {props.selectedResult.type === 'combined' ? (
        <CombinedResultContainer {...props} />
      ) : (
        <IndividualResult {...individualResultProps} />
      )}
    </div>
  );
}

function CombinedResultContainer(props: Props) {
  return props.multiQueryReportResult == null ||
    props.multiQueryReportResult.value == null ? (
    <Loading>
      <div className="wdk-LoadingData">Loading data...</div>
    </Loading>
  ) : props.multiQueryReportResult.value.status === 'error' ? (
    <BlastRequestError
      errorDetails={props.multiQueryReportResult.value.details}
    />
  ) : (
    <LoadedCombinedResultContainer
      {...props}
      combinedResult={props.multiQueryReportResult.value.value}
    />
  );
}

function LoadedCombinedResultContainer(
  props: Props & { combinedResult: MultiQueryReportJson }
) {
  return <CombinedResult {...useCombinedResultProps(props)} />;
}
