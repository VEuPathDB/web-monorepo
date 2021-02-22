import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';

import './CombinedResult.scss';

export interface Props {
  hitQueryCount: number;
  hitSubjectCount: number;
  hitTypeDisplayName: string;
  hitTypeDisplayNamePlural: string;
  mesaState: any; // FIXME: Get rid of this "any" once we have type declarations for Mesa
  totalQueryCount: number;
}

export function CombinedResult({
  hitQueryCount,
  hitSubjectCount,
  hitTypeDisplayName,
  hitTypeDisplayNamePlural,
  mesaState,
  totalQueryCount,
}: Props) {
  return (
    <div className="CombinedResult">
      <div className="ResultSummary">
        {hitQueryCount} of your {totalQueryCount} query sequences hit{' '}
        {hitSubjectCount}{' '}
        {hitSubjectCount === 1 ? hitTypeDisplayName : hitTypeDisplayNamePlural}
      </div>
      <Mesa state={mesaState} />
    </div>
  );
}
