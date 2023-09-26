import { BipartiteNetworkData, NodeData } from '../types/plots/network';
import { partition } from 'lodash';
import { LabelPosition, Link, NodeWithLabel } from './Network';
import { Graph } from '@visx/network';
import { Text } from '@visx/text';
import { CSSProperties } from 'react';
import { DEFAULT_CONTAINER_HEIGHT } from './PlotlyPlot';
import Spinner from '../components/Spinner';

export interface BipartiteNetworkProps {
  /** Bipartite network data */
  data: BipartiteNetworkData;
  /** Name of column 1 */
  column1Name?: string;
  /** Name of column 2 */
  column2Name?: string;
  /** styling for the plot's container */
  containerStyles?: CSSProperties;
  /** container name */
  containerClass?: string;
  /** shall we show the loading spinner? */
  showSpinner?: boolean;
  /** plot width */
  width?: number;
}

// The BipartiteNetwork function draws a two-column network using visx. This component handles
// the positioning of each column, and consequently the positioning of nodes and links.
export function BipartiteNetwork(props: BipartiteNetworkProps) {
  const {
    data,
    column1Name,
    column2Name,
    containerStyles = { width: '100%', height: DEFAULT_CONTAINER_HEIGHT },
    containerClass = 'web-components-plot',
    showSpinner = false,
    width,
  } = props;

  // Defaults
  // Many of the below can get optional props in the future as we figure out optimal layouts
  const DEFAULT_WIDTH = 400;
  const DEFAULT_NODE_VERTICAL_SPACE = 30;
  const DEFAULT_TOP_PADDING = 40;
  const DEFAULT_COLUMN1_X = 100;
  const DEFAULT_COLUMN2_X = (width ?? DEFAULT_WIDTH) - DEFAULT_COLUMN1_X;

  // In order to assign coordinates to each node, we'll separate the
  // nodes based on their column, then will use their order in the column
  // (given by columnXNodeIDs) to finally assign the coordinates.
  const nodesByColumn: NodeData[][] = partition(data.nodes, (node) => {
    return data.column1NodeIDs.includes(node.id);
  });

  const nodesByColumnWithCoordinates = nodesByColumn.map(
    (column, columnIndex) => {
      const columnWithCoordinates = column.map((node) => {
        // Find the index of the node in the column
        type ColumnName = keyof typeof data;
        const columnName = ('column' +
          (columnIndex + 1) +
          'NodeIDs') as ColumnName;
        const indexInColumn = data[columnName].findIndex(
          (id) => id === node.id
        );

        return {
          // columnIndex of 0 refers to the left-column nodes whereas 1 refers to right-column nodes
          x: columnIndex === 0 ? DEFAULT_COLUMN1_X : DEFAULT_COLUMN2_X,
          y: DEFAULT_TOP_PADDING + DEFAULT_NODE_VERTICAL_SPACE * indexInColumn,
          labelPosition:
            columnIndex === 0 ? 'left' : ('right' as LabelPosition),
          ...node,
        };
      });
      return columnWithCoordinates;
    }
  );

  // Assign coordinates to links based on the newly created node coordinates
  const linksWithCoordinates = data.links.map((link) => {
    const sourceNode = nodesByColumnWithCoordinates[0].find(
      (node) => node.id === link.source.id
    );
    const targetNode = nodesByColumnWithCoordinates[1].find(
      (node) => node.id === link.target.id
    );
    return {
      ...link,
      source: {
        x: sourceNode?.x,
        y: sourceNode?.y,
        ...link.source,
      },
      target: {
        x: targetNode?.x,
        y: targetNode?.y,
        ...link.target,
      },
    };
  });

  return (
    <div
      className={containerClass}
      style={{ ...containerStyles, position: 'relative' }}
    >
      <svg
        width={width ?? DEFAULT_WIDTH}
        height={
          Math.max(data.column1NodeIDs.length, data.column2NodeIDs.length) *
            DEFAULT_NODE_VERTICAL_SPACE +
          DEFAULT_TOP_PADDING
        }
      >
        {/* Draw names of node colums if they exist */}
        {column1Name && (
          <Text
            x={DEFAULT_COLUMN1_X}
            y={DEFAULT_TOP_PADDING / 2}
            textAnchor="end"
          >
            {column1Name}
          </Text>
        )}
        {column2Name && (
          <Text
            x={DEFAULT_COLUMN2_X}
            y={DEFAULT_TOP_PADDING / 2}
            textAnchor="start"
          >
            {column2Name}
          </Text>
        )}

        <Graph
          graph={{
            nodes: nodesByColumnWithCoordinates[0].concat(
              nodesByColumnWithCoordinates[1]
            ),
            links: linksWithCoordinates,
          }}
          // Using our Link component so that it uses our nice defaults and
          // can better expand to handle more complex events (hover and such).
          linkComponent={({ link }) => <Link link={link} />}
          nodeComponent={({ node }) => {
            const nodeWithLabelProps = {
              node: node,
              labelPosition: node.labelPosition,
            };
            return <NodeWithLabel {...nodeWithLabelProps} />;
          }}
        />
      </svg>
      {showSpinner && <Spinner />}
    </div>
  );
}
