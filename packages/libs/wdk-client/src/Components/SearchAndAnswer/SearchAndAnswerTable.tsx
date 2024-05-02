import { useMemo } from 'react';
import { ResultTableSummaryViewController } from '../../Controllers';
import { useNonNullableContext } from '../../Hooks/NonNullableContext';
import { WdkDependenciesContext } from '../../Hooks/WdkDependenciesEffect';
import { downloadReport, ResultType } from '../../Utils/WdkResult';
import { Action } from '../../Views/ResultTableSummaryView/ResultTableSummaryView';
import Icon from '../Icon/IconAlt';
import { AnswerFormatting } from '../../Service/Mixins/SearchReportsService';
import { ResultTableConfig } from './SearchAndAnswer';
import { RecordInstance } from '../../Utils/WdkModel';

interface SearchAndAnswerTableProps {
  tableResultType: ResultType;
  getReporterResultType: (records: RecordInstance[]) => ResultType;
  reporterFormatting: AnswerFormatting;
  resultTableConfig: ResultTableConfig;
}

export function SearchAndAnswerTable(props: SearchAndAnswerTableProps) {
  const {
    tableResultType,
    getReporterResultType,
    reporterFormatting,
    resultTableConfig,
  } = props;
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const tableActions = useMemo((): Action[] => {
    return [
      {
        element: (selectedRecords) => {
          const reporterResultType = getReporterResultType(selectedRecords);
          return (
            <button
              className="btn"
              type="button"
              disabled={selectedRecords.length === 0}
              onClick={() => {
                downloadReport(
                  wdkService,
                  reporterResultType,
                  reporterFormatting,
                  '_blank'
                );
              }}
            >
              <Icon fa="download" /> {resultTableConfig.downloadButtonDisplay}
            </button>
          );
        },
      },
    ];
  }, [
    wdkService,
    getReporterResultType,
    reporterFormatting,
    resultTableConfig.downloadButtonDisplay,
  ]);

  return (
    <>
      <ResultTableSummaryViewController
        tableActions={tableActions}
        viewId={resultTableConfig.viewId}
        resultType={tableResultType}
        showIdAttributeColumn={resultTableConfig.showIdAttributeColumn}
        showCount={resultTableConfig.showCount}
      />
    </>
  );
}
