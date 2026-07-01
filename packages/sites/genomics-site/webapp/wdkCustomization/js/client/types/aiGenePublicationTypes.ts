// FE-internal camelCase mirrors of the AI gene-publication wire shapes.
// The service layer (UserCommentsService.ts) maps snake_case <-> these types at
// the boundary. See CLAUDE-plan-ai-user-comments-front-end.md "Type additions".

import { AiProvenanceSource } from './userCommentTypes';

export interface AiOutput {
  headline: string;
  content: string;
}

export type AiGenePublicationJobStage =
  | 'queued'
  | 'fetching-article'
  | 'scanning-gene-mentions'
  | 'generating-summary'
  | 'generating-pds'
  | 'persisting';

export interface JobProgress {
  stage: AiGenePublicationJobStage;
  message: string;
  updatedAt: string;
}

export type AiGenePublicationJobStatus =
  // non-terminal
  | {
      type: 'running';
      jobId: string;
      progress: JobProgress;
      // Present once the run row exists (the BE includes it); absent on the
      // FE-fabricated "Resuming…" status before the first poll returns.
      source?: AiProvenanceSource;
    }
  // terminal — success (LLM produced a real summary). No commentId: the comment
  // is created later by the publish call.
  | {
      type: 'success';
      jobId: string;
      aiOutput: AiOutput;
      source: AiProvenanceSource;
    }
  // terminal — LLM ran but flagged the gene as only mentioned in passing
  | {
      type: 'mentioned-in-passing';
      jobId: string;
      synonymsChecked: string[];
      source: AiProvenanceSource;
    }
  // terminal — regex scan found zero mentions, never reached the LLM
  | {
      type: 'gene-not-mentioned';
      jobId: string;
      synonymsChecked: string[];
      source: AiProvenanceSource;
    }
  // terminal — fetch failed (not cached; retry is free; not publishable)
  | { type: 'text-unavailable'; reason: string }
  | { type: 'internal-error'; error: string }
  | { type: 'cancelled' };

// Returned by the service wrapper for the 503-busy case so callers can render
// the toast, and for the 400 validation case.
export type AiGenePublicationSubmitOutcome =
  | AiGenePublicationJobStatus
  | { type: 'server-busy'; retryAfterSeconds?: number }
  | { type: 'validation-error'; errors: string[] };

// Result of the publish call (create-on-approval).
export type AiGenePublicationPublishOutcome =
  | { type: 'published'; commentId: number }
  | { type: 'not-found' } // job_id had no cached run (e.g. text-unavailable)
  | { type: 'validation-error'; errors: string[] };

// Request shape consumed by postAiGenePublication (camelCase; the service maps
// to snake_case wire keys at the boundary).
export interface AiGenePublicationRequest {
  geneId: string;
  source: 'pubmed' | 'upload';
  pubmedId?: string; // iff source === 'pubmed'
  paperText?: string; // iff source === 'upload', extracted client-side via MuPDF.js
  pdfContentSha256?: string; // iff source === 'upload', hex SHA-256 over the PDF bytes
  externalUrl?: string;
  externalTitle?: string;
  externalRef?: string; // normalised PMID or DOI (upload path only)
  externalRefKind?: 'pubmed' | 'doi'; // kind of externalRef
  options: {
    // generateProductDescription is wire-supported but ignored by the BE in v1;
    // not exposed in the v1 UI.
  };
}
