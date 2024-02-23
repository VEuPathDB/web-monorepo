import { Meta, Story } from '@storybook/react';
import TreeTable, { TreeTableProps } from '../../components/tidytree/TreeTable';
import { MesaColumn } from '../../../../coreui/lib/components/Mesa/types';
import { useState } from 'react';

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

const commonArgs: DeepPartial<TreeTableProps<LeafRow>> = {
  rowHeight: 50,
  treeProps: {
    width: 400,
  },
  tableProps: {
    columns: tableColumns,
  },
};

export const SevenRows = Template.bind({});
SevenRows.args = {
  ...commonArgs,
  treeProps: {
    ...commonArgs.treeProps,
    data: sevenLeafTree,
  },
  tableProps: {
    ...commonArgs.tableProps,
    rows: sevenLeafTableRows,
  },
} as TreeTableProps<LeafRow>;

const HLTemplate: Story<TreeTableProps<LeafRow>> = (args) => {
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  return <TreeTable {...args} />;
};

export const Highlighting = HLTemplate.bind({});
Highlighting.args = {
  ...commonArgs,
  treeProps: {
    ...commonArgs.treeProps,
    data: sevenLeafTree,
  },
  tableProps: {
    ...commonArgs.tableProps,
    rows: sevenLeafTableRows,
  },
} as TreeTableProps<LeafRow>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>> // If it's an array, make its elements DeepPartial
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>> // Also handle readonly arrays
    : T[P] extends object
    ? DeepPartial<T[P]> // Apply DeepPartial recursively if the property is an object
    : T[P]; // Otherwise, just make the property optional
};
