import {
  BipartiteNetworkData,
  LinkData,
  NodeData,
} from '../types/plots/network';
import { partition } from 'lodash';
import { LabelPosition, Link, NodeWithLabel } from './Network';
import { Graph } from '@visx/network';
import { Text } from '@visx/text';
import {
  CSSProperties,
  Ref,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { DEFAULT_CONTAINER_HEIGHT } from './PlotlyPlot';
import Spinner from '../components/Spinner';
import { twoColorPalette } from '../types/plots/addOns';
import { ToImgopts } from 'plotly.js';
import domToImage from 'dom-to-image';

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
}

// The BipartiteNetwork function draws a two-column network using visx. This component handles
// the positioning of each column, and consequently the positioning of nodes and links.
function BipartiteNetwork(
  props: BipartiteNetworkProps,
  ref: Ref<HTMLDivElement>
) {
  const {
    data,
    column1Name,
    column2Name,
    containerStyles = { width: '100%', height: DEFAULT_CONTAINER_HEIGHT },
    containerClass = 'web-components-plot',
    showSpinner = false,
  } = props;

  // Defaults
  const DEFAULT_COLUMN1_X = 100;
  const DEFAULT_COLUMN2_X = 300;
  const DEFAULT_NODE_VERTICAL_SPACE = 30;
  const DEFAULT_TOP_PADDING = 40;

  // Use ref forwarding to enable screenshotting of the plot for thumbnail versions.
  const plotRef = useRef<HTMLDivElement>(null);
  useImperativeHandle<HTMLDivElement, any>(
    ref,
    () => ({
      // The thumbnail generator makePlotThumbnailUrl expects to call a toImage function
      toImage: async (imageOpts: ToImgopts) => {
        if (!plotRef.current) throw new Error('Plot not ready');
        return domToImage.toPng(plotRef.current, imageOpts);
      },
    }),
    []
  );

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
          x: columnIndex ? DEFAULT_COLUMN2_X : DEFAULT_COLUMN1_X,
          y: DEFAULT_TOP_PADDING + DEFAULT_NODE_VERTICAL_SPACE * indexInColumn,
          labelPosition: columnIndex ? 'right' : ('left' as LabelPosition),
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
      <div ref={plotRef} style={{ width: '100%', height: '100%' }}>
        <svg
          width={400}
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
    </div>
  );
}

export default forwardRef(BipartiteNetwork);
