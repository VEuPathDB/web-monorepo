import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NodeData,
  LinkData,
  NetworkPlotData,
  NodeMenuAction,
} from '../../types/plots/network';
import NetworkPlot, { NetworkPlotProps } from '../../plots/NetworkPlot';
import { Text } from '@visx/text';
import { useEffect, useRef, useState } from 'react';
import MultiSelect, {
  Option as NodeLabelProp,
} from '../../components/plotControls/MultiSelect';
import LabelledGroup from '../../components/widgets/LabelledGroup';
import { Undo as UndoIcon } from '@veupathdb/coreui/lib/components/icons';

export default {
  title: 'Plots/Networks/NetworkPlot',
  component: NetworkPlot,
} as Meta;

// For simplicity, make square svgs with the following height and width
const DEFAULT_PLOT_SIZE = 500;

interface TemplateProps extends NetworkPlotProps {
  showThumbnail?: boolean;
}

// Showcase our NetworkPlot component.
const Template: Story<TemplateProps> = (args) => {
  // Generate a jpeg version of the network (svg).
  // Mimicks the makePlotThumbnailUrl process in web-eda.
  const ref = useRef<any>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    setTimeout(() => {
      ref.current
        ?.toImage({
          format: 'jpeg',
          height: DEFAULT_PLOT_SIZE,
          width: DEFAULT_PLOT_SIZE,
        })
        .then((src: string) => setImg(src));
    }, 2000);
  }, []);

  return (
    <>
      <NetworkPlot
        containerStyles={{ width: DEFAULT_PLOT_SIZE }}
        {...args}
        ref={ref}
      />
      {args.showThumbnail && (
        <>
          <br></br>
          <h3>A snapshot of the plot will appear below after two sconds...</h3>
          <img src={img} alt="Network snapshot" />
        </>
      )}
    </>
  );
};

/**
 * Stories
 */

// A simple network with node labels
const simpleData = genNetwork(
  20,
  true,
  true,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);
export const Simple = Template.bind({});
Simple.args = {
  ...simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genNetwork(
  100,
  false,
  true,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  ...manyPointsData,
};

// A network with annotations.
// These can be used to add column labels in the bipartite network, call out
// a specific node of interest, or just generally add some more info.
const annotation1 = (
  <Text x={30} y={50} fontWeight={600} fill={'orange'}>
    I am an annotation
  </Text>
);
const annotation2 = (
  <Text x={300} y={50} fontWeight={600} fill={'blue'}>
    I am another annotation
  </Text>
);
export const WithAnnotations = Template.bind({});
WithAnnotations.args = {
  ...simpleData,
  annotations: [annotation1, annotation2],
};

// An empty network.
// This is what will be shown by default before we receive any data
export const Empty = Template.bind({});
Empty.args = {
  nodes: undefined,
  links: undefined,
};

// Loading
export const Loading = Template.bind({});
Loading.args = {
  ...simpleData,
  showSpinner: true,
};

// Pass an empty network with no nodes
const emptyNetworkContent = (
  <Text x={100} y={100}>
    No nodes or links. Try something else.
  </Text>
);
export const NoNodes = Template.bind({});
NoNodes.args = {
  nodes: [],
  links: [],
  emptyNetworkContent,
};

// Show thumbnail
export const Thumbnail = Template.bind({});
Thumbnail.args = {
  ...simpleData,
  showThumbnail: true,
};

// Test node actions
function getNodeActions(nodeId: string): NodeMenuAction[] {
  return [
    {
      label: 'Click me!!',
      onClick() {
        alert('You clicked node ' + nodeId);
      },
    },
    {
      label: 'Click me, too!!',
      onClick() {
        alert('You clicked node ' + nodeId);
      },
    },
  ];
}

const simpleWithActions = simpleData;
simpleWithActions.nodes = simpleData.nodes.map((node) => ({
  ...node,
  actions: getNodeActions(node.id),
}));

export const WithActions = Template.bind({});
WithActions.args = {
  ...simpleWithActions,
  getNodeMenuActions: getNodeActions,
};

// with node label control
const SimpleWithControlData = genNetwork(
  20,
  true,
  true,
  DEFAULT_PLOT_SIZE,
  DEFAULT_PLOT_SIZE
);

// node label control
export const NodeLabelControl: Story<TemplateProps> = () => {
  // list of node labels
  const nodeLabels = SimpleWithControlData.nodes.flatMap((node) => {
    return { value: node.label, label: node.label };
  });

  // all values are selected as default
  const [visibleNodeLabels, setVisibleNodeLabels] =
    useState<NodeLabelProp[]>(nodeLabels);

  const handleChange = (selected: NodeLabelProp[]) => {
    setVisibleNodeLabels(selected);
  };

  const ref = useRef<any>(null);

  return (
    <>
      <NetworkPlot
        containerStyles={{ width: DEFAULT_PLOT_SIZE }}
        visibleNodeLabels={visibleNodeLabels}
        nodes={SimpleWithControlData.nodes}
        links={SimpleWithControlData.links}
        ref={ref}
      />
      <div style={{ marginLeft: '1em', width: '800px' }}>
        <LabelledGroup
          label={
            <div css={{ display: 'flex', alignItems: 'center' }}>
              Network controls
              <button
                style={{
                  padding: 0,
                  marginLeft: '0.5em',
                  border: 'none',
                  background: 'none',
                }}
                onClick={(e) => setVisibleNodeLabels(nodeLabels)}
              >
                <UndoIcon fill="blue" />
              </button>
            </div>
          }
        >
          <h6 style={{ marginTop: '1em' }}>Visible Node Labels</h6>
          <MultiSelect
            key="network_multi_select_labels"
            options={nodeLabels}
            onChange={handleChange}
            value={visibleNodeLabels}
            isSelectAll={true}
            menuPlacement={'bottom'}
          />
        </LabelledGroup>
      </div>
    </>
  );
};

// Utility functions
// Gerenate a network with a given number of nodes and random edges
function genNetwork(
  nNodes: number,
  addNodeLabel: boolean,
  addNodeCoordinates: boolean,
  height: number,
  width: number
) {
  // Create nodes with random positioning, an id, and optionally a label
  const nodes: NodeData[] = [...Array(nNodes).keys()].map((i) => {
    // Postion nodes randomly across the plot, but add some padding to prevent the nodes
    // from getting cut off at the edges.
    const nodeX = 10 + Math.floor(Math.random() * (width - 20)); // Range: [10, width - 10]
    const nodeY = 10 + Math.floor(Math.random() * (height - 20)); // Range: [10, height - 10]
    return {
      x: addNodeCoordinates ? nodeX : undefined,
      y: addNodeCoordinates ? nodeY : undefined,
      id: String(i),
      label: addNodeLabel ? 'Node ' + String(i) : undefined,
      labelPosition: addNodeLabel
        ? nodeX > width / 2
          ? 'left'
          : 'right'
        : undefined,
    };
  });

  // Create {nNodes} links. Just basic links no weighting or colors for now.
  const links: LinkData[] = [...Array(nNodes).keys()].map(() => {
    return {
      source: nodes[Math.floor(Math.random() * nNodes)],
      target: nodes[Math.floor(Math.random() * nNodes)],
    };
  });

  return { nodes, links } as NetworkPlotData;
}
