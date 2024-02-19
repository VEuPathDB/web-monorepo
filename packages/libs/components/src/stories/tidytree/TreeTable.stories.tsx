import { Meta, Story } from '@storybook/react';
import TreeTable, { TreeTableProps } from '../../components/tidytree/TreeTable';
import { MesaColumn } from '../../../../coreui/lib/components/Mesa/types';

export default {
  title: 'TreeTable',
  component: TreeTable,
  parameters: {},
  argTypes: {},
} as Meta;

// the file is in the public/data directory
const sevenLeafTree =
  '(Bovine:0.69395,(Gibbon:0.36079,(Orang:0.33636,(Gorilla:0.17147,(Chimp:0.19268, Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460)';

interface LeafRow {
  leafId: string;
  accession: string;
  length: number;
  domains: string;
}

const sevenLeafTableRows: LeafRow[] = [
  {
    leafId: 'Bovine',
    accession: 'bov0123',
    length: 99,
    domains: 'ABC XYZ',
  },
  {
    leafId: 'Gibbon',
    accession: 'gib0987',
    length: 120,
    domains: 'ABC XYZ',
  },
  {
    leafId: 'Orang',
    accession: 'ora0333',
    length: 102,
    domains: 'ABC XYZ QQQ',
  },
  {
    leafId: 'Gorilla',
    accession: 'gor0321',
    length: 119,
    domains: 'ABC',
  },
  {
    leafId: 'Chimp',
    accession: 'chi0111',
    length: 111,
    domains: 'ABC XYZ',
  },
  {
    leafId: 'Human',
    accession: 'hum0008',
    length: 104,
    domains: 'ABC XYZ',
  },
  {
    leafId: 'Mouse',
    accession: 'mus0738',
    length: 150,
    domains: 'ABC DEF XYZ',
  },
];

const tableColumns: MesaColumn<LeafRow>[] = [
  {
    key: 'leafId',
    name: 'Leaf ID',
  },
  {
    key: 'accession',
    name: 'Sequence accession',
  },
  {
    key: 'length',
    name: 'Sequence length',
  },
  {
    key: 'domains',
    name: 'Domains',
  },
];

const Template: Story<TreeTableProps<LeafRow>> = (args) => {
  return <TreeTable {...args} />;
};

const commonArgs: Partial<TreeTableProps<LeafRow>> = {
  width: 400,
  rowHeight: 50,
  options: {
    margin: [0, 10, 0, 10],
  },
  columns: tableColumns,
};

export const SevenRows = Template.bind({});
SevenRows.args = {
  ...commonArgs,
  data: sevenLeafTree,
  rows: sevenLeafTableRows,
};
