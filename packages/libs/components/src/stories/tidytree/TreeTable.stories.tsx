import { Meta, Story } from '@storybook/react';
import {
  HorizontalDendrogram,
  HorizontalDendrogramProps,
} from '../../components/tidytree/HorizontalDendrogram';
import Mesa from '@veupathdb/coreui/lib/components/Mesa';
import { MesaStateProps } from '../../../../coreui/lib/components/Mesa/types';
import { css as classNameStyle, cx } from '@emotion/css';
import { css as globalStyle, Global } from '@emotion/react';

export default {
  title: 'TreeTable',
  component: HorizontalDendrogram, // TO DO: make TreeTable component!
  parameters: {},
  argTypes: {}, // couldn't get storybook-addon-deep-controls to work :(
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

const Template: Story<HorizontalDendrogramProps> = (args) => {
  const rowStyleClassName = cx(
    classNameStyle({
      height: args.rowHeight + 'px',
      background: 'yellow',
    })
  );

  const tableState: MesaStateProps<LeafRow> = {
    rows: sevenLeafTableRows,
    columns: [
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
    ],
    options: {
      deriveRowClassName: (_) => rowStyleClassName,
    },
  };

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'row' }}
    >
      <div style={{ background: 'yellow' }}>
        <HorizontalDendrogram {...args} />
      </div>
      <div style={{ background: 'pink' }}>
        <Global
          styles={globalStyle`
	  .DataTable {
	    margin-bottom: 0px !important;
	  }
	`}
        />
        <Mesa state={tableState} />
      </div>
    </div>
  );
};

const commonArgs: Partial<HorizontalDendrogramProps> = {
  width: 400,
  rowHeight: 50,
  options: {
    margin: [0, 10, 0, 10],
  },
};

export const SevenRows = Template.bind({});
SevenRows.args = {
  data: sevenLeafTree,
  leafCount: 7,
  ...commonArgs,
};
