import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  IconProps,
  Arrow,
  CaretDown,
  CaretUp,
  DoubleArrow,
  Cancel,
} from '../../assets/icons';
import {
  ArrowDown,
  ArrowRight,
  CheckIcon,
  CheckCircle,
  ChevronRight,
  Close,
  CloseCircle,
  CloseFullscreen,
  Copy,
  Download,
  EdaIcon,
  Edit,
  Filter,
  Loading,
  NoEdit,
  Pencil,
  SampleDetailsDark,
  SampleDetailsLight,
  Share,
  TableDownload,
  Table,
  TaxaQueryDark,
  TaxaQueryLight,
  Trash,
  Undo,
  Warning,
} from '../../components/icons';
import { gray } from '../../definitions/colors';
import { H5 } from '../../components/typography';
import { grey } from '@material-ui/core/colors';

export default {
  title: 'Typography/Icons',
  component: Arrow,
  argTypes: {
    color: {
      control: {
        type: 'color',
      },
    },
  },
} as Meta;

const IconDisplay = ({
  name,
  component,
  ...args
}: IconProps & {
  name: string;
  component: (props: IconProps) => JSX.Element;
}) => {
  const Icon = component;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 10,
      }}
    >
      <div>
        <Icon {...args} />
      </div>
      <div
        style={{
          color: args.color,
          fontSize: 14,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const AllIcons: Story<IconProps> = (args) => {
  return (
    <div>
      <H5 additionalStyles={{ margin: '0.75em 0' }}>Icons</H5>
      <div
        style={{
          display: 'grid',
          gap: 40,
          gridTemplateColumns: 'repeat(6, auto)',
          padding: 20,
          backgroundColor: grey[200],
          borderRadius: 10,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <IconDisplay {...args} name="Arrow" component={Arrow} />
        <IconDisplay {...args} name="ArrowDown" component={ArrowDown} />
        <IconDisplay {...args} name="ArrowRight" component={ArrowRight} />
        <IconDisplay {...args} name="Cancel" component={Cancel} />
        <IconDisplay {...args} name="CaretDown" component={CaretDown} />
        <IconDisplay {...args} name="CaretUp" component={CaretUp} />
        <IconDisplay {...args} name="CheckCircle" component={CheckCircle} />
        <IconDisplay {...args} name="CheckIcon" component={CheckIcon} />
        <IconDisplay {...args} name="ChevronRight" component={ChevronRight} />
        <IconDisplay {...args} name="Close" component={Close} />
        <IconDisplay {...args} name="CloseCircle" component={CloseCircle} />
        <IconDisplay
          {...args}
          name="CloseFullscreen"
          component={CloseFullscreen}
        />
        <IconDisplay {...args} name="Copy" component={Copy} />
        <IconDisplay {...args} name="DoubleArrow" component={DoubleArrow} />
        <IconDisplay {...args} name="Download" component={Download} />
        <IconDisplay {...args} name="EdaIcon" component={EdaIcon} />
        <IconDisplay {...args} name="Edit" component={Edit} />
        <IconDisplay {...args} name="Filter" component={Filter} />
        <IconDisplay {...args} name="Loading" component={Loading} />
        <IconDisplay {...args} name="NoEdit" component={NoEdit} />
        <IconDisplay {...args} name="Pencil" component={Pencil} />
        <IconDisplay
          {...args}
          name="SampleDetailsDark"
          component={SampleDetailsDark}
        />
        <IconDisplay
          {...args}
          name="SampleDetailsLight"
          component={SampleDetailsLight}
        />
        <IconDisplay {...args} name="Share" component={Share} />
        <IconDisplay {...args} name="TableDownload" component={TableDownload} />
        <IconDisplay {...args} name="Table" component={Table} />
        <IconDisplay {...args} name="TaxaQueryDark" component={TaxaQueryDark} />
        <IconDisplay
          {...args}
          name="TaxaQueryLight"
          component={TaxaQueryLight}
        />
        <IconDisplay {...args} name="Trash" component={Trash} />
        <IconDisplay {...args} name="Undo" component={Undo} />
        <IconDisplay {...args} name="Warning" component={Warning} />
      </div>
    </div>
  );
};
AllIcons.args = {
  width: 25,
  height: 25,
  color: gray[600],
  extraCSS: {},
};
