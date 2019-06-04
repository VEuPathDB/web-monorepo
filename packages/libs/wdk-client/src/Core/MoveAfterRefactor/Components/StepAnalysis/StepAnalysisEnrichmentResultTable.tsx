import { Component, Fragment } from 'react';

import Mesa, { MesaState, Utils as MesaUtils } from '../../../../Components/Mesa';
import { RealTimeSearchBox } from '../../../../Components';
import React from 'react';
import { htmlStringValue, numericValue } from '../../../../Components/Mesa/Utils/Utils';
import { compose, debounce } from 'lodash/fp';

const simpleFilterPredicateFactory = (searchQuery: string) => (row: Record<string, string>) =>
  Object.values(row).some(entry => `${entry}`.toLowerCase().includes(searchQuery.toLowerCase()));

interface StepAnalysisEnrichmentResultTableProps {
  emptyResultMessage: string;
  rows: Record<string, any>[];
  columns: ColumnSettings[];
  initialSearchQuery?: string;
  initialSortColumnKey?: string;
  initialSortDirection?: 'asc' | 'desc';
  fixedTableHeader?: boolean;
  pagination?: boolean;
}

export interface ColumnSettings {
  key: string;
  name: string;
  helpText?: string;
  sortable: boolean;
  type?: 'text' | 'html';
  width?: string;
  renderCell?: React.SFC;
  sortType?: 'text' | 'number' | 'htmlText' | 'htmlNumber';
}

export class StepAnalysisEnrichmentResultTable extends Component<StepAnalysisEnrichmentResultTableProps, any> {
  constructor(props: StepAnalysisEnrichmentResultTableProps) {
    super(props);
    this.handleSearch = debounce(200, this.handleSearch.bind(this));
    this.handleSort = this.handleSort.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

    this.state = MesaState.create({
      rows: this.props.rows,
      columns: this.props.columns,
      options: 
        this.props.fixedTableHeader 
          ? (
            {
              showCount: true,
              toolbar: true
            }
          )
          : (
            {
              showCount: true,
              toolbar: true,
              useStickyHeader: true,
              tableBodyMaxHeight: '80vh'
            }
          ),
      uiState: {
        searchQuery: this.props.initialSearchQuery || '',
        sort: {
          columnKey: this.props.initialSortColumnKey || null,
          direction: this.props.initialSortDirection || 'asc'
        },
        pagination: this.props.pagination 
          ? {
            currentPage: 1,
            totalRows: this.props.rows.length,
            rowsPerPage: 20
          }
          : undefined
      },
      eventHandlers: {
        onSort: ({ key }: any, direction: any) => this.handleSort(key, direction),
        onPageChange: this.handlePageChange,
        onRowsPerPageChange: this.handleRowsPerPageChange
      }
    });
  }

  componentDidUpdate(prevProps: StepAnalysisEnrichmentResultTableProps) {
    if (prevProps !== this.props) {
      this.setState(
        (prevState: any, props: StepAnalysisEnrichmentResultTableProps) => 
          MesaState.setRows(prevState, props.rows)
      );
    }
  }

  handleSearch(searchQuery: string) {
    const updatedTableState = MesaState.setSearchQuery(this.state, searchQuery);

    this.setState(updatedTableState);
  }

  handleSort(sortByKey: string, sortDirection: 'asc' | 'desc') {
    const { setSortDirection, setSortColumnKey } = MesaState;
    const updatedTableState = setSortDirection(setSortColumnKey(this.state, sortByKey), sortDirection);

    this.setState(updatedTableState);
  }

  handlePageChange(pageNumber: number) {
    const updatedTableState = MesaState.setUiState(
      this.state,
      {
        ...MesaState.getUiState(this.state),
        pagination: {
          ...MesaState.getUiState(this.state).pagination,
          currentPage: pageNumber
        }
      }
    );

    this.setState(updatedTableState);
  }

  handleRowsPerPageChange(rowsPerPage: number) {
    const updatedTableState = MesaState.setUiState(
      this.state,
      {
        ...MesaState.getUiState(this.state),
        pagination: {
          ...MesaState.getUiState(this.state).pagination,
          rowsPerPage
        }
      }
    );

    this.setState(updatedTableState);
  }

  render() {
    const { getColumns, getFilteredRows, getUiState, setFilteredRows, setUiState } = MesaState;
    const { searchQuery, sort: { columnKey: sortColumnKey, direction: sortDirection } } = getUiState(this.state);

    const filteredState = searchQuery
      ? MesaState.filterRows(this.state, simpleFilterPredicateFactory(searchQuery))
      : this.state;

    const allRows = MesaState.getRows(filteredState);
    const filteredRows = MesaState.getFilteredRows(filteredState);

    const filterCountedState = setUiState(
      filteredState,
      {
        ...MesaState.getUiState(filteredState),
        filteredRowCount: allRows.length - filteredRows.length,
      }
    );

    const { currentPage = 1, rowsPerPage = 20 } = MesaState.getUiState(filteredState).pagination || { };
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const newCurrentPage = Math.min(currentPage, totalPages);

    const pagedRows = filteredRows.slice((newCurrentPage - 1) * rowsPerPage, newCurrentPage * rowsPerPage);
    const pagedState = MesaState.getUiState(filteredState).pagination 
      ? setUiState(
          setFilteredRows(filterCountedState, pagedRows),
          {
            ...MesaState.getUiState(filterCountedState),
            pagination: {
              ...MesaState.getUiState(filterCountedState).pagination,
              currentPage: newCurrentPage,
              totalPages,
              totalRows: allRows.length
            }
          }
      )
      : filterCountedState;
  
    const { sortType = 'text' } = getColumns(pagedState).find(({ key }) => key === sortColumnKey) || {};
    const sortMethod = sortTypes[sortType] || sortTypes['text'];
    
    const unsortedRows = getFilteredRows(pagedState);
    const sortedRows = sortColumnKey === null
      ? unsortedRows
      : sortMethod(unsortedRows, sortColumnKey, sortDirection === 'asc');

    const sortedState = setFilteredRows(
      pagedState,
      sortedRows
    );

    return (
      <Fragment>
        {
          this.props.rows.length
            ? (
              <Mesa state={sortedState}>
                <RealTimeSearchBox
                  className="enrichment-search-field"
                  autoFocus={false}
                  searchTerm={searchQuery}
                  onSearchTermChange={this.handleSearch}
                  placeholderText={''}
                  helpText={'The entire table will be searched'}
                />
              </Mesa>
            )
            : (
              <div className="enrich-empty-results">
                {this.props.emptyResultMessage}
              </div>
            )
        }
      </Fragment>
    );
  }
}

const sortTypes: Record<string, ((rows: any[], key: string, ascending: boolean) => any[])> = {
  'number': MesaUtils.numberSort,
  'text': MesaUtils.textSort,
  'htmlText': MesaUtils.customSortFactory(htmlStringValue),
  'htmlNumber': MesaUtils.customSortFactory(compose(
    numericValue,
    htmlStringValue
  ))
};
