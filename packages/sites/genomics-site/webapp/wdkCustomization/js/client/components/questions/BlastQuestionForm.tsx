import React, { useCallback, useEffect, useMemo } from 'react';
import { keyBy, zip } from 'lodash';
import {
  SubmissionMetadata,
  reportSubmissionError,
} from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { requestCreateStrategy } from '@veupathdb/wdk-client/lib/Actions/StrategyActions';
import {
  Loading,
  RadioList,
  TextArea,
} from '@veupathdb/wdk-client/lib/Components';
import { DispatchAction } from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  QuestionState,
  DEFAULT_STRATEGY_NAME,
} from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  CheckBoxEnumParam,
  Parameter,
  RecordInstance,
  StringParam,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import {
  DEFAULT_COLS,
  calculateRows,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/StringParam';
import { useChangeParamValue } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';
import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import { transformOrganismParameter } from '@veupathdb/multi-blast/lib/utils/params';

const BLAST_DATABASE_TYPE_PARAM = 'BlastDatabaseType';
const BLAST_DATABASE_ORGANISM_PARAM = 'BlastDatabaseOrganism';
const BLAST_ALGORITHM_PARAM = 'BlastAlgorithm';
const BLAST_RECORD_CLASS_PARAM = 'BlastRecordClass';
const BLAST_QUERY_SEQUENCE_PARAM = 'BlastQuerySequence';
const EXPECTATION_VALUE_PARAM = '-e';

type Props = FormProps;

type TargetDataType = 'Transcripts' | 'Proteins' | 'Genome' | 'EST' | 'PopSet';

type BlastDatabase = 'blast-est-ontology' | 'blast-orf-ontology';

type TargetMetadata = {
  blastDatabase: BlastDatabase;
  recordClassFullName: string;
  recordClassUrlSegment: string;
  searchName: string;
};

type AlgorithmOntologyTerm = {
  term: string;
  internal: string;
};

export const BlastQuestionForm = withDynamicOrganismProperties(
  (props: Props) => {
    const targetDataType = props.state.paramValues[
      BLAST_DATABASE_TYPE_PARAM
    ] as TargetDataType;

    const enabledAlgorithms = useEnabledAlgorithms(targetDataType);
    const targetParamProps = useTargetParamProps(
      props.state,
      props.eventHandlers.updateParamValue
    );
    const algorithmParamProps = useAlgorithmParamProps(
      props.state,
      props.eventHandlers.updateParamValue,
      enabledAlgorithms
    );
    const sequenceParamProps = useSequenceParamProps(
      props.state,
      props.eventHandlers.updateParamValue
    );

    const submissionMetadata = useSubmissionMetadata(
      props.submissionMetadata,
      props.state.question.urlSegment,
      targetMetadataByDataType[targetDataType],
      props.dispatchAction
    );

    const onSubmit = useOnSubmit(props.state);

    const targetParamElement = (
      <RadioList {...targetParamProps} name="target" />
    );
    const algorithmParamElement = (
      <RadioList {...algorithmParamProps} name="algorithm" />
    );
    const sequenceParamElement = (
      <React.Fragment>
        <TextArea {...sequenceParamProps} />
        <div>Note: only one input sequence allowed.</div>
        <div>Maximum allowed sequence length is 31K bases.</div>
      </React.Fragment>
    );
    const dynamicOrganismParam =
      props.state.question.parametersByName[BLAST_DATABASE_ORGANISM_PARAM];
    const dynamicOrganismParamElement = (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: dynamicOrganismParam.name,
          paramName: dynamicOrganismParam.name,
          searchName: props.state.question.urlSegment,
          recordClassName: props.state.recordClass.urlSegment,
        }}
        pluginProps={{
          ctx: {
            searchName: props.state.question.urlSegment,
            parameter: dynamicOrganismParam,
            paramValues: props.state.paramValues,
          },
          parameter: dynamicOrganismParam,
          value: props.state.paramValues[BLAST_DATABASE_ORGANISM_PARAM],
          uiState: props.state.paramUIState[BLAST_DATABASE_ORGANISM_PARAM],
          onParamValueChange: (paramValue: string) => {
            props.eventHandlers.updateParamValue({
              searchName: props.state.question.urlSegment,
              parameter: dynamicOrganismParam,
              paramValues: props.state.paramValues,
              paramValue,
            });
          },
          dispatch: props.dispatchAction,
        }}
      />
    );

    return !enabledAlgorithms ? (
      <Loading />
    ) : (
      <EbrcDefaultQuestionForm
        {...props}
        parameterElements={{
          ...props.parameterElements,
          [BLAST_DATABASE_TYPE_PARAM]: targetParamElement,
          [BLAST_ALGORITHM_PARAM]: algorithmParamElement,
          [BLAST_QUERY_SEQUENCE_PARAM]: sequenceParamElement,
          [BLAST_DATABASE_ORGANISM_PARAM]: dynamicOrganismParamElement,
        }}
        submissionMetadata={submissionMetadata}
        onSubmit={onSubmit}
      />
    );
  }
);

const targetMetadataByDataType: Record<TargetDataType, TargetMetadata> = {
  Transcripts: {
    blastDatabase: 'blast-est-ontology',
    recordClassFullName: 'TranscriptRecordClasses.TranscriptRecordClass',
    recordClassUrlSegment: 'transcript',
    searchName: 'GenesBySimilarity',
  },
  Proteins: {
    blastDatabase: 'blast-orf-ontology',
    recordClassFullName: 'TranscriptRecordClasses.TranscriptRecordClass',
    recordClassUrlSegment: 'transcript',
    searchName: 'GenesBySimilarity',
  },
  Genome: {
    blastDatabase: 'blast-est-ontology',
    recordClassFullName: 'SequenceRecordClasses.SequenceRecordClass',
    recordClassUrlSegment: 'genomic-sequence',
    searchName: 'SequencesBySimilarity',
  },
  EST: {
    blastDatabase: 'blast-est-ontology',
    recordClassFullName: 'EstRecordClasses.EstRecordClass',
    recordClassUrlSegment: 'est',
    searchName: 'EstsBySimilarity',
  },
  PopSet: {
    blastDatabase: 'blast-est-ontology',
    recordClassFullName: 'PopsetRecordClasses.PopsetRecordClass',
    recordClassUrlSegment: 'popsetSequence',
    searchName: 'PopsetsBySimilarity',
  },
};

const useEnabledAlgorithms = (targetDataType: TargetDataType) => {
  const algorithmTermsByDatabase = useAlgorithmTermsByDatabase();

  const enabledAlgorithms = useMemo(
    () =>
      algorithmTermsByDatabase &&
      algorithmTermsByDatabase[
        targetMetadataByDataType[targetDataType].blastDatabase
      ],
    [algorithmTermsByDatabase, targetMetadataByDataType, targetDataType]
  );

  return enabledAlgorithms;
};

const useAlgorithmTermsByDatabase = () => {
  const algorithmTermsByDatabase = useWdkService(async (wdkService) => {
    const [projectId, recordClasses] = await Promise.all([
      wdkService.getConfig().then(({ projectId }) => projectId),
      wdkService.getRecordClasses(),
    ]);

    const recordClassesByUrlSegment = keyBy(
      recordClasses,
      (recordClass) => recordClass.urlSegment
    );

    const recordPromises = blastDatabases.map((databaseName) => {
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

    const result = zip(blastDatabases, databaseRecords).reduce(
      (memo, [databaseName, record]) => ({
        ...memo,
        [databaseName as BlastDatabase]: recordToTerms(
          databaseName as BlastDatabase,
          record as RecordInstance
        ).map(({ term }) => term),
      }),
      {} as Record<BlastDatabase, string[]>
    );

    return result;
  }, []);

  return algorithmTermsByDatabase;
};

const blastDatabases: BlastDatabase[] = [
  'blast-est-ontology',
  'blast-orf-ontology',
];

const algorithmTermTables: Record<BlastDatabase, string> = {
  'blast-est-ontology': 'BlastTGETerms',
  'blast-orf-ontology': 'BlastPOTerms',
};

const recordToTerms = (
  databaseName: BlastDatabase,
  record: RecordInstance
): AlgorithmOntologyTerm[] => {
  const termTable = algorithmTermTables[databaseName];

  if (record.tableErrors.includes(termTable)) {
    throw new Error(`Missing expected table ${termTable}`);
  }

  return record.tables[termTable] as AlgorithmOntologyTerm[];
};

const useTargetParamProps = (
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue']
) => {
  const searchName = state.question.urlSegment;
  const parameter = state.question.parametersByName[
    BLAST_DATABASE_TYPE_PARAM
  ] as CheckBoxEnumParam;

  const items = useMemo(
    () =>
      parameter.vocabulary.map(([value, display]) => ({
        value,
        display: safeHtml(display),
        disabled:
          targetMetadataByDataType[value as TargetDataType].searchName !==
            searchName && searchName !== 'UnifiedBlast',
      })),
    [parameter, targetMetadataByDataType, searchName]
  );

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  return {
    items,
    value: state.paramValues[BLAST_DATABASE_TYPE_PARAM],
    onChange,
    required: true,
  };
};

const useAlgorithmParamProps = (
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue'],
  enabledAlgorithms: string[] | undefined
) => {
  const parameter = state.question.parametersByName[
    BLAST_ALGORITHM_PARAM
  ] as CheckBoxEnumParam;
  const algorithm = state.paramValues[BLAST_ALGORITHM_PARAM];

  const items = useMemo(
    () =>
      parameter.vocabulary.map(([value, display]) => ({
        value,
        display: safeHtml(display),
        disabled: !enabledAlgorithms || !enabledAlgorithms.includes(value),
      })),
    [parameter, enabledAlgorithms]
  );

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  useEffect(() => {
    if (enabledAlgorithms && !enabledAlgorithms.includes(algorithm)) {
      onChange(enabledAlgorithms[0]);
    }
  }, [enabledAlgorithms, algorithm, onChange]);

  return {
    items,
    value: algorithm,
    onChange,
    required: true,
  };
};

const useSequenceParamProps = (
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue']
) => {
  const parameter = state.question.parametersByName[
    BLAST_QUERY_SEQUENCE_PARAM
  ] as StringParam;
  const expectValueParameter =
    state.question.parametersByName[EXPECTATION_VALUE_PARAM];
  const {
    [BLAST_QUERY_SEQUENCE_PARAM]: value,
    [BLAST_ALGORITHM_PARAM]: algorithm,
    [EXPECTATION_VALUE_PARAM]: expectValue,
  } = state.paramValues;

  const onChange = useChangeParamValue(parameter, state, updateParamValue);
  const changeExpectValue = useChangeParamValue(
    expectValueParameter,
    state,
    updateParamValue
  );

  const onBlur = useCallback(() => {
    const numberOfNucleotides = value
      .replace(/^>.*/, '')
      .replace(/[^A-Za-z]/g, '').length;

    if (
      algorithm === 'blastn' &&
      numberOfNucleotides < 25 &&
      +expectValue < 1000
    ) {
      changeExpectValue('1000');
      alert(
        `Note: The expect value has been set from ${expectValue} to 1000 because your query sequence is less than 25 nucleotides. You may want to adjust the expectation value further to refine the specificity of your query.`
      );
    } else if (numberOfNucleotides > 31000) {
      alert(
        'Note: The maximum allowed size for your sequence is 31000 base pairs.'
      );
    }
  }, [value, algorithm, expectValue, changeExpectValue]);

  return {
    value: state.paramValues[BLAST_QUERY_SEQUENCE_PARAM],
    onChange,
    required: true,
    onBlur,
    cols: DEFAULT_COLS,
    rows: calculateRows(parameter, DEFAULT_COLS),
  };
};

const useSubmissionMetadata = (
  pageSubmissionMetadata: SubmissionMetadata,
  pageSearchName: string,
  targetMetadata: TargetMetadata,
  dispatchAction: DispatchAction
) => {
  const submissionMetadata = useMemo(
    () =>
      pageSearchName !== 'UnifiedBlast'
        ? pageSubmissionMetadata
        : ({
            type: 'submit-custom-form',
            onStepSubmitted: (wdkService, submissionSpec) => {
              wdkService
                .createStep({
                  ...submissionSpec,
                  searchName: targetMetadata.searchName,
                  searchConfig: {
                    ...submissionSpec.searchConfig,
                    parameters: {
                      ...submissionSpec.searchConfig.parameters,
                      [BLAST_RECORD_CLASS_PARAM]:
                        targetMetadata.recordClassFullName,
                    },
                  },
                })
                .then(({ id: stepId }) => {
                  dispatchAction(
                    requestCreateStrategy({
                      isPublic: false,
                      isSaved: false,
                      stepTree: {
                        stepId,
                      },
                      name: DEFAULT_STRATEGY_NAME,
                    })
                  );
                })
                .catch((error) => {
                  dispatchAction(
                    reportSubmissionError(pageSearchName, error, wdkService)
                  );
                });
            },
          } as SubmissionMetadata),
    [pageSubmissionMetadata, pageSearchName, targetMetadata, dispatchAction]
  );

  return submissionMetadata;
};

const useOnSubmit = (state: QuestionState) => {
  const sequenceParamValue = state.paramValues[BLAST_QUERY_SEQUENCE_PARAM];

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const normalizedSequence = (sequenceParamValue || '')
        .trim()
        .replace(/\r\n/g, '')
        .replace(/\r/g, '');

      if (!normalizedSequence) {
        return reportValidationFailure(
          'Sequence value cannot be empty. Please enter an Input Sequence and try again.'
        );
      }

      const sequenceWithDefLineRemoved =
        normalizedSequence[0] === '>'
          ? normalizedSequence.replace(/^>.*/, '')
          : normalizedSequence;

      if (
        sequenceWithDefLineRemoved.length === 0 ||
        sequenceWithDefLineRemoved === '\n'
      ) {
        return reportValidationFailure(
          'Current sequence value contains only a def line. Please add a sequence and try again.'
        );
      }

      if (sequenceWithDefLineRemoved.includes('>')) {
        return reportValidationFailure(
          'Only one sequence is allowed. Please remove secondary sequences and try again.'
        );
      }

      return true;
    },
    [sequenceParamValue]
  );

  return onSubmit;
};

const reportValidationFailure = (message: string) => {
  alert(message);
  return false;
};

function withDynamicOrganismProperties(
  Component: React.ComponentType<Props>
): React.ComponentType<Props> {
  return function (props: Props) {
    const targetDataType = props.state.paramValues[
      BLAST_DATABASE_TYPE_PARAM
    ] as TargetDataType;
    const targetRecordType =
      targetMetadataByDataType[targetDataType].recordClassUrlSegment;

    const parameters: Parameter[] = props.state.question.parameters.reduce(
      (memo, parameter) => {
        if (parameter.name === BLAST_DATABASE_ORGANISM_PARAM) {
          const newOrganismParam = transformOrganismParameter(
            parameter,
            targetRecordType
          );

          memo.push(newOrganismParam);
          return memo;
        }

        memo.push(parameter);
        return memo;
      },
      [] as Parameter[]
    );

    const parametersByName = keyBy(parameters, 'name');

    const propsWithDynamicOrganismProperties = {
      ...props,
      state: {
        ...props.state,
        question: {
          ...props.state.question,
          parameters,
          parametersByName,
        },
      },
    };

    return <Component {...propsWithDynamicOrganismProperties} />;
  };
}
