import React, { useEffect, useMemo, useState } from 'react';
import { RootState } from '../../../Core/State/Types';
import { useSelector } from 'react-redux';
import { SearchAndAnswer, TableResultTypePartial } from '../SearchAndAnswer';
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORTING,
} from '../../../Controllers/AnswerController';
import { downloadReport, ResultType } from '../../../Utils/WdkResult';
import { mapValues } from 'lodash';
import { Props as FormProps } from '../../../Views/Question/DefaultQuestionForm';
import Icon from '../../Icon/IconAlt';
import { WdkDependenciesContext } from '../../../Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '../../../Hooks/NonNullableContext';
import './DatasetsSearchAndAnswer.scss';
import HelpIcon from '../../Icon/HelpIcon';
import { Tooltip } from '@veupathdb/coreui';
import TabbableContainer from '../../Display/TabbableContainer';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';

const VIEW_ID = 'DatasetsPage';
const RECORD_NAME = 'dataset';
const TABLE_QUESTION_NAME = 'DatasetsByText';
const BULK_QUESTION_NAME = 'DatasetsById';
const DEFAULT_RESULT_TYPE = {
  type: 'answerSpec',
  displayName: 'Datasets CSV',
  answerSpec: {
    searchName: BULK_QUESTION_NAME,
    searchConfig: {
      parameters: {
        dataset_id: JSON.stringify([]),
      },
    },
  },
};
const DEFAULT_FORMATTING = {
  format: 'attributesTabular',
  formatConfig: {
    attachmentType: 'csv',
    pagination: DEFAULT_PAGINATION,
    sorting: DEFAULT_SORTING,
  },
};

function DatasetsFormComponent(props: FormProps) {
  const [showFields, setShowFields] = useState(false);

  const handleDocumentClick = (e: MouseEvent) => {
    if (
      e.target instanceof Element &&
      !e.target.closest('.wdk-Answer-filterFieldSelector')
    ) {
      setShowFields(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Need to add `isSearchPage` prop so that organism prefs are used
  const parameterElements = useMemo(() => {
    // Let's go ahead and filter out parameters we aren't going to render
    const { document_type, text_search_organism, ...elementsToRender } =
      props.parameterElements;
    return mapValues(elementsToRender, (parameterElement) => {
      return React.isValidElement(parameterElement)
        ? React.cloneElement(
            parameterElement,
            {
              pluginProps: {
                ...parameterElement.props.pluginProps,
                isSearchPage: true,
                ...(parameterElement.props.pluginProps.parameter.name ===
                'text_expression'
                  ? {
                      placeholder: 'Search Data Sets',
                    }
                  : undefined),
                ...(parameterElement.props.pluginProps.parameter.name ===
                'text_fields'
                  ? {
                      linksPosition: LinksPosition.Top,
                    }
                  : undefined),
              },
            } as any,
            parameterElement.props.children
          )
        : parameterElement;
    });
  }, [props.parameterElements]);

  return (
    <>
      <div className="TextExpressionContainer">
        {parameterElements['text_expression']}
        <Tooltip title="Show search fields">
          <button
            className="fa fa-caret-down wdk-Answer-filterSelectFieldsIcon"
            onClick={(e) => {
              e.stopPropagation();
              setShowFields(true);
            }}
          />
        </Tooltip>
        <span className="HelpIconWrapper">
          <HelpIcon
            children={
              // @ts-ignore
              parameterElements['text_expression']?.props?.pluginProps.parameter
                .help ?? ''
            }
          />
        </span>
      </div>
      {showFields && (
        <TabbableContainer
          autoFocus
          onKeyDown={(e) => (e.key === 'Escape' ? setShowFields(false) : null)}
          className="wdk-Answer-filterFieldSelector"
        >
          {parameterElements['text_fields']}
          <div className="wdk-Answer-filterFieldSelectorCloseIconWrapper">
            <button
              className="fa fa-close wdk-Answer-filterFieldSelectorCloseIcon"
              onClick={() => setShowFields(false)}
            />
          </div>
        </TabbableContainer>
      )}
    </>
  );
}

export function DatasetsSearchAndAnswer() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const tableResultTypePartial = {
    type: 'answerSpec',
    displayName: 'Data Sets',
    answerSpec: {
      searchName: TABLE_QUESTION_NAME,
    },
  };

  const { resultType, reporterFormatting } = useSelector((state: RootState) => {
    const answer = state.resultTableSummaryView[VIEW_ID]?.answer;
    if (!answer)
      return {
        resultType: DEFAULT_RESULT_TYPE,
        reporterFormatting: DEFAULT_FORMATTING,
      };
    const { attributes } = answer.meta;
    return {
      resultType: {
        ...DEFAULT_RESULT_TYPE,
        answerSpec: {
          ...DEFAULT_RESULT_TYPE.answerSpec,
          searchConfig: {
            parameters: {
              dataset_id: JSON.stringify(
                answer.records.map((rec) => rec.id[0].value)
              ),
            },
          },
        },
      },
      reporterFormatting: {
        ...DEFAULT_FORMATTING,
        formatConfig: {
          ...DEFAULT_FORMATTING.formatConfig,
          attributes,
        },
      },
    };
  });

  const downloadButton = (
    <button
      className="btn DatasetsSearchAndAnswerBtn"
      type="button"
      onClick={() => {
        downloadReport(
          wdkService,
          resultType as ResultType,
          reporterFormatting,
          '_blank'
        );
      }}
    >
      <Icon fa="download" /> Download CSV
    </button>
  );

  return (
    <>
      <h1>Data Sets</h1>
      <SearchAndAnswer
        recordName={RECORD_NAME}
        tableResultTypePartial={
          tableResultTypePartial as TableResultTypePartial
        }
        resultTableConfig={{
          viewId: VIEW_ID,
          downloadButtonDisplay: 'Download as a CSV',
          showIdAttributeColumn: true,
          showCount: true,
        }}
        formComponent={DatasetsFormComponent}
        downloadButton={downloadButton}
        filterClassName="DatasetsSearchAndAnswerFilter"
        tableClassName="DatasetsSearchAndAnswerTableContainer"
      />
    </>
  );
}
