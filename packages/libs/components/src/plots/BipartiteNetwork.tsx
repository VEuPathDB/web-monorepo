import { BipartiteNetworkData, NodeData } from '../types/plots/network';
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
  useCallback,
} from 'react';
import Spinner from '../components/Spinner';
import { ToImgopts } from 'plotly.js';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import './BipartiteNetwork.css';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';
import { plotToImage } from './visxVEuPathDB';

export interface BipartiteNetworkSVGStyles {
  width?: number; // svg width
  topPadding?: number; // space between the top of the svg and the top-most node
  nodeSpacing?: number; // space between vertically adjacent nodes
  columnPadding?: number; // space between the left of the svg and the left column, also the right of the svg and the right column.
}

export interface BipartiteNetworkProps {
  /** Bipartite network data */
  data: BipartiteNetworkData | undefined;
  /** Name of column 1 */
  column1Name?: string;
  /** Name of column 2 */
  column2Name?: string;
  /** styling for the plot's container */
  containerStyles?: CSSProperties;
  /** bipartite network-specific styling for the svg itself. These
   * properties will override any adaptation the network may try to do based on the container styles.
   */
  svgStyleOverrides?: BipartiteNetworkSVGStyles;
  /** container name */
  containerClass?: string;
  /** shall we show the loading spinner? */
  showSpinner?: boolean;
  /** Length of node label text before truncating with an ellipsis */
  labelTruncationLength?: number;
}

// Show a few gray nodes when there is no real data.
const EmptyBipartiteNetworkData: BipartiteNetworkData = {
  column1NodeIDs: ['0', '1', '2', '3', '4', '5'],
  column2NodeIDs: ['6', '7', '8'],
  nodes: [...Array(9).keys()].map((item) => ({
    id: item.toString(),
    color: gray[100],
    stroke: gray[300],
  })),
  links: [],
};

// The BipartiteNetwork function draws a two-column network using visx. This component handles
// the positioning of each column, and consequently the positioning of nodes and links.
function BipartiteNetwork(
  props: BipartiteNetworkProps,
  ref: Ref<HTMLDivElement>
) {
  const {
    data = EmptyBipartiteNetworkData,
    column1Name,
    column2Name,
    containerStyles,
    svgStyleOverrides,
    containerClass = 'web-components-plot',
    showSpinner = false,
    labelTruncationLength = 20,
  } = props;

  // Use ref forwarding to enable screenshotting of the plot for thumbnail versions.
  const plotRef = useRef<HTMLDivElement>(null);

  const toImage = useCallback(async (opts: ToImgopts) => {
    return plotToImage(plotRef.current, opts);
  }, []);

  useImperativeHandle<HTMLDivElement, any>(
    ref,
    () => ({
      // The thumbnail generator makePlotThumbnailUrl expects to call a toImage function
      toImage,
    }),
    [toImage]
  );

  // Set up styles for the bipartite network and incorporate overrides
  const svgStyles = {
    width: Number(containerStyles?.width) || 400,
    topPadding: 40,
    nodeSpacing: 30,
    columnPadding: 100,
    ...svgStyleOverrides,
  };

  const column1Position = svgStyles.columnPadding;
  const column2Position = svgStyles.width - svgStyles.columnPadding;

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
          x: columnIndex === 0 ? column1Position : column2Position,
          y: svgStyles.topPadding + svgStyles.nodeSpacing * indexInColumn,
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
      style={{ width: '100%', ...containerStyles, position: 'relative' }}
    >
      <div ref={plotRef} style={{ width: '100%', height: '100%' }}>
        <svg
          width={svgStyles.width}
          height={
            Math.max(data.column1NodeIDs.length, data.column2NodeIDs.length) *
              svgStyles.nodeSpacing +
            svgStyles.topPadding
          }
        >
          {/* Draw names of node colums if they exist */}
          {column1Name && (
            <Text
              x={column1Position}
              y={svgStyles.topPadding / 2}
              textAnchor="end"
              className="BipartiteNetworkColumnTitle"
            >
              {column1Name}
            </Text>
          )}
          {column2Name && (
            <Text
              x={column2Position}
              y={svgStyles.topPadding / 2}
              textAnchor="start"
              className="BipartiteNetworkColumnTitle"
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
                truncationLength: labelTruncationLength,
              };
              return <NodeWithLabel {...nodeWithLabelProps} />;
            }}
          />
        </svg>
        {showSpinner && <Spinner />}
      </div>
      <ExportPlotToImageButton toImage={toImage} filename="Network" />
    </div>
  );
}

export default forwardRef(BipartiteNetwork);
