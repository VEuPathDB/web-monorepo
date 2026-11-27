import { Gesture, HighlightOff, ViewList } from '@material-ui/icons';
import { IconButton, mapUi } from '../layout/ui';

interface Props {
  lassoActive: boolean;
  onToggleLasso: () => void;
  hasSelection: boolean;
  /** number of selected markers currently drawn */
  selectedMarkerCount: number;
  onClearSelection: () => void;
  isSelectionPanelOpen: boolean;
  onToggleSelectionPanel: () => void;
}

const modifierKey =
  typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') === 0
    ? '⌘'
    : 'Ctrl';

/**
 * Selection tools, floating at the top-left of the map. A one-line hint
 * explains the gestures instead of snackbars appearing after the fact.
 */
export function MapSelectionToolbar({
  lassoActive,
  onToggleLasso,
  hasSelection,
  selectedMarkerCount,
  onClearSelection,
  isSelectionPanelOpen,
  onToggleSelectionPanel,
}: Props) {
  const hint = lassoActive
    ? `Drag around markers to select them (hold ${modifierKey} to add). Esc to cancel.`
    : hasSelection
    ? `${modifierKey}-click to add or remove markers`
    : `Click a marker to see its records · ${modifierKey}-drag a box or use the lasso to select several`;

  return (
    <div
      css={{
        position: 'absolute',
        top: 10,
        left: 10,
        // leave room for the zoom and layer controls on the right
        right: 60,
        zIndex: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <div
        role="toolbar"
        aria-label="Selection tools"
        css={{
          display: 'flex',
          flexShrink: 0,
          gap: 2,
          padding: 3,
          background: 'white',
          borderRadius: mapUi.radius,
          boxShadow: mapUi.shadow,
          pointerEvents: 'auto',
        }}
      >
        <IconButton
          title={
            lassoActive
              ? 'Cancel lasso selection'
              : 'Lasso: draw around markers to select them'
          }
          label="Lasso"
          active={lassoActive}
          onClick={onToggleLasso}
        >
          <Gesture />
        </IconButton>
        <IconButton
          title="Clear the selection"
          label="Clear"
          disabled={!hasSelection}
          onClick={onClearSelection}
        >
          <HighlightOff />
        </IconButton>
        <IconButton
          title={
            isSelectionPanelOpen
              ? 'Hide the records panel'
              : 'Show the records of the selection (or of the visible area)'
          }
          label={
            hasSelection
              ? `Records${
                  selectedMarkerCount > 0 ? ` (${selectedMarkerCount})` : ''
                }`
              : 'Records'
          }
          active={isSelectionPanelOpen}
          onClick={onToggleSelectionPanel}
        >
          <ViewList />
        </IconButton>
      </div>
      <div
        css={{
          fontSize: 12,
          color: '#333',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: mapUi.radius,
          padding: '3px 8px',
          marginTop: 6,
          minWidth: 0,
          // one line; truncate (full text in the tooltip) on narrow maps
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={hint}
      >
        {hint}
      </div>
    </div>
  );
}
