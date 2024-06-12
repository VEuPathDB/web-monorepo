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
import MultiSelection from '../../components/plotControls/MultiSelection';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

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

export const SimpleWithControl: Story<TemplateProps> = () => {
  // list of node labels
  const labels = SimpleWithControlData.nodes
    .flatMap((node) => {
      return node.label != null ? node.label : undefined;
    })
    .filter((data) => data != null);

  // all values are selected as default
  const [selectedNodeLabels, setSelectedNodeLabels] =
    useState<(string | undefined)[]>(labels);
  // show/hide node labels button
  const [showNodeLabels, setShowNodeLabels] = useState<boolean>(false);

  const ref = useRef<any>(null);

  // custom switch based on MUI
  const AntSwitch = withStyles((theme: Theme) =>
    createStyles({
      root: {
        width: 28,
        height: 16,
        padding: 0,
        display: 'flex',
      },
      switchBase: {
        padding: 2,
        color: theme.palette.grey[500],
        '&$checked': {
          transform: 'translateX(12px)',
          color: theme.palette.common.white,
          '& + $track': {
            opacity: 1,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
          },
        },
      },
      thumb: {
        width: 12,
        height: 12,
        boxShadow: 'none',
      },
      track: {
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.common.white,
      },
      checked: {},
    })
  )(Switch);

  return (
    <>
      <NetworkPlot
        containerStyles={{ width: DEFAULT_PLOT_SIZE }}
        selectedNodeLabels={selectedNodeLabels}
        showNodeLabels={showNodeLabels}
        nodes={SimpleWithControlData.nodes}
        links={SimpleWithControlData.links}
        ref={ref}
      />
      {/* node label control */}
      <div style={{ display: 'flex', marginLeft: '2em' }}>
        <div>
          <FormGroup>
            <div
              style={{
                color: 'black',
                fontSize: '1em',
                fontWeight: 600,
                marginBottom: '0.25em',
              }}
            >
              Node Labels
            </div>
            <Typography component="div">
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>Hide</Grid>
                <Grid item>
                  <AntSwitch
                    checked={showNodeLabels}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setShowNodeLabels(event.target.checked);
                    }}
                  />
                </Grid>
                <Grid item>Show</Grid>
              </Grid>
            </Typography>
          </FormGroup>
        </div>
        <div style={{ marginTop: '-0.25em', marginLeft: '1em' }}>
          <MultiSelection
            labels={labels}
            setSelectedNodeLabels={setSelectedNodeLabels}
            showNodeLabels={showNodeLabels}
          />
        </div>
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
