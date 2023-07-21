import React from 'react';
import { Column } from 'react-table';
import { SortBy } from '../../components/grids/DataGrid';
import Checkbox from '../../components/widgets/Checkbox';

export const columns = ({
  role,
}: {
  role?: 'primary' | 'secondary';
}): Array<Column> => {
  return [
    {
      Header: 'Example of a really long column header',
      accessor: 'record_id',
    },
    {
      Header: 'Household Identifier',
      accessor: 'household_id',
    },
    {
      Header: 'Active',
      accessor: 'isPublic',
      Cell: ({ value }: any) => (
        <div css={{ display: 'flex', justifyContent: 'center' }}>
          <Checkbox
            selected={value}
            onToggle={(newValue) => console.log(newValue)}
            themeRole={role}
          />
        </div>
      ),
    },
    {
      Header: 'Variable One',
      accessor: 'variable_one',
    },
    {
      Header: 'Variable Two',
      accessor: 'variable_two',
    },
  ];
};

export const ROWS = [
  {
    record_id: '1010001',
    household_id: 'hh_1010001',
    isPublic: true,
    variable_one: '38.0',
    variable_two: '2012-04-21T00:00:00',
  },
  {
    record_id: '1010002',
    household_id: 'hh_1010002',
    isPublic: false,
    variable_one: '26.0',
    variable_two: '2012-05-02T00:00:00',
  },
  {
    record_id: '1010003',
    household_id: 'hh_1010003',
    isPublic: false,
    variable_one: '19.0',
    variable_two: '2012-06-12T00:00:00',
  },
  {
    record_id: '1010004',
    household_id: 'hh_1010004',
    isPublic: true,
    variable_one: '57.0',
    variable_two: '2012-07-29T00:00:00',
  },
  {
    record_id: '1010005',
    household_id: 'hh_1010005',
    isPublic: false,
    variable_one: '30.0',
    variable_two: '2012-08-04T00:00:00',
  },
  {
    record_id: '1010009',
    household_id: 'hh_1010009',
    isPublic: true,
    variable_one: '50.0',
    variable_two: '',
  },
  {
    record_id: '1010015',
    household_id: 'hh_1010015',
    isPublic: false,
    variable_one: '22.0',
    variable_two: '2012-08-14T00:00:00',
  },
  {
    record_id: '1010016',
    household_id: 'hh_1010016',
    isPublic: true,
    variable_one: '40.0',
    variable_two: '2012-08-12T00:00:00',
  },
  {
    record_id: '1010021',
    household_id: 'hh_1010021',
    isPublic: false,
    variable_one: '54.0',
    variable_two: '2012-08-16T00:00:00',
  },
  {
    record_id: '1010022',
    household_id: 'hh_1010022',
    isPublic: true,
    variable_one: '38.0',
    variable_two: '2012-08-21T00:00:00',
  },
  {
    record_id: '1010023',
    household_id: 'hh_1010023',
    isPublic: false,
    variable_one: '60.0',
    variable_two: '2012-08-17T00:00:00',
  },
  {
    record_id: '1010024',
    household_id: 'hh_1010024',
    isPublic: true,
    variable_one: '37.0',
    variable_two: '2012-08-17T00:00:00',
  },
  {
    record_id: '1010025',
    household_id: 'hh_1010025',
    isPublic: false,
    variable_one: '60.0',
    variable_two: '2012-08-24T00:00:00',
  },
  {
    record_id: '1010030',
    household_id: 'hh_1010030',
    isPublic: true,
    variable_one: '27.0',
    variable_two: '2012-08-18T00:00:00',
  },
  {
    record_id: '1010031',
    household_id: 'hh_1010031',
    isPublic: true,
    variable_one: '17.0',
    variable_two: '2012-08-20T00:00:00',
  },
  {
    record_id: '1010032',
    household_id: 'hh_1010032',
    isPublic: true,
    variable_one: '50.0',
    variable_two: '2012-08-20T00:00:00',
  },
  {
    record_id: '1010037',
    household_id: 'hh_1010037',
    isPublic: false,
    variable_one: '60.0',
    variable_two: '2012-08-26T00:00:00',
  },
  {
    record_id: '1010041',
    household_id: 'hh_1010041',
    isPublic: true,
    variable_one: '40.0',
    variable_two: '2012-08-26T00:00:00',
  },
  {
    record_id: '1010042',
    household_id: 'hh_1010042',
    isPublic: false,
    variable_one: '50.0',
    variable_two: '2012-08-28T00:00:00',
  },
  {
    record_id: '1010044',
    household_id: 'hh_1010044',
    isPublic: true,
    variable_one: '40.0',
    variable_two: '2012-08-31T00:00:00',
  },
];

export function fetchGridData({
  pageSize,
  pageIndex,
  sortBy,
}: {
  pageSize: number;
  pageIndex: number;
  sortBy?: SortBy;
}) {
  const startRow = pageSize * pageIndex;
  const endRow = startRow + pageSize;

  const sortedRows = sortBy
    ? [...ROWS].sort((rowA, rowB) => {
        for (const column of sortBy) {
          const [valA, valB] = [rowA[column.id], rowB[column.id]];

          if (valA !== valB) {
            if (column.desc) return valA > valB ? -1 : 1;
            else return valA < valB ? -1 : 1;
          }
        }

        return 0;
      })
    : ROWS;

  return sortedRows.slice(startRow, endRow);
}
