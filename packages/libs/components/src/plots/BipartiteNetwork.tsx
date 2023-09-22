import { BipartiteNetworkData, NodeData } from '../types/plots/network';
import { partition } from 'lodash';
import { LabelPosition, Link, NodeWithLabel } from './Network';
import { Graph } from '@visx/network';

interface BipartiteNetworkProps {
  /** Bipartite network data */
  data: BipartiteNetworkData;
}

// NodeWithLabel draws one node and an optional label for the node. Both the node and
// label can be styled.
export function BipartiteNetwork(props: BipartiteNetworkProps) {
  const { data } = props;

  // BIPARTITE network should position nodes!!!

  // The backend can't do it because we eventually want to click nodes and have them reposition.
  const nodesByColumn: NodeData[][] = partition(data.nodes, (node) => {
    return data.column1NodeIDs.includes(node.id);
  });

  const nodesByColumnWithCoordinates = nodesByColumn.map(
    (column, columnIndex) => {
      const columnWithCoordinates = column.map((node) => {
        type ColumnName = keyof typeof data;
        const columnName = ('column' +
          (columnIndex + 1) +
          'NodeIDs') as ColumnName;
        const indexInColumn = data[columnName].findIndex(
          (id) => id === node.id
        );

        return {
          x: 90 + (columnIndex + 1) * 100,
          y: 30 + 30 * indexInColumn,
          labelPosition: columnIndex ? 'right' : ('left' as LabelPosition),
          ...node,
        };
      });
      return columnWithCoordinates;
    }
  );

  const links = data.links.map((link) => {
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
      color: link.color === 'positive' ? '#116699' : '#994411', //fake colors
    };
  });

  // also bpnet should set the label left/right appropriatey
  return (
    <svg
      width={400}
      height={
        Math.max(data.column1NodeIDs.length, data.column2NodeIDs.length) * 30 +
        50
      }
    >
      <Graph
        graph={{
          nodes: nodesByColumnWithCoordinates[0].concat(
            nodesByColumnWithCoordinates[1]
          ),
          links,
        }}
        // Our Link component has nice defaults and in the future can
        // carry more complex events.
        linkComponent={({ link }) => <Link link={link} />}
        // The node components are already transformed using x and y.
        // So inside the node component all coords should be relative to this
        // initial transform.
        nodeComponent={({ node }) => {
          const nodeWithLabelProps = {
            node: node,
            labelPosition: node.labelPosition,
          };
          return <NodeWithLabel {...nodeWithLabelProps} />;
        }}
      />
    </svg>
  );
}
