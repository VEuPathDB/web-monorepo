export interface CombinedResultRow {
  accession: string;
  alignmentLength: number;
  description: string | null;
  eValue: number;
  identity: number;
  query: string;
  rank: number;
  score: number;
  wdkPrimaryKey: string | null;
}

const GENE_REGEX = /\|\s*gene=([^|\s]+) /;
const GENE_PRODUCT_REGEX = /\|\s*gene_product=([^|]+) \|/;

export function blastDbNameToWdkRecordType(blastDbName: string) {
  if (
    blastDbName.endsWith('AnnotatedTranscripts') ||
    blastDbName.endsWith('AnnotatedProteins')
  ) {
    return 'gene';
  } else if (blastDbName.endsWith('Genome')) {
    return 'genomic-sequence';
  } else if (blastDbName.endsWith('ESTs')) {
    return 'est';
  } else if (blastDbName.endsWith('PopSet')) {
    return 'popsetSequence';
  } else {
    return null;
  }
}

export function retrieveDataFromHitTitleFactory(regex: RegExp) {
  return function retrieveDataFromHitTitle(hitTitle: string) {
    const match = hitTitle.match(regex);

    return match == null || match[1] == null ? null : match[1];
  };
}

export const geneHitTitleToWdkPrimaryKey = retrieveDataFromHitTitleFactory(
  GENE_REGEX
);
export const geneHitTitleToDescription = retrieveDataFromHitTitleFactory(
  GENE_PRODUCT_REGEX
);
