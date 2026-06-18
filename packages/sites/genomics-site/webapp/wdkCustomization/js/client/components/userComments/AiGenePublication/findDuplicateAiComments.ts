import { UserCommentGetResponse } from '../../../types/userCommentTypes';

// The identifier we match a candidate publication against existing AI comments:
// a PubMed ID (pubmed path) or a PDF content digest (upload path). Built by the
// controller from the current form state; undefined when the form doesn't yet
// identify a publication (no valid PMID / no extracted PDF).
export type AiSourceKey =
  | { kind: 'pubmed'; pubmedId: string }
  | { kind: 'upload'; pdfContentSha256: string };

export interface DuplicateAiComment {
  id: number;
  headline?: string;
  content: string;
}

// Returns the already-published AI comments on this gene whose provenance source
// matches `key` — same PubMed ID, or same uploaded-PDF content hash. Pure: the
// caller passes the already-fetched gene comment list. Returns [] for an
// undefined key, and ignores upload comments published before the content hash
// was recorded (no false matches on missing data).
export function findDuplicateAiComments(
  comments: UserCommentGetResponse[],
  key: AiSourceKey | undefined
): DuplicateAiComment[] {
  if (key == null) return [];
  return comments
    .filter((comment) => {
      const source = comment.aiProvenance?.source;
      if (source == null) return false;
      if (key.kind === 'pubmed') {
        return source.kind === 'pubmed' && source.pubmedId === key.pubmedId;
      }
      return (
        source.kind === 'upload' &&
        source.pdfContentSha256 != null &&
        source.pdfContentSha256 === key.pdfContentSha256
      );
    })
    .map((comment) => ({
      id: comment.id,
      headline: comment.headline,
      content: comment.content,
    }));
}
