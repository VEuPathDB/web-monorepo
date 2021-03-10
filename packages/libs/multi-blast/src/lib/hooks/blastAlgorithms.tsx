import { useContext, useMemo } from 'react';

import { zip } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  Answer,
  AnswerSpec,
  StandardReportConfig,
  getSingleRecordQuestionName,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  BlastOntologyDatabase,
  EnabledAlgorithms,
  TargetMetadataByDataType,
} from '../utils/targetTypes';

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

export function useEnabledAlgorithms(
  targetDataType: string
): EnabledAlgorithms | undefined {
  const algorithmTermsByDatabase = useAlgorithmTermsByDatabase();
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  const enabledAlgorithms = useMemo(() => {
    if (algorithmTermsByDatabase == null) {
      return undefined;
    }

    const targetMetadata = targetMetadataByDataType[targetDataType];
    const targetOntologyDatabaseName = targetMetadata.blastOntologyDatabase;
    const targetwdkRecordType = targetMetadata.recordClassUrlSegment;

    const enabledAlgorithmsForTargetType =
      algorithmTermsByDatabase[targetOntologyDatabaseName];

    const enabledAlgorithmsForWdkRecordType = Object.values(
      targetMetadataByDataType
    ).reduce((memo, { blastOntologyDatabase, recordClassUrlSegment }) => {
      if (recordClassUrlSegment === targetwdkRecordType) {
        memo.push(...algorithmTermsByDatabase[blastOntologyDatabase]);
      }

      return memo;
    }, [] as string[]);

    return {
      enabledAlgorithmsForTargetType,
      enabledAlgorithmsForWdkRecordType,
    };
  }, [algorithmTermsByDatabase, targetDataType, targetMetadataByDataType]);

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
    throw new Error(`Missing expected table '${termTableName}'.`);
  }

  const termTable = answer.records[0].tables[termTableName];

  if (termTable.some((row) => row.term == null || row.internal == null)) {
    throw new Error(
      `Expected all rows of table '${termTableName}' to have 'term' and 'internal' fields.`
    );
  }

  return termTable;
}
