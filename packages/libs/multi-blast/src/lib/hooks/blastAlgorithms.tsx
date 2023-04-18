import { useContext, useMemo } from 'react';

import { keyBy, zip } from 'lodash';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  BlastOntologyDatabase,
  EnabledAlgorithms,
  TargetMetadataByDataType,
} from '../utils/targetTypes';

const blastOntologyDatabases: BlastOntologyDatabase[] = [
  'blast-est-ontology',
  'blast-orf-ontology',
];

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
  const algorithmTermsByDatabase = useWdkService(async (wdkService) => {
    const [projectId, recordClasses] = await Promise.all([
      wdkService.getConfig().then(({ projectId }) => projectId),
      wdkService.getRecordClasses(),
    ]);

    const recordClassesByUrlSegment = keyBy(
      recordClasses,
      (recordClass) => recordClass.urlSegment
    );

    const recordPromises = blastOntologyDatabases.map((databaseName) => {
      const recordClass = recordClassesByUrlSegment[databaseName];

      const primaryKey = recordClass.primaryKeyColumnRefs.map((columnName) => ({
        name: columnName,
        value: columnName === 'project_id' ? projectId : 'fill',
      }));

      return wdkService.getRecord(recordClass.urlSegment, primaryKey, {
        tables: [algorithmTermTables[databaseName]],
      });
    });

    const databaseRecords = await Promise.all(recordPromises);

    const result = zip(blastOntologyDatabases, databaseRecords).reduce(
      (memo, [databaseName, record]) => ({
        ...memo,
        [databaseName as BlastOntologyDatabase]: recordToTerms(
          databaseName as BlastOntologyDatabase,
          record as RecordInstance
        ).map(({ term }) => term),
      }),
      {} as Record<BlastOntologyDatabase, string[]>
    );

    return result;
  }, []);

  return algorithmTermsByDatabase;
}

function recordToTerms(
  databaseName: BlastOntologyDatabase,
  record: RecordInstance
) {
  const termTableName = algorithmTermTables[databaseName];

  if (record.tableErrors.includes(termTableName)) {
    throw new Error(`Missing expected table '${termTableName}'.`);
  }

  const termTable = record.tables[termTableName];

  if (termTable.some((row) => row.term == null || row.internal == null)) {
    throw new Error(
      `Expected all rows of table '${termTableName}' to have 'term' and 'internal' fields.`
    );
  }

  return termTable;
}
