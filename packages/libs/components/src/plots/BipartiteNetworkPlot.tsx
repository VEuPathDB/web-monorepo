import {
  BipartiteNetworkData,
  LinkData,
  NetworkPartition,
  NodeData,
} from '../types/plots/network';
import { partition } from 'lodash';
import { LabelPosition } from './Node';
import {
  CSSProperties,
  ReactNode,
  Ref,
  forwardRef,
  useRef,
  useMemo,
  SVGAttributes,
} from 'react';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { Text } from '@visx/text';

import './BipartiteNetworkPlot.css';
import NetworkPlot, { NodeMenuAction } from './NetworkPlot';

export interface BipartiteNetworkSVGStyles extends SVGAttributes<SVGElement> {
  topPadding?: number; // space between the top of the svg and the top-most node
  nodeSpacing?: number; // space between vertically adjacent nodes
  columnPadding?: number; // space between the left of the svg and the left column, also the right of the svg and the right column.
}

export interface BipartiteNetworkProps {
  /** Nodes */
  nodes: NodeData[] | undefined;
  /** Links */
  links: LinkData[] | undefined;
  /** Partitions. An array of NetworkPartitions (an array of node ids) that defines the two node groups */
  partitions: NetworkPartition[] | undefined;
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
  /** Additional error messaging to show when the network is empty */
  emptyNetworkContent?: ReactNode;
  /** Entries for the actions that appear in the menu when you click a node */
  getNodeMenuActions?: (nodeId: string) => NodeMenuAction[];
}

// Show a few gray nodes when there is no real data.
const EmptyBipartiteNetworkData: BipartiteNetworkData = {
  partitions: [
    { nodeIds: ['0', '1', '2', '3', '4', '5'], name: '' },
    { nodeIds: ['6', '7', '8'], name: '' },
  ],
  nodes: [...Array(9).keys()].map((item) => ({
    id: item.toString(),
    color: gray[100],
    stroke: gray[300],
    y: item < 6 ? 40 + 30 * item : 40 + 30 * (item - 6),
  })),
  links: [],
};

// The BipartiteNetworkPlot function takes a network w two partitions of nodes and draws those partitions as columns.
// This component handles the positioning of each column, and consequently the positioning of nodes and links.
function BipartiteNetworkPlot(
  props: BipartiteNetworkProps,
  ref: Ref<HTMLDivElement>
) {
  const {
    nodes = EmptyBipartiteNetworkData.nodes,
    links = EmptyBipartiteNetworkData.links,
    partitions = EmptyBipartiteNetworkData.partitions,
    containerStyles,
    svgStyleOverrides,
  } = props;

  // const [highlightedNodeId, setHighlightedNodeId] = useState<string>();
  // const [activeNodeId, setActiveNodeId] = useState<string>();

  // Use ref forwarding to enable screenshotting of the plot for thumbnail versions.
  const plotRef = useRef<HTMLDivElement>(null);

  // const toImage = useCallback(async (opts: ToImgopts) => {
  //   return plotToImage(plotRef.current, opts);
  // }, []);

  // useImperativeHandle<HTMLDivElement, any>(
  //   ref,
  //   () => ({
  //     // The thumbnail generator makePlotThumbnailUrl expects to call a toImage function
  //     toImage,
  //   }),
  //   [toImage]
  // );

  // Set up styles for the bipartite network and incorporate overrides
  const DEFAULT_TOP_PADDING = 40;
  const DEFAULT_NODE_SPACING = 30;
  const DEFAULT_SVG_WIDTH = 400;
  const svgStyles = {
    width: Number(containerStyles?.width) || DEFAULT_SVG_WIDTH,
    height:
      Math.max(partitions[1].nodeIds.length, partitions[0].nodeIds.length) *
        DEFAULT_NODE_SPACING +
      DEFAULT_TOP_PADDING,
    topPadding:
      partitions[0].name || partitions[1].name ? 60 : DEFAULT_TOP_PADDING,
    nodeSpacing: DEFAULT_NODE_SPACING,
    columnPadding: 100,
    ...svgStyleOverrides,
  };

  // So maybe we make partitionDetails = {name: string, position: number}.
  // that removes all but topPadding from svgStyleOverrides, which i'd like to
  // make just regular svg styles.
  // Alternatively, just set a decent topPadding that is 1 thing if a header
  // and another thing if not.
  const column1Position = svgStyles.columnPadding;
  const column2Position = Number(svgStyles.width) - svgStyles.columnPadding;

  // In order to assign coordinates to each node, we'll separate the
  // nodes based on their partition, then will use their order in the partition
  // (given by partitionXNodeIDs) to finally assign the coordinates.
  const nodesByPartition: NodeData[][] = useMemo(
    () =>
      partition(nodes, (node) => {
        return partitions[0].nodeIds.includes(node.id);
      }),
    [nodes, partitions]
  );

  const nodesByPartitionWithCoordinates = useMemo(
    () =>
      nodesByPartition.map((partition, partitionIndex) => {
        const partitionWithCoordinates = partition.map((node) => {
          // Find the index of the node in the partition
          const indexInPartition = partitions[partitionIndex].nodeIds.findIndex(
            (id) => id === node.id
          );

          return {
            // partitionIndex of 0 refers to the left-column nodes whereas 1 refers to right-column nodes
            x: partitionIndex === 0 ? column1Position : column2Position,
            y: svgStyles.topPadding + svgStyles.nodeSpacing * indexInPartition,
            labelPosition:
              partitionIndex === 0 ? 'left' : ('right' as LabelPosition),
            ...node,
          };
        });
        return partitionWithCoordinates;
      }),
    [
      column1Position,
      column2Position,
      partitions,
      nodesByPartition,
      svgStyles.nodeSpacing,
      svgStyles.topPadding,
    ]
  );

  // Create column labels if any exist
  const leftColumnLabel = partitions[0].name && (
    <Text
      x={column1Position}
      y={svgStyles.topPadding / 2}
      textAnchor="end"
      className="BipartiteNetworkPartitionTitle"
    >
      {partitions[0].name}
    </Text>
  );
  const rightColumnLabel = partitions[1].name && (
    <Text
      x={column2Position}
      y={svgStyles.topPadding / 2}
      textAnchor="start"
      className="BipartiteNetworkPartitionTitle"
    >
      {partitions[1].name}
    </Text>
  );

  // // Assign coordinates to links based on the newly created node coordinates
  // const linksWithCoordinates = useMemo(
  //   () =>
  //     // Put highlighted links on top of gray links.
  //     orderBy(
  //       links.map((link) => {
  //         const sourceNode = nodesByPartitionWithCoordinates[0].find(
  //           (node) => node.id === link.source.id
  //         );
  //         const targetNode = nodesByPartitionWithCoordinates[1].find(
  //           (node) => node.id === link.target.id
  //         );
  //         return {
  //           ...link,
  //           source: {
  //             x: sourceNode?.x,
  //             y: sourceNode?.y,
  //             ...link.source,
  //           },
  //           target: {
  //             x: targetNode?.x,
  //             y: targetNode?.y,
  //             ...link.target,
  //           },
  //           color:
  //             highlightedNodeId != null &&
  //             sourceNode?.id !== highlightedNodeId &&
  //             targetNode?.id !== highlightedNodeId
  //               ? '#eee'
  //               : link.color,
  //         };
  //       }),
  //       // Links that are added later will be on top.
  //       // If a link is grayed out, it will be sorted before other links.
  //       // In theory, it's possible to have a false positive here;
  //       // but that's okay, because the overlapping colors will be the same.
  //       (link) => (link.color === '#eee' ? -1 : 1)
  //     ),
  //   [data.links, highlightedNodeId, nodesByPartitionWithCoordinates]
  // );

  const plotRect = plotRef.current?.getBoundingClientRect();
  const imageHeight = plotRect?.height;
  const imageWidth = plotRect?.width;

  // const nodes = useMemo(
  //   () =>
  //     nodesByPartitionWithCoordinates[0]
  //       .concat(nodesByPartitionWithCoordinates[1])
  //       .map((node) => ({
  //         ...node,
  //         actions: getNodeActions?.(node.id),
  //       })),
  //   [getNodeActions, nodesByPartitionWithCoordinates]
  // );

  // const activeNode = nodes.find((node) => node.id === activeNodeId);

  // useEffect(() => {
  //   const element = document.querySelector('.bpnet-plot-container');
  //   if (element == null) return;

  //   element.addEventListener('click', handler);

  //   return () => {
  //     element.removeEventListener('click', handler);
  //   };

  //   function handler() {
  //     setActiveNodeId(undefined);
  //   }
  // }, [containerClass]);

  return (
    <NetworkPlot
      {...props}
      nodes={nodesByPartitionWithCoordinates[0].concat(
        nodesByPartitionWithCoordinates[1]
      )}
      links={links}
      annotations={[leftColumnLabel, rightColumnLabel]}
      svgStyleOverrides={svgStyles}
    />
  );

  // <>
  //   <div
  //     className={containerClass}
  //     style={{ width: '100%', ...containerStyles, position: 'relative' }}
  //   >
  //     {activeNode?.actions?.length && (
  //       <div
  //         style={{
  //           position: 'absolute',
  //           left: activeNode.x,
  //           top: activeNode.y + 12,
  //           transform:
  //             activeNode.labelPosition === 'left'
  //               ? `translate(calc(-2ch - ${
  //                   activeNode.label?.length ?? 0
  //                 }ch - 50%))`
  //               : `translate(calc(2ch + ${
  //                   activeNode.label?.length ?? 0 / 2
  //                 }ch - 50%))`,
  //           borderRadius: '4px',
  //           boxShadow:
  //             '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  //           background: 'white',
  //         }}
  //       >
  //         {activeNode.actions.map((action) => (
  //           <div>
  //             {action.href ? (
  //               <a
  //                 style={{
  //                   display: 'inline-block',
  //                   lineHeight: '1.25em',
  //                   padding: '0.5em 1em',
  //                 }}
  //                 href={action.href}
  //               >
  //                 {action.label}
  //               </a>
  //             ) : (
  //               <button
  //                 style={{
  //                   display: 'inline-block',
  //                   lineHeight: '1.25em',
  //                   padding: '0.5em 1em',
  //                 }}
  //                 onClick={action.onClick}
  //                 type="button"
  //                 className="link"
  //               >
  //                 {action.label}
  //               </button>
  //             )}
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //     <div
  //       className="bpnet-plot-container"
  //       ref={plotRef}
  //       style={{ width: '100%', height: '100%' }}
  //     >
  //       {nodesByPartitionWithCoordinates[0].length > 0 ? (
  //         <svg
  //           width={svgStyles.width}
  //           height={
  //             Math.max(
  //               data.partitions[1].nodeIds.length,
  //               data.partitions[0].nodeIds.length
  //             ) *
  //               svgStyles.nodeSpacing +
  //             svgStyles.topPadding
  //           }
  //         >
  //           {/* Draw names of node colums if they exist */}
  //           {partition1Name && (
  //             <Text
  //               x={column1Position}
  //               y={svgStyles.topPadding / 2}
  //               textAnchor="end"
  //               className="BipartiteNetworkPartitionTitle"
  //             >
  //               {partition1Name}
  //             </Text>
  //           )}
  //           {partition2Name && (
  //             <Text
  //               x={column2Position}
  //               y={svgStyles.topPadding / 2}
  //               textAnchor="start"
  //               className="BipartiteNetworkPartitionTitle"
  //             >
  //               {partition2Name}
  //             </Text>
  //           )}

  //           <Graph
  //             graph={{
  //               nodes,
  //               links: linksWithCoordinates,
  //             }}
  //             // Using our Link component so that it uses our nice defaults and
  //             // can better expand to handle more complex events (hover and such).
  //             linkComponent={({ link }) => {
  //               return <Link link={link} />;
  //             }}
  //             nodeComponent={({ node }) => {
  //               const isHighlighted = highlightedNodeId === node.id;
  //               const rectWidth =
  //                 (node.r ?? 6) * 2 + // node diameter
  //                 (node.label?.length ?? 0) * 6 + // label width
  //                 (12 + 6) + // button + space
  //                 (12 + 12 + 12); // paddingLeft + space-between-node-and-label + paddingRight
  //               const rectX =
  //                 node.labelPosition === 'left' ? -rectWidth + 12 : -12;
  //               const glyphLeft =
  //                 node.labelPosition === 'left' ? rectX + 12 : rectWidth - 24;
  //               return (
  //                 <>
  //                   {node.actions?.length && (
  //                     <g className="bpnet-hover-dropdown">
  //                       <rect
  //                         rx="2.5"
  //                         width={rectWidth}
  //                         height={24}
  //                         x={rectX}
  //                         y={-12}
  //                         strokeWidth={1}
  //                         fill="transparent"
  //                         stroke="gray"
  //                       />
  //                       <GlyphTriangle
  //                         left={glyphLeft}
  //                         size={36}
  //                         style={{
  //                           transform: 'rotate(180deg)',
  //                         }}
  //                       />
  //                       <rect
  //                         className="hover-trigger"
  //                         width={24}
  //                         height={24}
  //                         x={
  //                           node.labelPosition === 'left'
  //                             ? rectX
  //                             : rectX + rectWidth - 22
  //                         }
  //                         y={-12}
  //                         fill="transparent"
  //                         style={{
  //                           cursor: 'pointer',
  //                         }}
  //                         onClick={() => setActiveNodeId(node.id)}
  //                       />
  //                     </g>
  //                   )}
  //                   <NodeWithLabel
  //                     node={{
  //                       ...node,
  //                       strokeWidth: isHighlighted ? 3 : 1,
  //                     }}
  //                     labelPosition={node.labelPosition}
  //                     truncationLength={labelTruncationLength}
  //                     onClick={() => {
  //                       setHighlightedNodeId((id) =>
  //                         id === node.id ? undefined : node.id
  //                       );
  //                     }}
  //                     fontWeight={isHighlighted ? 600 : 400}
  //                   />
  //                 </>
  //               );
  //             }}
  //           />
  //         </svg>
  // ) : (
  //   emptyNetworkContent ?? <p>No nodes in the network</p>
  // )}
}

export default forwardRef(BipartiteNetworkPlot);
