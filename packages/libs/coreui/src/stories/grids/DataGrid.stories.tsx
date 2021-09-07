import { Story, Meta } from '@storybook/react/types-6-0';
import CancelIcon from '@material-ui/icons/Cancel';

import DataGrid, { DataGridProps } from '../../components/grids/DataGrid';

import {
  DARK_GRAY,
  DARK_ORANGE,
  DARK_RED,
  LIGHT_GRAY,
  LIGHT_ORANGE,
  MEDIUM_GRAY,
} from '../../constants/colors';

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
    {
      Header: 'Favorite Jedi',
      accessor: 'col3',
    },
  ],
  data: [
    {
      col1: 'Michael',
      col2: 'Hutt',
      col3: 'Palpatine ;)',
    },

    {
      col1: 'Shaun',
      col2: 'Wookie',
      col3: 'Anakin',
    },

    {
      col1: 'DK',
      col2: 'Mandolorian',
      col3: 'Ahsoka',
    },
    {
      col1: 'Connor',
      col2: 'Twilek',
      col3: 'Yoda',
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
    controlsLocation: 'both',
  },
};

export const CustomStyling = Template.bind({});
CustomStyling.args = {
  ...Basic.args,
  title: 'Data Grid w/ Custom Styling',
  styleOverrides: {
    headerCells: {
      borderColor: DARK_GRAY,
      borderWidth: 2,
      borderStyle: 'solid',
      color: LIGHT_GRAY,
      fontSize: 16,
      fontWeight: 400,
      backgroundColor: DARK_GRAY,
    },
    dataCells: {
      borderColor: DARK_ORANGE,
      backgroundColor: LIGHT_ORANGE,
      color: 'whitesmoke',
    },
    icons: {
      activeColor: 'white',
      inactiveColor: MEDIUM_GRAY,
    },
  },
};

export const HeaderAddOns = Template.bind({});
HeaderAddOns.args = {
  ...Basic.args,
  title: 'Data Grid w/ Custom Header Functionality',
  extraHeaderControls: [
    (column) => (
      <div onClick={() => alert('Do something supa supa evil!!!! MWA HA HA')}>
        <CancelIcon
          css={{
            color: DARK_RED,
            position: 'relative',
            left: 20,
          }}
        />
      </div>
    ),
  ],
};
