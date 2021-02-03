export type TargetDataType =
  | 'AnnotatedTranscripts'
  | 'AnnotatedProteins'
  | 'Genome'
  | 'ESTs'
  | 'PopSet';

export interface TargetMetadata {
  blastOntologyDatabase: BlastOntologyDatabase;
}

export type BlastOntologyDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

export const targetMetadataByDataType: Record<
  TargetDataType,
  TargetMetadata
> = {
  AnnotatedTranscripts: {
    blastOntologyDatabase: 'blast-est-ontology',
  },
  AnnotatedProteins: {
    blastOntologyDatabase: 'blast-orf-ontology',
  },
  Genome: {
    blastOntologyDatabase: 'blast-est-ontology',
  },
  ESTs: {
    blastOntologyDatabase: 'blast-est-ontology',
  },
  PopSet: {
    blastOntologyDatabase: 'blast-est-ontology',
  },
};
