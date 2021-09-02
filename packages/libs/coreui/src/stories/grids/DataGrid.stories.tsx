import { Story, Meta } from '@storybook/react/types-6-0';
import DataGrid, { DataGridProps } from '../../components/grids/DataGrid';

export default {
  title: 'Grids/DataGrid',
  component: DataGrid,
} as Meta;

const Template: Story<DataGridProps> = (args) => <DataGrid {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  title: 'Basic Data Grid',
  columns: [
    {
      Header: 'Participant Name',
      accessor: 'col1', // accessor is the "key" in the data
    },
    {
      Header: 'Participant Species',
      accessor: 'col2',
    },
  ],
  data: [
    {
      col1: 'Michael',
      col2: 'Hutt',
    },

    {
      col1: 'Shaun',
      col2: 'Wookie',
    },

    {
      col1: 'DK',
      col2: 'Mandolorian',
    },
    {
      col1: 'Connor',
      col2: 'Twilek',
    },
  ],
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
  },
};
