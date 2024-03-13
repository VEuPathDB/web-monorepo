import DraggablePanel, {
  DraggablePanelCoordinatePair,
} from '@veupathdb/coreui/lib/components/containers/DraggablePanel';

export const DraggableLegendPanel = (props: {
  zIndex: number;
  panelTitle?: string;
  defaultPosition?: DraggablePanelCoordinatePair;
  children: React.ReactNode;
  headerButtons?: React.FC;
}) => (
  <DraggablePanel
    isOpen
    showPanelTitle
    panelTitle={props.panelTitle ?? 'Legend'}
    confineToParentContainer
    defaultPosition={props.defaultPosition ?? { x: window.innerWidth, y: 250 }}
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
