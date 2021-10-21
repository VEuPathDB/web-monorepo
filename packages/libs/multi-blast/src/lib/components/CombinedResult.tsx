import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';

import { ReportSelect } from './ReportSelect';

import './CombinedResult.scss';

export interface Props {
  hitQueryCount?: number;
  hitSubjectCount?: number;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  jobId: string;
  mesaState: any; // FIXME: Get rid of this "any" once we have type declarations for Mesa
  totalQueryCount?: number;
}

export function CombinedResult({
  hitQueryCount,
  hitSubjectCount,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  jobId,
  mesaState,
  totalQueryCount,
}: Props) {
  return (
    <div className="CombinedResult">
      <Mesa state={mesaState}>
        {hitQueryCount != null &&
          hitSubjectCount != null &&
          totalQueryCount != null && (
            <div className="ResultSummary">
              {hitQueryCount} of your {totalQueryCount} query sequences hit{' '}
              {hitSubjectCount}{' '}
              {hitSubjectCount === 1
                ? hitTypeDisplayName
                : hitTypeDisplayNamePlural}
            </div>
          )}
        <ReportSelect jobId={jobId} placeholder="Download all results" />
      </Mesa>
    </div>
  );
}
