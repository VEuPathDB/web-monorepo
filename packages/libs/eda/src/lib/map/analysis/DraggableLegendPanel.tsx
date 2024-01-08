import DraggablePanel, {
  DraggablePanelCoordinatePair,
} from '@veupathdb/coreui/lib/components/containers/DraggablePanel';

export const DraggableLegendPanel = (props: {
  zIndex: number;
  panelTitle?: string;
  defaultPosition?: DraggablePanelCoordinatePair;
  children: React.ReactNode;
}) => (
  <DraggablePanel
    isOpen
    showPanelTitle
    panelTitle={props.panelTitle ?? 'Legend'}
    confineToParentContainer
    defaultPosition={props.defaultPosition ?? { x: window.innerWidth, y: 225 }}
    styleOverrides={{
      zIndex: props.zIndex,
      // set minWidth for draggable panel
      minWidth: '120px',
    }}
  >
    {props.children}
  </DraggablePanel>
);
