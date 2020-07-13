import React, { useEffect, useMemo, useRef } from 'react';

import cytoscape, { Core, CytoscapeOptions, EdgeDefinition, NodeDefinition } from 'cytoscape';
import { noop } from 'lodash';

import { GroupLayout } from '../../utils/groupLayout';

import './ClusterGraphCanvas.scss';

interface Props {
  layout: GroupLayout;
}

export function ClusterGraphCanvas({ layout }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core>();

  useInitializeCyEffect(canvasRef, cyRef, layout);

  return <div ref={canvasRef} className="ClusterGraphCanvas"></div>;
}

interface CyEffectCallback {
  (cy: Core): (void | (() => void | undefined));
};

function useInitializeCyEffect(
  canvasRef: React.RefObject<HTMLDivElement>,
  cyRef: React.MutableRefObject<Core | undefined>,
  layout: GroupLayout
) {
  const nodes = useNodes(layout);
  const edges = useEdges(layout);
  const style = useStyle();
  const options = useOptions();

  useEffect(() => {
    if (canvasRef.current != null) {
      const cy = cytoscape({
        container: canvasRef.current,
        elements: { nodes, edges },
        style,
        ...options
      });

      cyRef.current = cy;
    }

    return () => {
      if (cyRef.current != null) {
        cyRef.current.destroy();
      }
    };
  }, [ canvasRef.current, nodes, edges, style, options ]);
}

function useCyEffect(cyRef: React.MutableRefObject<Core>, effect: CyEffectCallback, deps?: React.DependencyList) {
  useEffect(() => {
    if (cyRef.current == null) {
      return noop;
    }

    return effect(cyRef.current);
  }, deps == null ? [ cyRef.current ] : [ cyRef.current, ...deps ]);
}

function useNodes(layout: GroupLayout): NodeDefinition[] {
  return useMemo(
    () =>
      Object.values(layout.nodes).map(nodeEntry =>
        ({
          group: 'nodes',
          data: { id: nodeEntry.id },
          position: { x: Number(nodeEntry.x), y: Number(nodeEntry.y) }
        }) as const
  ), [ layout.nodes ]);
}

function useEdges(layout: GroupLayout): EdgeDefinition[] {
  return useMemo(
    () =>
      Object.entries(layout.edges).map(([ edgeId, edgeEntry ]) =>
        ({
          group: 'edges',
          data: {
            id: edgeId,
            source: edgeEntry.queryId,
            target: edgeEntry.subjectId
          },
          selectable: false
        }) as const
  ), [ layout.edges ]);
}

function useStyle() {
  return useMemo(
    () => [],
    []
  );
}

function useOptions(): CytoscapeOptions {
  return useMemo(
    () => ({
      layout: { name: 'preset' },
      zoom: 1,
      zoomingEnabled: false,
      userZoomingEnabled: false,
      autolock: true,
      panningEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabbify: true,
      autounselectify: true,
      pixelRatio: window.devicePixelRatio
    }),
    []
  );
}
