import { escapeRegExp } from 'lodash';
import React from 'react';
import { Dispatch } from 'redux';

import Mesa from '../../Components/Mesa';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import { Tabs } from '../../Components';
import { Seq } from '../../Utils/IterableUtils';

import {
  searchTable,
  sortTable,
  selectTab,
  changeTablePage,
  changeTableRowsPerPage,
} from '../../Actions/AttributeAnalysisActions';

import '../../Views/AttributeAnalysis/AttributeAnalysisTabs.scss';

export interface TableState {
  currentPage: number;
  rowsPerPage: number;
  sort: { key: string; direction: 'asc' | 'desc' };
  search: string;
}

type VisualizationConfig = {
  display: string;
  content: React.ReactNode;
};

type TableConfig<T extends string> = {
  columns: { key: T; display: string }[];
  data: Record<T, string | number>[];
};

type Props<T extends string> = {
  dispatch: Dispatch;
  activeTab: string;
  tableState: TableState;
  visualizationConfig: VisualizationConfig;
  tableConfig: TableConfig<T>;
};

type Column = { key: 'value' | 'count'; display: string };

export default class AttributeAnalysisTabs<
  T extends string
> extends React.PureComponent<Props<T>> {
  onPageChange = (currentPage: number) =>
    this.props.dispatch(changeTablePage(currentPage));

  onRowsPerPageChange = (rowsPerPage: number) =>
    this.props.dispatch(changeTableRowsPerPage(rowsPerPage));

  onSort = (column: Column, direction: 'asc' | 'desc') =>
    this.props.dispatch(sortTable(column.key, direction));

  onSearch = (search: string) => this.props.dispatch(searchTable(search));

  onTabSelected = (tab: 'table' | 'visualization') =>
    this.props.dispatch(selectTab(tab));

  render() {
    const { activeTab, tableState, visualizationConfig, tableConfig } =
      this.props;
    const { currentPage, rowsPerPage, sort, search } = tableState;

    const { data } = tableConfig;

    const searchRe = new RegExp(escapeRegExp(search), 'i');

    const filteredData = Seq.from(tableConfig.data)
      .filter((row) =>
        search
          ? tableConfig.columns.some((column) =>
              searchRe.test(String(row[column.key] || ''.toLowerCase()))
            )
          : true
      )
      .orderBy((row) => (row as any)[sort.key], sort.direction === 'desc')
      .toArray();

    const firstRowIndex = (currentPage - 1) * rowsPerPage;
    const pagedData = filteredData.slice(
      firstRowIndex,
      firstRowIndex + rowsPerPage
    );

    return (
      <Tabs
        containerClassName="AttributeAnalysisTabs"
        activeTab={activeTab}
        onTabSelected={this.onTabSelected}
        tabs={[
          {
            key: 'visualization',
            display: visualizationConfig.display,
            content: visualizationConfig.content,
          },
          {
            key: 'table',
            display: 'Data',
            content: (
              <React.Fragment>
                <RealTimeSearchBox
                  className="TabularAttributeAnalysisSearchBox"
                  placeholderText="Search table"
                  searchTerm={tableState.search}
                  onSearchTermChange={this.onSearch}
                />
                <Mesa
                  state={{
                    options: {
                      useStickyHeader: true,
                      tableBodyMaxHeight: '38vh',
                    },
                    actions: [],
                    eventHandlers: {
                      onSort: this.onSort,
                      onPageChange: this.onPageChange,
                      onRowsPerPageChange: this.onRowsPerPageChange,
                    },
                    uiState: {
                      sort: {
                        columnKey: tableState.sort.key,
                        direction: tableState.sort.direction,
                      },
                      pagination: {
                        currentPage,
                        rowsPerPage,
                        totalRows: filteredData.length,
                      },
                    },
                    rows: data,
                    filteredRows: pagedData,
                    columns: tableConfig.columns.map(
                      ({ key, display: name }) => ({
                        key,
                        name,
                        sortable: true,
                      })
                    ),
                  }}
                />
              </React.Fragment>
            ),
          },
        ]}
      />
    );
  }
}
