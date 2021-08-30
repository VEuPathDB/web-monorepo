import { Story, Meta } from '@storybook/react/types-6-0';
import { DataGrid } from '../../components/grids/DataGrid';

export default {
  title: 'Grids/DataGrid',
  component: DataGrid,
} as Meta;

const Template: Story<any> = (args) => <DataGrid {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  title: 'Basic Data Grid',
};

export const WithSorting = Template.bind({});
WithSorting.args = {
  title: 'Data Grid w/ Column Sorting',
  sortable: true,
};

export const WithPagination = Template.bind({});
WithPagination.args = {
  title: 'Data Grid w/ Record Pagination',
  pagination: {
    recordsPerPage: 2,
  },
};
