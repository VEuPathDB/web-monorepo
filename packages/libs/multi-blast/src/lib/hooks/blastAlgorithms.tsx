import { useMemo, useState } from 'react';

import { zip } from 'lodash';

import { useWdkEffect } from '@veupathdb/wdk-client/lib/Service/WdkService';
import {
  Answer,
  AnswerSpec,
  getSingleRecordQuestionName,
  StandardReportConfig,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export type TargetDataType =
  | 'AnnotatedTranscripts'
  | 'AnnotatedProteins'
  | 'Genome'
  | 'EST'
  | 'PopSet';

type BlastOntologyDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

interface TargetMetadata {
  blastOntologyDatabase: BlastOntologyDatabase;
  recordClassFullName: string;
  searchName: string;
}

const blastOntologyDatabases: BlastOntologyDatabase[] = [
  'blast-est-ontology',
  'blast-orf-ontology',
];

const blastDatabaseSearchNames: Record<BlastOntologyDatabase, string> = {
  'blast-est-ontology': getSingleRecordQuestionName(
    'AjaxRecordClasses.Blast_Transcripts_Genome_Est_TermClass'
  ),
  'blast-orf-ontology': getSingleRecordQuestionName(
    'AjaxRecordClasses.Blast_Protein_Orf_TermClass'
  ),
};

const algorithmTermTables: Record<BlastOntologyDatabase, string> = {
  'blast-est-ontology': 'BlastTGETerms',
  'blast-orf-ontology': 'BlastPOTerms',
};

const targetMetadataByDataType: Record<TargetDataType, TargetMetadata> = {
  AnnotatedTranscripts: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassFullName: 'TranscriptRecordClasses.TranscriptRecordClass',
    searchName: 'GenesBySimilarity',
  },
  AnnotatedProteins: {
    blastOntologyDatabase: 'blast-orf-ontology',
    recordClassFullName: 'TranscriptRecordClasses.TranscriptRecordClass',
    searchName: 'GenesBySimilarity',
  },
  Genome: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassFullName: 'SequenceRecordClasses.SequenceRecordClass',
    searchName: 'SequencesBySimilarity',
  },
  EST: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassFullName: 'EstRecordClasses.EstRecordClass',
    searchName: 'EstsBySimilarity',
  },
  PopSet: {
    blastOntologyDatabase: 'blast-est-ontology',
    recordClassFullName: 'PopsetRecordClasses.PopsetRecordClass',
    searchName: 'PopsetsBySimilarity',
  },
};

export function useEnabledAlgorithms(
  targetDataType: TargetDataType,
  projectId: string | undefined
) {
  const algorithmTermsByDatabase = useAlgorithmTermsByDatabase(projectId);

  const enabledAlgorithms = useMemo(
    () =>
      algorithmTermsByDatabase &&
      algorithmTermsByDatabase[
        targetMetadataByDataType[targetDataType].blastOntologyDatabase
      ],
    [algorithmTermsByDatabase, targetMetadataByDataType, targetDataType]
  );

  return enabledAlgorithms;
}

function useAlgorithmTermsByDatabase(projectId: string | undefined) {
  const [algorithmTermsByDatabase, setAlgorithmTermsByDatabase] = useState<
    Record<BlastOntologyDatabase, string[]> | undefined
  >(undefined);

  useWdkEffect(
    (wdkService) => {
      if (!projectId) {
        return;
      }

      const answerPromises = blastOntologyDatabases.map((databaseName) =>
        wdkService.getAnswerJson(
          makeAllowedAlgorithmsSearchConfig(databaseName, projectId),
          makeAllowedAlgorithmsReportConfig(databaseName)
        )
      );

      (async () => {
        const answersByDatabase = await Promise.all(answerPromises);

        const result = zip(blastOntologyDatabases, answersByDatabase).reduce(
          (memo, [databaseName, answer]) => ({
            ...memo,
            [databaseName as BlastOntologyDatabase]: answerToTerms(
              databaseName as BlastOntologyDatabase,
              answer as Answer
            ).map(({ term }) => term),
          }),
          {} as Record<BlastOntologyDatabase, string[]>
        );

        setAlgorithmTermsByDatabase(result);
      })();
    },
    [projectId]
  );

  return algorithmTermsByDatabase;
}

function makeAllowedAlgorithmsSearchConfig(
  databaseName: BlastOntologyDatabase,
  projectId: string
): AnswerSpec {
  return {
    searchName: blastDatabaseSearchNames[databaseName],
    searchConfig: {
      parameters: {
        primaryKeys: `fill,${projectId}`,
      },
    },
  };
}

function makeAllowedAlgorithmsReportConfig(
  databaseName: BlastOntologyDatabase
): StandardReportConfig {
  return {
    tables: [algorithmTermTables[databaseName]],
  };
}

function answerToTerms(databaseName: BlastOntologyDatabase, answer: Answer) {
  const termTableName = algorithmTermTables[databaseName];

  if (answer.records[0].tableErrors.includes(termTableName)) {
    throw new Error(`Missing expected table ${termTableName}`);
  }

  const termTable = answer.records[0].tables[termTableName];

  if (termTable.some((row) => row.term == null || row.internal == null)) {
    throw new Error(
      `Expected all rows of table '${termTableName}' to have 'term' and 'internal' fields.`
    );
  }

  return termTable;
}
