import { createContext } from 'react';

export interface TargetMetadata {
  blastOntologyDatabase?: BlastOntologyDatabase;
  recordClassUrlSegment: string;
  recordLinkUrlSegment?: string;
  searchUrlSegment: string;
  hitDisplayName?: string;
  hitDisplayNamePlural?: string;
}

export type BlastOntologyDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

// Keys are blast database type defined in model
const targetMetadataByDataType: Record<string, TargetMetadata> = {
  AnnotatedTranscripts: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassUrlSegment: 'transcript',
    recordLinkUrlSegment: 'gene',
    searchUrlSegment: 'GenesByMultiBlast',
    hitDisplayName: 'Transcript',
    hitDisplayNamePlural: 'Transcripts',
  },
  AnnotatedProteins: {
    blastOntologyDatabase: 'blast-orf-ontology',
    recordClassUrlSegment: 'transcript',
    recordLinkUrlSegment: 'gene',
    searchUrlSegment: 'GenesByMultiBlast',
    hitDisplayName: 'Protein',
    hitDisplayNamePlural: 'Proteins',
  },
  Genome: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassUrlSegment: 'genomic-sequence',
    searchUrlSegment: 'SequencesByMultiBlast',
  },
  ESTs: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassUrlSegment: 'est',
    searchUrlSegment: 'EstsByMultiBlast',
  },
  PopSet: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassUrlSegment: 'popsetSequence',
    searchUrlSegment: 'PopsetsByMultiBlast',
  },
};

export const TargetMetadataByDataType = createContext(targetMetadataByDataType);

export function targetTypeTermToDbName(targetTypeTerm: string) {
  return targetTypeTerm === 'PopSet' ? 'Isolates' : targetTypeTerm;
}

export function dbNameToTargetTypeTerm(dbName: string) {
  return dbName === 'Isolates' ? 'PopSet' : dbName;
}

/**
 * List of enabled algorithms based on the database ontology record classes.
 * The magic string "_ALL_" means that all algorithms provided by the WDK
 * question should be enabled.
 */
export interface EnabledAlgorithms {
  enabledAlgorithmsForTargetType: string[] | '_ALL_';
  enabledAlgorithmsForWdkRecordType: string[] | '_ALL_';
}
