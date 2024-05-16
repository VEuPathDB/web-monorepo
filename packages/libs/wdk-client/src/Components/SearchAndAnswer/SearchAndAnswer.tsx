import { useMemo, ReactNode } from 'react';
import { RootState } from '../../Core/State/Types';
import { useSelector } from 'react-redux';
import { SearchConfig } from '../../Utils/WdkModel';
import { isEqual } from 'lodash';
import { isParamValueValid } from '../../Views/Question/Params';
import { useWdkDependenciesEffect } from '../../Hooks/WdkDependenciesEffect';
import { updateLastParamValues } from '../../StoreModules/QuestionStoreModule';
import { SearchAndAnswerFilter } from './SearchAndAnswerFilter';
import { SearchAndAnswerTable } from './SearchAndAnswerTable';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { parseQueryString } from '../../Core/RouteEntry';
import { AnswerSpecResultType } from '../../Utils/WdkResult';
import { Props as FormProps } from '../../Views/Question/DefaultQuestionForm';
import { Action } from '../../Views/ResultTableSummaryView/ResultTableSummaryView';

export interface TableResultTypePartial
  extends Omit<AnswerSpecResultType, 'answerSpec'> {
  answerSpec: {
    searchName: string;
  };
}

export interface ResultTableConfig {
  viewId: string;
  downloadButtonDisplay: ReactNode;
  showIdAttributeColumn: boolean;
  showCount: boolean;
}

interface SearchAndAnswerProps {
  recordName: string;
  tableResultTypePartial: TableResultTypePartial;
  resultTableConfig: ResultTableConfig;
  containerClassName?: string;
  filterClassName?: string;
  tableClassName?: string;
  formComponent?: (props: FormProps) => JSX.Element;
  tableActions?: Action[];
  downloadButton?: ReactNode;
}

export function SearchAndAnswer({
  recordName,
  tableResultTypePartial,
  resultTableConfig,
  containerClassName,
  filterClassName,
  tableClassName,
  formComponent,
  tableActions,
  downloadButton,
}: SearchAndAnswerProps) {
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();

  const initialParamData = useMemo(
    () => parseQueryString({ location, history, match }),
    [history, location, match]
  );

  const tableQuestionName = tableResultTypePartial.answerSpec.searchName;

  const { tableResultType, isValid } = useSelector(
    (state: RootState) => {
      const questionState = state.question.questions[tableQuestionName];
      const searchConfig: SearchConfig | undefined =
        questionState?.paramValues && {
          parameters: questionState.paramValues,
        };
      const isValid = questionState?.paramValues
        ? questionState.question.parameters.every((parameter) =>
            isParamValueValid(
              {
                searchName: tableQuestionName,
                paramValues: questionState?.paramValues,
                parameter,
              },
              questionState.paramUIState[parameter.name]
            )
          )
        : true;
      const tableResultType = searchConfig
        ? {
            ...tableResultTypePartial,
            answerSpec: {
              ...tableResultTypePartial.answerSpec,
              searchConfig,
            },
          }
        : undefined;
      return { tableResultType, isValid };
    },
    (left, right) => isEqual(left, right)
  );

  useWdkDependenciesEffect(
    ({ paramValueStore }) => {
      const searchConfig = tableResultType?.answerSpec.searchConfig;
      if (searchConfig == null || !isValid) return;
      updateLastParamValues(
        paramValueStore,
        tableQuestionName,
        searchConfig?.parameters,
        undefined
      );
    },
    [tableResultType?.answerSpec.searchConfig, tableQuestionName, isValid]
  );

  return (
    <div className={containerClassName}>
      <div className={filterClassName}>
        <SearchAndAnswerFilter
          recordName={recordName}
          questionName={tableQuestionName}
          initialParamData={initialParamData}
          formComponent={formComponent}
        />
      </div>
      {!isValid ? (
        <Banner
          banner={{
            type: 'error',
            message:
              'One or more parameter selections above is invalid. Fix them to see results.',
          }}
        />
      ) : tableResultType ? (
        <div className={tableClassName}>
          <SearchAndAnswerTable
            tableResultType={tableResultType}
            resultTableConfig={resultTableConfig}
            tableActions={tableActions}
            downloadButton={downloadButton}
          />
        </div>
      ) : null}
    </div>
  );
}
