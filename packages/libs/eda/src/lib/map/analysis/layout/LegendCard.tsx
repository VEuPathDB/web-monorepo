import { ReactNode, useState } from 'react';
import { ExpandLess, ExpandMore, Tune } from '@material-ui/icons';
import { IconButton, mapUi } from './ui';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** opens the map settings, where the legend's variable is chosen */
  onEdit?: () => void;
}

/**
 * The legend, pinned to the bottom-left corner of the map (where people
 * look for it), collapsible rather than draggable so it can't get lost.
 */
export function LegendCard({ title, subtitle, children, onEdit }: Props) {
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
