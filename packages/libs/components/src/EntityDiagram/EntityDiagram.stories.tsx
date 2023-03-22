import React, { useState } from 'react';
import EntityDiagram, {
  EntityCounts,
  EntityDiagramProps,
} from './EntityDiagram';
import { StudyData } from './EntityDiagram';
import { Meta, Story } from '@storybook/react';
import './diagram.css';

export default {
  title: 'Entity Diagram',
  component: EntityDiagram,
} as Meta;

const rootEntity: StudyData = {
  id: 'GEMS_House',
  displayName: 'Household',
  description: 'Households from the study area',
  children: [
    {
      id: 'GEMS_HouseObs',
      displayName: 'Household Observation',
      description: '',
      children: [],
      isManyToOneWithParent: true,
      variables: [
        {
          id: 'var-19',
          providerLabel: '_watersupply',
          displayName: 'Water supply',
          type: 'string',
          isMultiValued: false,
        },
      ],
    },
    {
      id: 'GEMS_Part',
      displayName: 'Participant',
      description: 'Participants in the study',
      children: [
        {
          id: 'GEMS_PartObs',
          displayName: 'Participant Observation',
          description: '',
          children: [
            {
              id: 'GEMS_Sample',
              displayName: 'Sample',
              description: '',
              children: [],
              variables: [],
            },
            {
              id: 'GEMS_Treat',
              displayName: 'Treatment',
              description: '',
              children: [],
              variables: [],
            },
          ],
          variables: [
            {
              id: 'var-12',
              providerLabel: '_weight',
              displayName: 'Weight',
              type: 'number',
              isContinuous: true,
              precision: 2,
              units: 'pounds',
              isMultiValued: true,
            },
            {
              id: 'var-13',
              providerLabel: '_favnumber',
              displayName: 'Favorite number',
              type: 'number',
              isContinuous: false,
              precision: 0,
              units: '',
              isMultiValued: false,
            },
            {
              id: 'var-14',
              providerLabel: '_startdate',
              displayName: 'Start date',
              type: 'date',
              isContinuous: false,
              isMultiValued: false,
            },
            {
              id: 'var-15',
              providerLabel: '_visitdate',
              displayName: 'Visit date',
              type: 'number',
              isContinuous: false,
              precision: 0,
              isMultiValued: false,
            },
            {
              id: 'var-16',
              providerLabel: '_mood',
              displayName: 'Mood',
              type: 'string',
              isMultiValued: false,
            },
          ],
        },
      ],
      variables: [
        {
          id: 'var-10',
          providerLabel: '_networth',
          displayName: 'Net worth',
          type: 'number',
          isContinuous: true,
          precision: 2,
          units: 'dollars',
          isMultiValued: true,
        },
        {
          id: 'var-11',
          providerLabel: '_shoesize',
          displayName: 'Shoe size',
          type: 'number',
          isContinuous: true,
          precision: 1,
          units: 'shoe size',
          isMultiValued: true,
        },
        {
          id: 'var-17',
          providerLabel: '_haircolor',
          displayName: 'Hair color',
          type: 'string',
          isMultiValued: false,
        },
        {
          id: 'var-20',
          providerLabel: '_name',
          displayName: 'Name',
          type: 'string',
          isMultiValued: false,
        },
      ],
    },
  ],
  variables: [
    {
      id: 'var-18',
      providerLabel: '_address',
      displayName: 'City',
      type: 'string',
      isMultiValued: false,
    },
  ],
};

const studyData = {
  id: 'DS12385',
  rootEntity: rootEntity,
};

const entityCounts: EntityCounts = {
  GEMS_House: {
    total: 100,
    filtered: 5,
  },
  GEMS_HouseObs: {
    total: 100,
    filtered: 2,
  },
  GEMS_Part: {
    total: 100,
    filtered: 41,
  },
  GEMS_PartObs: {
    total: 100,
    filtered: 66,
  },
  GEMS_Treat: {
    total: 100,
    filtered: 100,
  },
  GEMS_Sample: {
    total: 100,
    filtered: 30,
  },
};

const miniSize = { height: 300, width: 150 };
const expandedSize = { height: 500, width: 600 };
const miniDivSize = { height: miniSize.height + 3, width: miniSize.width + 3 };
const expandedDivSize = {
  height: expandedSize.height + 2,
  width: expandedSize.width + 2,
};

export const EntityDiagramUnified = () => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'vertical'
  );
  const [expanded, setExpanded] = useState<boolean>(false);
  const size = expanded ? expandedSize : miniSize;
  const divSize = expanded ? expandedDivSize : miniDivSize;

  return (
    <div
      style={{
        marginLeft: 40,
        marginTop: 40,
        width: 1000,
        height: 700,
      }}
    >
      <button
        onClick={() =>
          orientation == 'horizontal'
            ? setOrientation('vertical')
            : setOrientation('horizontal')
        }
      >
        Switch Orientation
      </button>
      <button
        onClick={() => (expanded ? setExpanded(false) : setExpanded(true))}
      >
        Switch Size
      </button>
      <div style={{ ...divSize, border: '1px solid', padding: '1px' }}>
        <EntityDiagram
          treeData={studyData.rootEntity}
          orientation={orientation}
          isExpanded={expanded}
          highlightedEntityID={'Sample'}
          entityCounts={entityCounts}
          size={size}
          selectedBorderWeight={1}
          selectedHighlightColor="yellow"
          selectedHighlightWeight={3}
          selectedTextBold={false}
        />
      </div>
    </div>
  );
};

const Template: Story<
  EntityDiagramProps & { width: number; height: number }
> = ({ width, height, ...args }) => (
  <EntityDiagram {...args} size={{ width: width, height: height }} />
);

export const EntityDiagramControls = Template.bind({});
EntityDiagramControls.args = {
  width: miniSize.width,
  height: miniSize.height,
  orientation: 'vertical',
  isExpanded: false,
  selectedBorderWeight: 1,
  selectedHighlightColor: 'rgba(60, 120, 216, 1)',
  selectedHighlightWeight: 3,
  selectedTextBold: true,
  shadowDx: 2,
  shadowDy: 2,
  shadowDispersion: 0.2,
  shadowOpacity: 0.3,
  highlightedEntityID: 'Sample',
  shadingColor: '#e4c8c8',
  entityCounts: entityCounts,
  treeData: studyData.rootEntity,
  fontSize: 12,
  miniNodeWidth: 35,
  miniNodeHeight: 20,
  expandedNodeWidth: 120,
  expandedNodeHeight: 40,
};
EntityDiagramControls.argTypes = {
  orientation: {
    control: {
      type: 'radio',
      options: ['vertical', 'horizontal'],
    },
  },
  shadingColor: {
    control: 'color',
  },
  selectedHighlightColor: {
    control: 'color',
    table: {
      category: 'selected node style',
    },
  },
  selectedBorderWeight: {
    control: { type: 'number', min: 0, step: 1 },
    table: {
      category: 'selected node style',
    },
  },
  selectedHighlightWeight: {
    control: { type: 'number', min: 0, step: 1 },
    table: {
      category: 'selected node style',
    },
  },
  selectedTextBold: {
    table: {
      category: 'selected node style',
    },
  },
  shadowDx: {
    control: { type: 'number', min: 0, step: 1 },
    table: {
      category: 'drop shadow',
    },
  },
  shadowDy: {
    control: { type: 'number', min: 0, step: 1 },
    table: {
      category: 'drop shadow',
    },
  },
  shadowDispersion: {
    control: { type: 'number', min: 0, step: 0.1 },
    table: {
      category: 'drop shadow',
    },
  },
  shadowOpacity: {
    control: { type: 'number', min: 0, max: 1, step: 0.1 },
    table: {
      category: 'drop shadow',
    },
  },
  width: {
    control: { type: 'number', min: 0, step: 50 },
  },
  height: {
    control: { type: 'number', min: 0, step: 50 },
  },
  miniNodeWidth: {
    table: {
      category: 'mini',
    },
  },
  miniNodeHeight: {
    table: {
      category: 'mini',
    },
  },
  expandedNodeWidth: {
    table: {
      category: 'expanded',
    },
  },
  expandedNodeHeight: {
    table: {
      category: 'expanded',
    },
  },
};
