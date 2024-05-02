import { useMemo, ReactNode } from 'react';
import { RootState } from '../../Core/State/Types';
import { useSelector } from 'react-redux';
import { RecordInstance, SearchConfig } from '../../Utils/WdkModel';
import { isEqual } from 'lodash';
import { isParamValueValid } from '../../Views/Question/Params';
import { useWdkDependenciesEffect } from '../../Hooks/WdkDependenciesEffect';
import { updateLastParamValues } from '../../StoreModules/QuestionStoreModule';
import { SearchAndAnswerFilter } from './SearchAndAnswerFilter';
import { SearchAndAnswerTable } from './SearchAndAnswerTable';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { parseQueryString } from '../../Core/RouteEntry';
import { AnswerSpecResultType, ResultType } from '../../Utils/WdkResult';
import { AnswerFormatting } from '../../Service/Mixins/SearchReportsService';

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
  getReporterResultType: (records: RecordInstance[]) => ResultType;
  reporterFormatting: AnswerFormatting;
  resultTableConfig: ResultTableConfig;
  filterClassName?: string;
}

export function SearchAndAnswer({
  recordName,
  tableResultTypePartial,
  getReporterResultType,
  reporterFormatting,
  resultTableConfig,
  filterClassName,
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
    <>
      <div className={filterClassName}>
        <SearchAndAnswerFilter
          recordName={recordName}
          questionName={tableQuestionName}
          initialParamData={initialParamData}
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
        <SearchAndAnswerTable
          tableResultType={tableResultType}
          getReporterResultType={getReporterResultType}
          reporterFormatting={reporterFormatting}
          resultTableConfig={resultTableConfig}
        />
      ) : null}
    </>
  );
}
