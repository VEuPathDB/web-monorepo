import { ResultTableSummaryViewController } from '../../Controllers';
import { ResultType } from '../../Utils/WdkResult';
import { Action } from '../../Views/ResultTableSummaryView/ResultTableSummaryView';
import { ResultTableConfig } from './SearchAndAnswer';

interface SearchAndAnswerTableProps {
  tableResultType: ResultType;
  resultTableConfig: ResultTableConfig;
  tableActions?: Action[];
}

export function SearchAndAnswerTable(props: SearchAndAnswerTableProps) {
  const {
    tableResultType,
    resultTableConfig,
    tableActions = undefined,
  } = props;

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
