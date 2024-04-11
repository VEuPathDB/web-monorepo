import { BipartiteNetworkData, NodeData } from '../types/plots/network';
import { orderBy, partition } from 'lodash';
import { LabelPosition, Link, NodeWithLabel } from './Network';
import { Graph } from '@visx/network';
import { Text } from '@visx/text';
import {
  CSSProperties,
  ReactNode,
  Ref,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import Spinner from '../components/Spinner';
import { ToImgopts } from 'plotly.js';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';
import { plotToImage } from './visxVEuPathDB';
import { Menu } from '@veupathdb/coreui/lib/components/inputs/Menu';
import { GlyphTriangle } from '@visx/visx';

import './BipartiteNetwork.css';

export interface BipartiteNetworkSVGStyles {
  width?: number; // svg width
  topPadding?: number; // space between the top of the svg and the top-most node
  nodeSpacing?: number; // space between vertically adjacent nodes
  columnPadding?: number; // space between the left of the svg and the left column, also the right of the svg and the right column.
}

export interface NodeMenuAction {
  label: ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface BipartiteNetworkProps {
  /** Bipartite network data */
  data: BipartiteNetworkData | undefined;
  /** Name of partition 1 */
  partition1Name?: string;
  /** Name of partition 2 */
  partition2Name?: string;
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
    { nodeIds: ['0', '1', '2', '3', '4', '5'] },
    { nodeIds: ['6', '7', '8'] },
  ],
  nodes: [...Array(9).keys()].map((item) => ({
    id: item.toString(),
    color: gray[100],
    stroke: gray[300],
  })),
  links: [],
};

// The BipartiteNetwork function takes a network w two partitions of nodes and draws those partitions as columns.
// This component handles the positioning of each column, and consequently the positioning of nodes and links.
function BipartiteNetwork(
  props: BipartiteNetworkProps,
  ref: Ref<HTMLDivElement>
) {
  const {
    data = EmptyBipartiteNetworkData,
    partition1Name,
    partition2Name,
    containerStyles,
    svgStyleOverrides,
    containerClass = 'web-components-plot',
    showSpinner = false,
    labelTruncationLength = 20,
    emptyNetworkContent,
    getNodeMenuActions: getNodeActions,
  } = props;

  const [highlightedNodeId, setHighlightedNodeId] = useState<string>();
  const [activeNodeId, setActiveNodeId] = useState<string>();

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
  // nodes based on their partition, then will use their order in the partition
  // (given by partitionXNodeIDs) to finally assign the coordinates.
  const nodesByPartition: NodeData[][] = useMemo(
    () =>
      partition(data.nodes, (node) => {
        return data.partitions[0].nodeIds.includes(node.id);
      }),
    [data.nodes, data.partitions]
  );

  const nodesByPartitionWithCoordinates = useMemo(
    () =>
      nodesByPartition.map((partition, partitionIndex) => {
        const partitionWithCoordinates = partition.map((node) => {
          // Find the index of the node in the partition
          const indexInPartition = data.partitions[
            partitionIndex
          ].nodeIds.findIndex((id) => id === node.id);

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
      data.partitions,
      nodesByPartition,
      svgStyles.nodeSpacing,
      svgStyles.topPadding,
    ]
  );

  // Assign coordinates to links based on the newly created node coordinates
  const linksWithCoordinates = useMemo(
    () =>
      // Put highlighted links on top of gray links.
      orderBy(
        data.links.map((link) => {
          const sourceNode = nodesByPartitionWithCoordinates[0].find(
            (node) => node.id === link.source.id
          );
          const targetNode = nodesByPartitionWithCoordinates[1].find(
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
            color:
              highlightedNodeId != null &&
              sourceNode?.id !== highlightedNodeId &&
              targetNode?.id !== highlightedNodeId
                ? '#eee'
                : link.color,
          };
        }),
        // Links that are added later will be on top.
        // If a link is grayed out, it will be sorted before other links.
        // In theory, it's possible to have a false positive here;
        // but that's okay, because the overlapping colors will be the same.
        (link) => (link.color === '#eee' ? 1 : -1)
      ),
    [data.links, highlightedNodeId, nodesByPartitionWithCoordinates]
  );

  const plotRect = plotRef.current?.getBoundingClientRect();
  const imageHeight = plotRect?.height;
  const imageWidth = plotRect?.width;

  const nodes = useMemo(
    () =>
      nodesByPartitionWithCoordinates[0]
        .concat(nodesByPartitionWithCoordinates[1])
        .map((node) => ({
          ...node,
          actions: getNodeActions?.(node.id),
        })),
    [getNodeActions, nodesByPartitionWithCoordinates]
  );

  const activeNode = nodes.find((node) => node.id === activeNodeId);

  useEffect(() => {
    const element = document.querySelector('.bpnet-plot-container');
    if (element == null) return;

    element.addEventListener('click', handler);

    return () => {
      element.removeEventListener('click', handler);
    };

    function handler() {
      setActiveNodeId(undefined);
    }
  }, [containerClass]);

  return (
    <>
      <div
        className={containerClass}
        style={{ width: '100%', ...containerStyles, position: 'relative' }}
      >
        {activeNode?.actions?.length && (
          <div
            style={{
              position: 'absolute',
              left: activeNode.x,
              top: activeNode.y + 12,
              transform:
                activeNode.labelPosition === 'left'
                  ? `translate(calc(-2ch - ${
                      activeNode.label?.length ?? 0
                    }ch - 50%))`
                  : `translate(calc(2ch + ${
                      activeNode.label?.length ?? 0 / 2
                    }ch - 50%))`,
              borderRadius: '4px',
              boxShadow:
                '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
              background: 'white',
            }}
          >
            <Menu
              items={activeNode.actions.map((nodeAction) => ({
                display: nodeAction.label,
                value: nodeAction,
              }))}
              onSelect={(action) => {
                if (action.href) {
                  window.location.assign(action.href);
                } else if (action.onClick) {
                  action.onClick();
                }
                setActiveNodeId(undefined);
              }}
            />
          </div>
        )}
        <div
          className="bpnet-plot-container"
          ref={plotRef}
          style={{ width: '100%', height: '100%' }}
        >
          {nodesByPartitionWithCoordinates[0].length > 0 ? (
            <svg
              width={svgStyles.width}
              height={
                Math.max(
                  data.partitions[1].nodeIds.length,
                  data.partitions[0].nodeIds.length
                ) *
                  svgStyles.nodeSpacing +
                svgStyles.topPadding
              }
            >
              {/* Draw names of node colums if they exist */}
              {partition1Name && (
                <Text
                  x={column1Position}
                  y={svgStyles.topPadding / 2}
                  textAnchor="end"
                  className="BipartiteNetworkPartitionTitle"
                >
                  {partition1Name}
                </Text>
              )}
              {partition2Name && (
                <Text
                  x={column2Position}
                  y={svgStyles.topPadding / 2}
                  textAnchor="start"
                  className="BipartiteNetworkPartitionTitle"
                >
                  {partition2Name}
                </Text>
              )}

              <Graph
                graph={{
                  nodes,
                  links: linksWithCoordinates,
                }}
                // Using our Link component so that it uses our nice defaults and
                // can better expand to handle more complex events (hover and such).
                linkComponent={({ link }) => {
                  return <Link link={link} />;
                }}
                nodeComponent={({ node }) => {
                  const isHighlighted = highlightedNodeId === node.id;
                  const rectWidth =
                    (node.r ?? 6) * 2 + // node diameter
                    (node.label?.length ?? 0) * 6 + // label width
                    (12 + 6) + // button + space
                    (12 + 12 + 12); // paddingLeft + space-between-node-and-label + paddingRight
                  const rectX =
                    node.labelPosition === 'left' ? -rectWidth + 12 : -12;
                  const glyphLeft =
                    node.labelPosition === 'left' ? rectX + 12 : rectWidth - 24;
                  return (
                    <>
                      {node.actions?.length && (
                        <g className="bpnet-hover-dropdown">
                          <rect
                            rx="2.5"
                            width={rectWidth}
                            height={24}
                            x={rectX}
                            y={-12}
                            strokeWidth={1}
                            fill="transparent"
                            stroke="gray"
                          />
                          <GlyphTriangle
                            left={glyphLeft}
                            size={36}
                            style={{
                              transform: 'rotate(180deg)',
                            }}
                          />
                          <rect
                            className="hover-trigger"
                            width={24}
                            height={24}
                            x={
                              node.labelPosition === 'left'
                                ? rectX
                                : rectX + rectWidth - 22
                            }
                            y={-12}
                            fill="transparent"
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => setActiveNodeId(node.id)}
                          />
                        </g>
                      )}
                      <NodeWithLabel
                        node={{
                          ...node,
                          strokeWidth: isHighlighted ? 3 : 1,
                        }}
                        labelPosition={node.labelPosition}
                        truncationLength={labelTruncationLength}
                        onClick={() => {
                          setHighlightedNodeId((id) =>
                            id === node.id ? undefined : node.id
                          );
                        }}
                        fontWeight={isHighlighted ? 600 : 400}
                      />
                    </>
                  );
                }}
              />
            </svg>
          ) : (
            emptyNetworkContent ?? <p>No nodes in the network</p>
          )}
          {
            // Note that the spinner shows up in the middle of the network. So when
            // the network is very long, the spinner will be further down the page than in other vizs.
            showSpinner && <Spinner />
          }
        </div>
      </div>
      <ExportPlotToImageButton
        toImage={toImage}
        imageHeight={imageHeight}
        imageWidth={imageWidth}
        filename="Network"
      />
    </>
  );
}

export default forwardRef(BipartiteNetwork);
