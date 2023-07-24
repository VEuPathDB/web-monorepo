import { Story, Meta } from '@storybook/react/types-6-0';
import CancelIcon from '@material-ui/icons/Cancel';

import React, { useCallback, useState } from 'react';

import {
  gray,
  green,
  orange,
  purple,
  red,
  cyan,
} from '../../definitions/colors';
import { columns, fetchGridData, ROWS } from './data';
import DataGrid, { DataGridProps } from '../../components/grids/DataGrid';
import UIThemeProvider from '../../components/theming/UIThemeProvider';

export default {
  title: 'Grids/DataGrid',
  component: DataGrid,
} as Meta;

const Template: Story<DataGridProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: cyan, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <DataGrid {...args} columns={columns({ role: args.themeRole })} />
    </UIThemeProvider>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  title: 'Basic Data Grid',
  data: ROWS,
  onRowSelection: null,
};

export const WithSorting = Template.bind({});
WithSorting.args = {
  ...Basic.args,
  title: 'Data Grid w/ Column Sorting',
  sortable: true,
};

export const WithPagination = Template.bind({});
WithPagination.args = {
  ...Basic.args,
  title: 'Data Grid w/ Record Pagination',
  pagination: {
    recordsPerPage: 2,
    controlsLocation: 'both',
  },
};

const reportSelectedRows = (rows) =>
  console.log(`checked rows: ${rows.map((row) => row.original.record_id)}`);

export const WithRowSelection = Template.bind({});
WithRowSelection.args = {
  ...Basic.args,
  onRowSelection: reportSelectedRows,
  title: 'Data Grid w/ Row Selection',
  pagination: {
    recordsPerPage: 2,
    controlsLocation: 'bottom',
  },
};

export const WithPreselectedRowSelection = Template.bind({});
WithPreselectedRowSelection.args = {
  ...Basic.args,
  data: ROWS.map((row, index) => ({
    ...row,
    isSelected: index % 3 === 0,
  })),
  onRowSelection: reportSelectedRows,
  title: 'Data Grid w/ Row Selection',
  pagination: {
    recordsPerPage: 10,
    controlsLocation: 'bottom',
  },
};

export const WithServerControlledPagination: Story<DataGridProps> = (args) => {
  const [gridData, setGridData] = useState<Array<object>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const fetchPaginatedData = useCallback(({ pageSize, pageIndex, sortBy }) => {
    setIsLoading(true);
    setTimeout(() => {
      setGridData(fetchGridData({ pageSize, pageIndex, sortBy }));
      setPageCount(20 / pageSize);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <DataGrid
        {...args}
        columns={columns({ role: args.themeRole })}
        data={gridData}
        loading={isLoading}
        pagination={{
          recordsPerPage: 5,
          controlsLocation: 'bottom',
          serverSidePagination: {
            pageCount,
            fetchPaginatedData,
          },
        }}
      />
    </UIThemeProvider>
  );
};
WithServerControlledPagination.args = {
  title: 'Data Grid w/ Server Pagination',
};

export const WithServerControlledPaginationAndSorting: Story<DataGridProps> = (
  args
) => <WithServerControlledPagination {...args} />;
WithServerControlledPaginationAndSorting.args = {
  title: 'Data Grid w/ Server Pagination and Sorting',
  sortable: true,
};

export const StylePreset = Template.bind({});
StylePreset.args = {
  ...Basic.args,
  title: 'Data Grid w/ Style Preset',
  stylePreset: 'mesa',
  pagination: {
    recordsPerPage: 2,
    controlsLocation: 'bottom',
  },
};

export const CustomStyling = Template.bind({});
CustomStyling.args = {
  ...Basic.args,
  title: 'Data Grid w/ Custom Styling',
  styleOverrides: {
    headerCells: {
      borderColor: gray[400],
      borderWidth: 2,
      borderStyle: 'solid',
      color: gray[100],
      fontSize: 16,
      backgroundColor: gray[400],
      textTransform: 'none',
    },
    dataCells: {
      borderColor: orange[500],
      backgroundColor: orange[300],
      color: 'whitesmoke',
    },
    icons: {
      activeColor: 'white',
      inactiveColor: gray[300],
    },
  },
} as DataGridProps;

export const HeaderAddOns = Template.bind({});
HeaderAddOns.args = {
  ...Basic.args,
  title: 'Data Grid w/ Custom Header Functionality',
  extraHeaderControls: [
    (column) => (
      <CancelIcon
        css={{
          color: red[500],
          marginLeft: 20,
        }}
        onClick={() => alert('Do something supa supa evil!!!! MWA HA HA')}
      />
    ),
  ],
};
