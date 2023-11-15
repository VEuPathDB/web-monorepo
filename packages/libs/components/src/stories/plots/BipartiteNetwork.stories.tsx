import { useState, useEffect, useRef, CSSProperties } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NodeData,
  LinkData,
  BipartiteNetworkData,
} from '../../types/plots/network';
import BipartiteNetwork, {
  BipartiteNetworkProps,
  BipartiteNetworkSVGStyles,
} from '../../plots/BipartiteNetwork';
import { twoColorPalette } from '../../types/plots/addOns';

export default {
  title: 'Plots/Network/BipartiteNetwork',
  component: BipartiteNetwork,
} as Meta;

interface TemplateProps {
  data: BipartiteNetworkData;
  column1Name?: string;
  column2Name?: string;
  loading?: boolean;
  showThumbnail?: boolean;
  containerStyles?: CSSProperties;
  svgStyleOverrides?: BipartiteNetworkSVGStyles;
}

// Template for showcasing our BipartiteNetwork component.
const Template: Story<TemplateProps> = (args) => {
  // Generate a jpeg version of the network (svg).
  // Mimicks the makePlotThumbnailUrl process in web-eda.
  const ref = useRef<any>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    setTimeout(() => {
      ref.current
        ?.toImage({ format: 'jpeg', height: 400, width: 600 })
        .then((src: string) => setImg(src));
    }, 2000);
  }, []);

  const bipartiteNetworkProps: BipartiteNetworkProps = {
    data: args.data,
    column1Name: args.column1Name,
    column2Name: args.column2Name,
    showSpinner: args.loading,
    containerStyles: args.containerStyles,
    svgStyleOverrides: args.svgStyleOverrides,
  };
  return (
    <>
      <BipartiteNetwork ref={ref} {...bipartiteNetworkProps} />
      {args.showThumbnail && (
        <>
          <br></br>
          <h3>A snapshot of the plot will appear below after two sconds...</h3>
          <img src={img} />
        </>
      )}
    </>
  );
};

/**
 * Stories
 */

// A basic bipartite network
const simpleData = genBipartiteNetwork(20, 10);
export const Simple = Template.bind({});
Simple.args = {
  data: simpleData,
};

// A network with lots and lots of points!
const manyPointsData = genBipartiteNetwork(1000, 100);
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: manyPointsData,
};

// With column names
export const WithColumnNames = Template.bind({});
WithColumnNames.args = {
  data: simpleData,
  column1Name: 'Column 1',
  column2Name: 'Column 2',
};

// Loading with a spinner
export const Loading = Template.bind({});
Loading.args = {
  data: simpleData,
  column1Name: 'Column 1',
  column2Name: 'Column 2',
  loading: true,
};

// Empty bipartite network
export const Empty = Template.bind({});
Empty.args = {
  data: undefined,
};

// Show thumbnail
export const Thumbnail = Template.bind({});
Thumbnail.args = {
  data: genBipartiteNetwork(10, 10),
  column1Name: 'Column 1',
  column2Name: 'Column 2',
  showThumbnail: true,
};

// With style
const plotContainerStyles = {
  width: 700,
  marginLeft: '0.75rem',
  border: '1px solid #dedede',
  boxShadow: '1px 1px 4px #00000066',
};
const svgStyleOverrides = {
  columnPadding: 150,
  topPadding: 100,
};
export const WithStyle = Template.bind({});
WithStyle.args = {
  data: manyPointsData,
  containerStyles: plotContainerStyles,
  column1Name: 'Column 1',
  column2Name: 'Column 2',
  svgStyleOverrides: svgStyleOverrides,
};

// Gerenate a bipartite network with a given number of nodes and random edges
function genBipartiteNetwork(
  column1nNodes: number,
  column2nNodes: number
): BipartiteNetworkData {
  // Create the first column of nodes
  const column1Nodes: NodeData[] = [...Array(column1nNodes).keys()].map((i) => {
    return {
      id: String(i),
      label: 'Node ' + String(i),
    };
  });

  // Create the second column of nodes
  const column2Nodes: NodeData[] = [...Array(column2nNodes).keys()].map((i) => {
    return {
      id: String(i + column1nNodes),
      label: 'Node ' + String(i + column1nNodes),
    };
  });

  // Create links
  // Not worried about exactly how many edges we're adding just yet since this is
  // used for stories only. Adding color here to mimic what the visualization
  // will do.
  const links: LinkData[] = [...Array(column1nNodes * 2).keys()].map(() => {
    return {
      source: column1Nodes[Math.floor(Math.random() * column1nNodes)],
      target: column2Nodes[Math.floor(Math.random() * column2nNodes)],
      strokeWidth: Math.random() * 2,
      color: Math.random() > 0.5 ? twoColorPalette[0] : twoColorPalette[1],
    };
  });

  const nodes = column1Nodes.concat(column2Nodes);
  const column1NodeIDs = column1Nodes.map((node) => node.id);
  const column2NodeIDs = column2Nodes.map((node) => node.id);

  return {
    nodes,
    links,
    column1NodeIDs,
    column2NodeIDs,
  };
}
