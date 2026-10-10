/**
 * A region on some underlying sequence set. `contig` is the service's
 * literal, fixed field name — it is generic over whatever reference set
 * `sequenceType` selects (a chromosome, a protein accession, an isolate
 * locus), not chromosome-specific.
 */
export interface Feature {
  contig: string;
  start: number;
  end: number;
  query?: string;
  strand?: 'NONE' | 'POSITIVE' | 'NEGATIVE';
}

export type DeflineFormat = 'QUERYONLY' | 'REGIONONLY' | 'QUERYANDREGION';

export type MsaFormat =
  | 'fasta'
  | 'clustal'
  | 'clustal_guidetree'
  | 'msf'
  | 'phylip'
  | 'selex'
  | 'stockholm'
  | 'vienna';

export interface GeneTreeOptions {
  format: 'newick';
}

export type Aligner = 'clustalo' | 'mafft';

export interface MsaOptions {
  aligner?: Aligner;
  format: MsaFormat;
  metadataUrl?: string;
}

/** A deployment-configured reference-set key, e.g. "genomic" or "protein" — not a WDK project ID. */
export type SequenceType = string;

export interface SubmitJobRequest {
  features: Feature[];
  deflineFormat?: DeflineFormat;
  basesPerLine?: number;
  postProcess?: 'MSA' | 'GENETREE';
  msaOptions?: MsaOptions;
  geneTreeOptions?: GeneTreeOptions;
  percentActg?: number;
}

/** Request body for the synchronous /sequences/{sequenceType} endpoint. */
export interface SyncSequenceRequest {
  features: Feature[];
  deflineFormat?: DeflineFormat;
  basesPerLine?: number;
  percentActg?: number;
}

export type JobStatus =
  | 'queued'
  | 'in-progress'
  | 'complete'
  | 'failed'
  | 'expired';

export interface JobResponse {
  jobID: string;
  status: JobStatus;
  created?: string;
  queuePosition?: number;
  started?: string;
  finished?: string;
}
