import React, { useMemo, useCallback } from 'react';
import { RootState } from '../../../Core/State/Types';
import { useSelector } from 'react-redux';
import { RecordInstance } from '../../../Utils/WdkModel';
import { SearchAndAnswer, TableResultTypePartial } from '../SearchAndAnswer';
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORTING,
} from '../../../Controllers/AnswerController';
import { ResultType } from '../../../Utils/WdkResult';
import { mapValues } from 'lodash';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '../../../Views/Question/DefaultQuestionForm';

const VIEW_ID = 'DatasetsPage';
const RECORD_NAME = 'dataset';
const TABLE_QUESTION_NAME = 'DatasetsByText';
const BULK_QUESTION_NAME = 'DatasetsById';
const DEFAULT_FORMATTING = {
  format: 'attributesTabular',
  formatConfig: {
    attachmentType: 'csv',
    pagination: DEFAULT_PAGINATION,
    sorting: DEFAULT_SORTING,
  },
};

function DatasetsFormComponent(props: FormProps) {
  const { state } = props;
  // Need to add `isSearchPage` prop so that organism prefs are used
  const parameterElements = useMemo(
    () =>
      mapValues(props.parameterElements, (parameterElement) => {
        return React.isValidElement(parameterElement)
          ? React.cloneElement(
              parameterElement,
              {
                pluginProps: {
                  ...parameterElement.props.pluginProps,
                  isSearchPage: true,
                },
              } as any,
              parameterElement.props.children
            )
          : parameterElement;
      }),
    [props.parameterElements]
  );

  const updatedProps = useMemo(
    () => ({ ...props, parameterElements }),
    [props, parameterElements]
  );

  return (
    <>
      {state.question.groups
        .filter((group) => group.displayType !== 'hidden')
        .map((group) => {
          const { parameters, ...remainingGroupProperties } = group;
          const groupWithoutOrgParam = {
            ...remainingGroupProperties,
            parameters: parameters.filter(
              (param) => param !== 'text_search_organism'
            ),
          };
          return renderDefaultParamGroup(groupWithoutOrgParam, updatedProps);
        })}
    </>
  );
}

export function DatasetsSearchAndAnswer() {
  const tableResultTypePartial = {
    type: 'answerSpec',
    displayName: 'Data Sets',
    answerSpec: {
      searchName: TABLE_QUESTION_NAME,
    },
  };

  const getReporterResultType = useCallback(
    (records: RecordInstance[]): ResultType => ({
      type: 'answerSpec',
      displayName: 'Datasets CSV',
      answerSpec: {
        searchName: BULK_QUESTION_NAME,
        searchConfig: {
          parameters: {
            dataset_id: JSON.stringify(records.map((rec) => rec.id[0].value)),
          },
        },
      },
    }),
    []
  );

  const reporterFormatting = useSelector((state: RootState) => {
    const meta = state.resultTableSummaryView[VIEW_ID]?.answer?.meta;
    if (!meta) return DEFAULT_FORMATTING;
    const { attributes, pagination, sorting } = meta;
    return {
      ...DEFAULT_FORMATTING,
      formatConfig: {
        ...DEFAULT_FORMATTING.formatConfig,
        attributes,
        pagination,
        sorting,
      },
    };
  });

  return (
    <SearchAndAnswer
      recordName={RECORD_NAME}
      tableResultTypePartial={tableResultTypePartial as TableResultTypePartial}
      getReporterResultType={getReporterResultType}
      reporterFormatting={reporterFormatting}
      resultTableConfig={{
        viewId: VIEW_ID,
        downloadButtonDisplay: 'Download as a CSV',
        showIdAttributeColumn: true,
        showCount: true,
      }}
      formComponent={DatasetsFormComponent}
    />
  );
}
