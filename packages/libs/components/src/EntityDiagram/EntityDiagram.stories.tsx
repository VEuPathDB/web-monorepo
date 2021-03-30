import React, { useState } from 'react';
import EntityDiagram from './EntityDiagram';
import { StudyData, ShadingData } from './EntityDiagram';
import './diagram.css';

export default {
  title: 'Entity Diagram',
};

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

const shadingData: ShadingData = {
  GEMS_House: 0.05,
  GEMS_HouseObs: 0.2,
  GEMS_Part: 0.41,
  GEMS_PartObs: 0.66,
  GEMS_Treat: 0.98,
};

const miniSize = { height: 300, width: 150 };
const expandedSize = { height: 500, width: 600 };

export const EntityDiagramUnified = () => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'vertical'
  );
  const [expanded, setExpanded] = useState<boolean>(false);
  const size = expanded ? expandedSize : miniSize;

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
      <div style={{ ...size, border: '1px solid' }}>
        <EntityDiagram
          treeData={studyData.rootEntity}
          orientation={orientation}
          isExpanded={expanded}
          highlightedEntityID={'Sample'}
          shadingData={shadingData}
          size={size}
        />
      </div>
    </div>
  );
};
