import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { useCombinedResultProps } from '../hooks/combinedResults';
import { useIndividualResultProps } from '../hooks/individualResult';
import { IndividualQuery, SelectedResult } from '../utils/CommonTypes';
import { MultiQueryReportJson } from '../utils/ServiceTypes';

import { CombinedResult } from './CombinedResult';
import { IndividualResult } from './IndividualResult';

export interface Props {
  combinedResult: MultiQueryReportJson;
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
  const combinedResultProps = useCombinedResultProps(props);

  const individualResultProps = useIndividualResultProps(props);

  return (
    <div className="ResultContainer">
      {props.selectedResult.type === 'combined' ? (
        <CombinedResult {...combinedResultProps} />
      ) : (
        <IndividualResult {...individualResultProps} />
      )}
    </div>
  );
}
