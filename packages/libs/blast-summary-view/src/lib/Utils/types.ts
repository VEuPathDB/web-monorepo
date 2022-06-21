import { Answer } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export interface BlastSummaryViewReport extends Answer {
  blastMeta: {
    blastHeader: string;
    blastMiddle: string;
    blastFooter: string;
  };
}
