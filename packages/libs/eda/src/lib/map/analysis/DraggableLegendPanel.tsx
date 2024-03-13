import DraggablePanel, {
  DraggablePanelCoordinatePair,
} from '@veupathdb/coreui/lib/components/containers/DraggablePanel';
import { PanelConfig } from './appState';

export const DEFAULT_DRAGGABLE_LEGEND_POSITION = {
  x: window.innerWidth,
  y: 225,
};

export const DraggableLegendPanel = (props: {
  zIndex: number;
  panelTitle?: string;
  defaultPosition?: DraggablePanelCoordinatePair;
  onDragComplete?: (position: PanelConfig['position']) => void;
  children: React.ReactNode;
  headerButtons?: React.FC;
}) => (
  <DraggablePanel
    isOpen
    showPanelTitle
    panelTitle={props.panelTitle ?? 'Legend'}
    confineToParentContainer
    defaultPosition={props.defaultPosition ?? DEFAULT_DRAGGABLE_LEGEND_POSITION}
    onDragComplete={props.onDragComplete}
    styleOverrides={{
      zIndex: props.zIndex,
      // set minWidth for draggable panel
      minWidth: '120px',
    }}
    // HeaderButtons component for SAM Legend
    headerButtons={props.headerButtons}
  >
    {props.children}
  </DraggablePanel>
);
