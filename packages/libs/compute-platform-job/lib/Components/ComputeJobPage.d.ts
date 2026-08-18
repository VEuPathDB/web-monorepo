import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';
interface ComputeJobPageProps {
  jobId: string;
  api: SequenceRetrievalApi;
  paramsSummary?: string;
  /** The MsaFormat value the job was submitted with, e.g. 'clustal_dnd'. */
  format?: string;
}
export declare function ComputeJobPage({
  jobId,
  api,
  paramsSummary,
  format,
}: ComputeJobPageProps): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=ComputeJobPage.d.ts.map
