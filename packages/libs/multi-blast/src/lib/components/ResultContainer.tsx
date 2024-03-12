import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  useOrganismToProject,
  useProjectUrls,
} from '@veupathdb/web-common/lib/hooks/projectUrls';

import { useCombinedResultProps } from '../hooks/combinedResults';
import { useIndividualResultProps } from '../hooks/individualResult';
import { IndividualQuery, SelectedResult } from '../utils/CommonTypes';
import {
  ApiResult,
  ErrorDetails,
  MultiQueryReportJson,
} from '../utils/ServiceTypes';

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
  const organismToProject = useOrganismToProject();
  const projectUrls = useProjectUrls();

  const individualResultProps = useIndividualResultProps({
    ...props,
    combinedResult:
      props.multiQueryReportResult?.status !== 'ok'
        ? undefined
        : props.multiQueryReportResult.value,
  });

  return (
    <div className="ResultContainer">
      {props.selectedResult.type === 'combined' ? (
        <CombinedResultContainer
          {...props}
          organismToProject={organismToProject}
          projectUrls={projectUrls}
        />
      ) : (
        <IndividualResult {...individualResultProps} />
      )}
    </div>
  );
}

function CombinedResultContainer(
  props: Props & {
    organismToProject: Record<string, string> | undefined;
    projectUrls: Record<string, string> | undefined;
  }
) {
  return props.multiQueryReportResult == null ||
    props.projectUrls == null ||
    props.organismToProject == null ? (
    <Loading>
      <div className="wdk-LoadingData">Loading data...</div>
    </Loading>
  ) : (
    <LoadedCombinedResultContainer
      {...props}
      combinedResult={props.multiQueryReportResult}
      organismToProject={props.organismToProject}
      projectUrls={props.projectUrls}
    />
  );
}

function LoadedCombinedResultContainer(
  props: Props & {
    combinedResult: ApiResult<MultiQueryReportJson, ErrorDetails>;
    organismToProject: Record<string, string>;
    projectUrls: Record<string, string>;
  }
) {
  return <CombinedResult {...useCombinedResultProps(props)} />;
}
