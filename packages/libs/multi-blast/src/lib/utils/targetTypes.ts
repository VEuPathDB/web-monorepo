import { createContext } from 'react';

export interface TargetMetadata {
  blastOntologyDatabase: BlastOntologyDatabase;
  recordClassUrlSegment: string;
  searchUrlSegment: string;
}

export type BlastOntologyDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

const targetMetadataByDataType: Record<string, TargetMetadata> = {
  AnnotatedTranscripts: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassUrlSegment: 'transcript',
    searchUrlSegment: 'GenesByMultiBlast',
  },
  AnnotatedProteins: {
    blastOntologyDatabase: 'blast-orf-ontology',
    recordClassUrlSegment: 'transcript',
    searchUrlSegment: 'GenesByMultiBlast',
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
