import { ReactNode, useState } from 'react';
import { Tooltip } from '@material-ui/core';
import {
  ExpandLess,
  ExpandMore,
  Tune,
  Visibility,
  VisibilityOff,
} from '@material-ui/icons';
import { IconButton, mapUi, usePrimaryColor } from './ui';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** opens the map settings, where the legend's variable is chosen */
  onEdit?: () => void;
  /** are the markers currently hidden (by this button or the H key)? */
  markersHidden: boolean;
  /** the "peek" button is being held (true) or was released (false) */
  onHoldToHideMarkers: (held: boolean) => void;
}

/**
 * The legend, pinned to the bottom-left corner of the map (where people
 * look for it), collapsible rather than draggable so it can't get lost.
 */
export function LegendCard({
  title,
  subtitle,
  children,
  onEdit,
  markersHidden,
  onHoldToHideMarkers,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div
      css={{
        position: 'absolute',
        left: 10,
        bottom: 28,
        zIndex: 2,
        maxWidth: 320,
        // stay clear of the selection toolbar at the top of the map, but
        // never shrink below the header row (so it can always be expanded)
        maxHeight: 'max(40px, calc(100% - 90px))',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.96)',
        borderRadius: mapUi.radius,
        boxShadow: mapUi.shadow,
        fontSize: 13,
      }}
    >
      <div
        css={{
          display: 'flex',
          flexShrink: 0,
          alignItems: 'center',
          gap: 4,
          padding: '4px 4px 4px 10px',
          borderBottom: expanded ? '1px solid #eee' : 'none',
        }}
      >
        <div css={{ flex: 1, minWidth: 0 }}>
          <div
            css={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div css={{ fontSize: 11, color: mapUi.muted }}>{subtitle}</div>
          )}
        </div>
        <PeekButton
          markersHidden={markersHidden}
          onHold={onHoldToHideMarkers}
        />
        {onEdit && (
          <IconButton title="Change marker settings" onClick={onEdit}>
            <Tune />
          </IconButton>
        )}
        <IconButton
          title={expanded ? 'Collapse legend' : 'Expand legend'}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </div>
      {expanded && (
        <div css={{ padding: '6px 10px', overflow: 'auto' }}>{children}</div>
      )}
    </div>
  );
}

/**
 * Hides the markers only while held (mouse, touch, or Space/Enter when
 * focused), so the map underneath can be seen. The H key does the same
 * (see useHoldKey); the tooltip says so, which is how the shortcut is
 * documented. Nothing is ever left hidden: every way of letting go - or of
 * losing the pointer or focus - shows the markers again.
 */
function PeekButton({
  markersHidden,
  onHold,
}: {
  markersHidden: boolean;
  onHold: (held: boolean) => void;
}) {
  const primary = usePrimaryColor();
  const release = () => onHold(false);
  return (
    <Tooltip title="Hide markers while held (or hold H)" placement="top">
      <button
        type="button"
        aria-label="Hide markers while held (or hold H)"
        aria-pressed={markersHidden}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          onHold(true);
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        // a touch long-press would otherwise open the context menu
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
            event.preventDefault();
            onHold(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') release();
        }}
        onBlur={release}
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: mapUi.radius,
          padding: '4px 8px',
          background: markersHidden ? primary : 'transparent',
          color: markersHidden ? 'white' : 'inherit',
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
          '&:hover': {
            background: markersHidden ? primary : mapUi.hoverBackground,
          },
          '&:focus-visible': { outline: `2px solid ${primary}` },
          svg: { fontSize: 20 },
        }}
      >
        {markersHidden ? <VisibilityOff /> : <Visibility />}
      </button>
    </Tooltip>
  );
}
