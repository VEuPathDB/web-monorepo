import { useMemo } from 'react';

import { zip } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
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
  | 'ESTs'
  | 'PopSet';

type BlastOntologyDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

interface TargetMetadata {
  blastOntologyDatabase: BlastOntologyDatabase;
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

export function useEnabledAlgorithms(targetDataType: TargetDataType) {
  const algorithmTermsByDatabase = useAlgorithmTermsByDatabase();

  const enabledAlgorithms = useMemo(() => {
    if (algorithmTermsByDatabase == null) {
      return;
    }

    const targetMetaData = targetMetadataByDataType[targetDataType];
    const ontologyDatabaseName = targetMetaData.blastOntologyDatabase;

    return algorithmTermsByDatabase[ontologyDatabaseName];
  }, [algorithmTermsByDatabase, targetDataType]);

  return enabledAlgorithms;
}

function useAlgorithmTermsByDatabase() {
  const projectId = useWdkService(
    (wdkService) => wdkService.getConfig().then(({ projectId }) => projectId),
    []
  );

  const algorithmTermsByDatabase = useWdkService(
    async (wdkService) => {
      if (projectId == null) {
        return undefined;
      }

      const answerPromises = blastOntologyDatabases.map((databaseName) =>
        wdkService.getAnswerJson(
          makeAllowedAlgorithmsSearchConfig(databaseName, projectId),
          makeAllowedAlgorithmsReportConfig(databaseName)
        )
      );

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

      return result;
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
