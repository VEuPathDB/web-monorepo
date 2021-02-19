import Mesa from '@veupathdb/wdk-client/lib/Components/Mesa';

import './CombinedResult.scss';

export interface Props {
  hitQueryCount: number;
  hitSubjectCount: number;
  hitTypeDisplayNamePlural: string;
  mesaState: any; // FIXME: Get rid of this "any" once we have type declarations for Mesa
  totalQueryCount: number;
}

export function CombinedResult({
  hitQueryCount,
  hitSubjectCount,
  hitTypeDisplayNamePlural,
  mesaState,
  totalQueryCount,
}: Props) {
  return (
    <div className="CombinedResult">
      <div className="ResultSummary">
        {hitQueryCount} of your {totalQueryCount} query sequences hit{' '}
        {hitSubjectCount} {hitTypeDisplayNamePlural.toLowerCase()}
      </div>
      <Mesa state={mesaState} />
    </div>
  );
}
