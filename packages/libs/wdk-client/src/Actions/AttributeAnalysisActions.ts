import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { ServiceError } from 'wdk-client/Service/ServiceError';

// Actions
// -------

export type Action =
  | InferAction<typeof openAttributeAnalysis>
  | InferAction<typeof closeAttributeAnalysis>
  | InferAction<typeof requestAttributeReport>
  | InferAction<typeof fulfillAttributeReport>
  | InferAction<typeof errorAttributeReport>
  | InferAction<typeof changeTablePage>
  | InferAction<typeof changeTableRowsPerPage>
  | InferAction<typeof sortTable>
  | InferAction<typeof searchTable>
  | InferAction<typeof selectTab>

// Open view
export const openAttributeAnalysis = makeActionCreator(
  'attribute-analysis/open',
  (reporterName: string, stepId: number) => ({
    reporterName,
    stepId
  })
)


// Close view
export const closeAttributeAnalysis = makeActionCreator(
  'attribute-analysis/close',
  (reporterName: string, stepId: number) => ({
    reporterName,
    stepId
  })
)

// Request report
export const requestAttributeReport = makeActionCreator(
  'attribute-analysis/request-report',
  (reporterName: string, stepId: number, config?: any) => ({
    reporterName,
    stepId,
    config
  })
)

// Fulfill report
export const fulfillAttributeReport = makeActionCreator(
  'attribute-analysis/fulfill-attribute-report',
  (reporterName: string, stepId: number, report: any) => ({
    reporterName,
    stepId,
    report
  })
)

// Fail report
export const errorAttributeReport = makeActionCreator(
  'attribute-analysis/error-attribute-report',
  (reporterName: string, stepId: number, error: ServiceError) => ({
    reporterName,
    stepId,
    error
  })
)

export const changeTablePage = makeActionCreator(
  'attribute-analysis/change-table-page',
  (page: number) => ({ page })
)

export const changeTableRowsPerPage = makeActionCreator(
  'attribute-analysis-change-tables-rows-per-page',
  (rowsPerPage: number) => ({ rowsPerPage })
)

export const sortTable = makeActionCreator(
  'attribute-analysis/sort-table',
  (key: string, direction: 'asc' | 'desc') => ({ key, direction })
)

export const searchTable = makeActionCreator(
  'attribute-analysis/search-table',
  (searchString: string) => ({ searchString })
)

export const selectTab = makeActionCreator(
  'attribute-analysis/select-tab',
  (tab: 'table' | 'visualization') => ({ tab })
)
