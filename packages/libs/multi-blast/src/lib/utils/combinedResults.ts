export interface CombinedResultRow {
  accession: string;
  alignmentLength: number;
  eValue: number;
  identity: number;
  organism: string | null;
  query: string;
  rank: number;
  score: number;
  wdkPrimaryKey: string | null;
}

const GENE_REGEX = /\|\s*gene=([^|\s]+) /;
const TARGET_NAME_REGEX = /[\s\S]*\//;

export function dbToTargetName(db: string) {
  return db.replace(TARGET_NAME_REGEX, '');
}

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

export function dbToOrganismFactory(filesToOrganisms: Record<string, string>) {
  const filesToOrganismsEntries = Object.entries(filesToOrganisms);

  return function dbToOrganism(db: string) {
    const targetName = dbToTargetName(db);

    const fileToOrganismPair = filesToOrganismsEntries.find(([filename]) =>
      targetName.startsWith(filename)
    );

    return fileToOrganismPair == null ? null : fileToOrganismPair[1];
  };
}
