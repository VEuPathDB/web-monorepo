import React, {useState} from 'react';
import MiniDiagram from "./MiniDiagram";
import ExpandedDiagram from "./ExpandedDiagram";

export default {
  title: 'Entity Diagram',
};

export const EntityDiagram = () => {
  const [orientation, setOrientation] = useState<string>('vertical')
  const [expanded, setExpanded] = useState<boolean>(true)

  const treeData = {
    name: 'C',
    children: [
      { name: 'S',
        children: [{ name: 'G' }, { name: 'IR' }, { name: 'P' }, { name: 'BM' }],
      },
      {
        name: 'AS'
      },
    ],
  };

  const expandedTreeData ={
    name: 'Collection',
    children: [
      { name: 'Sample',
        children: [
          { name: 'Genotype', shading: '1' },
          { name: 'Insecticide Resistance Assay', shading: '4'},
          { name: 'Pathogen Detection Assay Result', shading: '5'},
          { name: 'Blood Meal Host Identification Result', shading: '0'}
        ],
        shading: '1'
      },
      {
        name: 'Abundance Sample',
        shading: '2'
      },
    ],
    shading: '3'
  };

  return (
    <div style={{marginLeft: 40, marginTop: 40, width: 1000, height: 700, border: '1px black solid'}}>
      <button
        onClick={() =>
          orientation == 'horizontal'
            ? setOrientation('vertical')
            : setOrientation('horizontal')}
      >
        Switch Orientation
      </button>
      <button
        onClick={() =>
          expanded
            ? setExpanded(false)
            : setExpanded(true)}
      >
        Switch Size
      </button>

      {
        expanded
          ?
            <ExpandedDiagram
              treeData={expandedTreeData}
              orientation={orientation}
              highlightedEntityID={"Sample"}
            />
          :
            <MiniDiagram
              treeData={treeData}
              orientation={orientation}
              highlightedEntityID={"S"}
            />
      }
    </div>
  )
}