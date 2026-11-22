import { CSSProperties, ReactNode } from 'react';
import { Popover } from '@material-ui/core';
import {
  countHelpText,
  FilterBarHelpKey,
  FilterBarHelpSection,
} from './filterBarHelp';
import { mapUi, PanelHeader, usePrimaryColor } from './ui';

const PIN_SIZE = 16;

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  sections: FilterBarHelpSection[];
  /** plural location entity, e.g. "Regions" */
  entityName: string;
  windowApplies: boolean;
  markerVariableName?: string;
  /** open the filter sheet */
  onOpenFilters: () => void;
}

/**
 * The filter bar's help panel: one numbered section per part of the bar
 * (matching the pins shown on the bar while it's open).
 */
export function FilterBarHelp({
  open,
  anchorEl,
  onClose,
  sections,
  entityName,
  windowApplies,
  markerVariableName,
  onOpenFilters,
}: Props) {
  const primary = usePrimaryColor();

  const linkCss = {
    border: 'none',
    padding: 0,
    background: 'none',
    color: primary,
    font: 'inherit',
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const content: Record<FilterBarHelpKey, { title: string; body: ReactNode }> =
    {
      filters: {
        title: 'Filters',
        body: (
          <>
            Narrow the data to what you're interested in.{' '}
            <button
              type="button"
              css={linkCss}
              onClick={() => {
                onClose();
                onOpenFilters();
              }}
            >
              Add or edit filters
            </button>
            ; click a chip to change it, ✕ to remove it. They're saved with your
            analysis and apply everywhere.
          </>
        ),
      },
      timeline: {
        title: 'Timeline',
        body: (
          <>
            Black bars show when there's data. Drag a window to show only that
            time; click outside it to clear. It's temporary and map-only. ‹ ›
            step the window by its length; the sliders button changes the date
            variable, sets exact dates or turns it off.
          </>
        ),
      },
      count: {
        title: 'Count',
        body: countHelpText({ entityName, windowApplies, markerVariableName }),
      },
    };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <div css={{ width: 460 }}>
        <PanelHeader title="How this bar works" onClose={onClose} />
        <ol
          css={{
            listStyle: 'none',
            margin: 0,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {sections.map(({ key, number }) => (
            <li key={key} css={{ display: 'flex', gap: 10 }}>
              <HelpNumber number={number} style={{ marginTop: 1 }} />
              <div>
                <div css={{ fontWeight: 600, marginBottom: 2 }}>
                  {content[key].title}
                </div>
                <div css={{ color: mapUi.muted }}>{content[key].body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Popover>
  );
}

/** a small numbered circle in the primary colour */
function HelpNumber({
  number,
  style,
}: {
  number: number;
  style?: CSSProperties;
}) {
  const primary = usePrimaryColor();
  return (
    <span
      style={style}
      css={{
        flexShrink: 0,
        boxSizing: 'border-box',
        width: PIN_SIZE,
        height: PIN_SIZE,
        borderRadius: '50%',
        background: primary,
        color: 'white',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: `${PIN_SIZE}px`,
        textAlign: 'center',
      }}
    >
      {number}
    </span>
  );
}

/**
 * A numbered pin over part of the bar while the help panel is open. It is
 * absolutely positioned (its parent must be `position: relative`), so it
 * takes no space and nothing reflows.
 */
export function HelpPin({ number }: { number?: number }) {
  if (number == null) return null;
  return (
    <span
      aria-hidden
      css={{
        position: 'absolute',
        top: -7,
        right: -9,
        zIndex: 1,
        pointerEvents: 'none',
        display: 'flex',
        boxShadow: '0 0 0 2px white',
        borderRadius: '50%',
      }}
    >
      <HelpNumber number={number} />
    </span>
  );
}
