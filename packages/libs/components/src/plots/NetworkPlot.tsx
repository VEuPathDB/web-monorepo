import { LinkData, NodeData, NodeMenuAction } from '../types/plots/network';
import { isNumber, orderBy } from 'lodash';
import { NodeWithLabel } from './Node';
import { Link } from './Link';
import { Graph } from '@visx/network';
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
  SVGAttributes,
} from 'react';
import Spinner from '../components/Spinner';
import { ToImgopts } from 'plotly.js';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { ExportPlotToImageButton } from './ExportPlotToImageButton';
import { plotToImage } from './visxVEuPathDB';
import { GlyphTriangle } from '@visx/visx';
import { Option as NodeLabelProp } from '../components/plotControls/MultiSelect';

import './NetworkPlot.css';

export interface NetworkPlotProps {
  /** Network nodes */
  nodes: NodeData[] | undefined;
  /** Network links */
  links: LinkData[] | undefined;
  /** styling for the plot's container */
  containerStyles?: CSSProperties;
  /** Network-specific styling for the svg itself. These
   * properties will override any adaptation the network may try to do based on the container styles.
   */
  svgStyleOverrides?: SVGAttributes<SVGElement>;
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
  /** Labels, notes, and other annotations to add to the network */
  annotations?: ReactNode[];
  /** visible node labels */
  visibleNodeLabels?: NodeLabelProp[];
}

const DEFAULT_PLOT_WIDTH = 500;
const DEFAULT_PLOT_HEIGHT = 500;

const emptyNodes: NodeData[] = [...Array(9).keys()].map((item, index) => ({
  id: item.toString(),
  color: gray[100],
  stroke: gray[300],
  x: 230 + 200 * Math.cos(2 * Math.PI * (index / 9)),
  y: 230 + 200 * Math.sin(2 * Math.PI * (index / 9)),
}));
const emptyLinks: LinkData[] = [];

// The Network component draws a network of nodes and links.
// If no x,y coordinates are provided for nodes in the network, the nodes will
// be drawn with a default circular layout.
function NetworkPlot(props: NetworkPlotProps, ref: Ref<HTMLDivElement>) {
  const {
    nodes = emptyNodes,
    links = emptyLinks,
    containerStyles,
    svgStyleOverrides,
    containerClass = 'web-components-plot',
    showSpinner = false,
    labelTruncationLength = 20,
    emptyNetworkContent,
    annotations,
    visibleNodeLabels,
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

  const plotRect = plotRef.current?.getBoundingClientRect();
  const imageHeight = plotRect?.height;
  const imageWidth = plotRect?.width;

  // Set up styles for the network and incorporate overrides
  const svgStyles = {
    width:
      containerStyles?.width && isNumber(containerStyles?.width)
        ? containerStyles.width
        : DEFAULT_PLOT_WIDTH,
    height:
      containerStyles?.height && isNumber(containerStyles?.height)
        ? containerStyles.height
        : DEFAULT_PLOT_HEIGHT,
    ...svgStyleOverrides,
  };

  // Link processing.
  // Assign coordinates to links based on the newly created node coordinates.
  // Additionally order links so that the highlighted ones get drawn on top (are at the end of the array).
  const processedLinks = useMemo(
    () =>
      // Put highlighted links on top of gray links.
      orderBy(
        links.map((link) => {
          const sourceNode = nodes.find((node) => node.id === link.source.id);
          const targetNode = nodes.find((node) => node.id === link.target.id);
          return {
            ...link,
            source: {
              ...link.source,
              x: sourceNode?.x,
              y: sourceNode?.y,
            },
            target: {
              ...link.target,
              x: targetNode?.x,
              y: targetNode?.y,
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
        (link) => (link.color === '#eee' ? -1 : 1)
      ),
    [links, highlightedNodeId, nodes]
  );

  const activeNode = nodes.find((node) => node.id === activeNodeId);

  useEffect(() => {
    const element = document.querySelector('.network-plot-container');
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
              left: activeNode.x && activeNode.x,
              top: activeNode.y && activeNode.y + 12,
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
            {activeNode.actions.map((action) => (
              <div>
                {action.href ? (
                  <a
                    style={{
                      display: 'inline-block',
                      lineHeight: '1.25em',
                      padding: '0.5em 1em',
                    }}
                    href={action.href}
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    style={{
                      display: 'inline-block',
                      lineHeight: '1.25em',
                      padding: '0.5em 1em',
                    }}
                    onClick={action.onClick}
                    type="button"
                    className="link"
                  >
                    {action.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="network-plot-container" ref={plotRef}>
          {nodes.length > 0 ? (
            <svg {...svgStyles}>
              <Graph
                graph={{
                  nodes: nodes,
                  links: processedLinks,
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
                      {node.actions && node.actions?.length && (
                        <g className="net-hover-dropdown">
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
                        // pass showLabel as a prop for hover event
                        showLabel={
                          node.label != null &&
                          visibleNodeLabels?.some(
                            (el) => el.value === node.label
                          )
                        }
                      />
                    </>
                  );
                }}
              />
              {annotations &&
                annotations.map((annotation) => {
                  return annotation;
                })}
            </svg>
          ) : (
            emptyNetworkContent ?? <p>No nodes in the network</p>
          )}
          {showSpinner && <Spinner />}
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

export default forwardRef(NetworkPlot);
