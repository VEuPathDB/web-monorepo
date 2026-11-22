import {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Popover } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { Filter, StudyEntity } from '../../../core';
import FilterChipList from '../../../core/components/FilterChipList';
import { VariableLinkConfig } from '../../../core/components/VariableLink';
import { EntityCounts } from '../../../core/hooks/entityCounts';
import { makeEntityDisplayName } from '../../../core/utils/study-metadata';
import { formatTimeWindowLabel } from '../utils/timeWindowLabel';
import { timelineLayout, visibleChipCount } from './filterBarLayout';
import { mapUi, TextButton, usePrimaryColor } from './ui';
import { useLatestDefined } from './useLatestDefined';
import { filterBarHelpSections, FilterBarHelpKey } from './filterBarHelp';
import { FilterBarHelp, HelpPin } from './FilterBarHelp';

const { format } = new Intl.NumberFormat();

/** space between chips (FilterChipList's own margin) */
const CHIP_GAP = 8;
const BAR_HEIGHT = 40;
/** the row's gap */
const ROW_GAP = 12;
/** the pink time-window tag's widest */
const TAG_MAX_WIDTH = 130;

/** what the filter bar hands to the timeline it hosts */
export interface TimelineSlotProps {
  width: number;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  /** open the bar's help panel */
  onShowHelp: () => void;
}

interface Props {
  filters: Filter[];
  studyEntities: StudyEntity[];
  /** the location entity: its counts summarise the subset */
  geoEntity: StudyEntity;
  totalCounts?: EntityCounts;
  filteredCounts?: EntityCounts;
  /** the filtered count is being (re)fetched */
  countPending: boolean;
  /** what the filtered count includes (see mapCountTooltip) */
  countTooltip: string;
  onRemoveFilter: (filter: Filter) => void;
  /** open the filter sheet, optionally on a particular variable */
  onOpenFilters: (variable?: { entityId: string; variableId: string }) => void;
  selectedVariable?: { entityId?: string; variableId?: string };
  /** the timeline window narrowing the count; shows the pink tag */
  timeWindow?: { start: string; end: string };
  /** the timeline; no space is kept for it when omitted */
  renderTimeline?: (props: TimelineSlotProps) => ReactNode;
  /** the variable on the markers, when markers can be drawn (for the help) */
  markerVariableName?: string;
}

/** the dashed "+N more" button (also rendered off-screen to measure it) */
const MoreButton = forwardRef<
  HTMLButtonElement,
  { onClick: () => void; children: ReactNode; 'data-more-measure'?: boolean }
>(function MoreButton({ onClick, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      {...rest}
      css={{
        flexShrink: 0,
        whiteSpace: 'nowrap',
        border: '1px dashed #9bb3c9',
        borderRadius: 12,
        padding: '2px 10px',
        background: 'white',
        color: '#1b5e8c',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
});

/** a thin vertical rule between the bar's groups */
function Divider() {
  return (
    <div
      css={{
        flexShrink: 0,
        alignSelf: 'stretch',
        width: 1,
        margin: '6px 0',
        background: '#e0e0e0',
      }}
    />
  );
}

/**
 * The subset, always visible, in one fixed-height row (so adding a filter
 * never resizes the map): a button to add filters and the filter chips
 * (extra ones fold into "+N more"), the timeline, how much data is on the
 * map, and a help button for the whole bar.
 */
export function MapFilterBar({
  filters,
  studyEntities,
  geoEntity,
  totalCounts,
  filteredCounts,
  countPending,
  countTooltip,
  onRemoveFilter,
  onOpenFilters,
  selectedVariable,
  timeWindow,
  renderTimeline,
  markerVariableName,
}: Props) {
  const primary = usePrimaryColor();
  const total = totalCounts?.[geoEntity.id];
  // while the count is refetched, keep showing the last one (faded) so the
  // count keeps its width and the chips beside it don't refold
  const filtered = useLatestDefined(filteredCounts?.[geoEntity.id]);
  const entityName = makeEntityDisplayName(geoEntity, (total ?? 0) !== 1);

  const barRef = useRef<HTMLDivElement>(null);
  const barWidth = useElementWidth(barRef);
  const layout = timelineLayout(barWidth);
  const showTimeline = renderTimeline != null && barWidth > 0;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // pop-overs (and pins) anchored in one row must not float on after a
  // re-layout
  useEffect(() => {
    setSettingsOpen(false);
    setHelpOpen(false);
  }, [layout.placement]);

  const helpSections = filterBarHelpSections({
    entityName,
    showTimeline,
    windowApplies: timeWindow != null,
    markerVariableName,
  });
  const pin = (key: FilterBarHelpKey) =>
    helpOpen ? (
      <HelpPin number={helpSections.find((s) => s.key === key)?.number} />
    ) : null;

  // on phones the tag shares the timeline's row: the group gets the rest
  const tagRef = useRef<HTMLButtonElement>(null);
  const tagWidth = useElementWidth(
    tagRef,
    `${timeWindow != null}:${layout.placement}`
  );

  // chip folding: measure every chip off-screen, show as many as fit
  const chipsRef = useRef<HTMLDivElement>(null);
  const chipsWidth = useElementWidth(chipsRef);
  const measureRef = useRef<HTMLDivElement>(null);
  const measureWidth = useElementWidth(measureRef);
  const [chipWidths, setChipWidths] = useState<number[]>([]);
  const [moreWidth, setMoreWidth] = useState(0);
  useLayoutEffect(() => {
    const measure = measureRef.current;
    if (measure == null) return;
    const spans = Array.from(
      measure.querySelectorAll<HTMLElement>('[data-chip-measure]')
    );
    const widths = spans.map((span) => span.getBoundingClientRect().width);
    setChipWidths((previous) =>
      previous.length === widths.length &&
      previous.every((width, i) => width === widths[i])
        ? previous
        : widths
    );
    const more = measure.querySelector<HTMLElement>('[data-more-measure]');
    setMoreWidth(more?.getBoundingClientRect().width ?? 0);
  }, [filters, studyEntities, selectedVariable, measureWidth]);

  const visibleCount =
    chipWidths.length === filters.length
      ? visibleChipCount(chipWidths, chipsWidth, moreWidth, CHIP_GAP)
      : filters.length;
  const hiddenCount = chipWidths
    .slice(visibleCount)
    .filter((width) => width > 0).length;

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => {
    if (hiddenCount === 0) setMoreOpen(false);
  }, [hiddenCount]);

  const variableLinkConfig: VariableLinkConfig = {
    type: 'button',
    onClick(value) {
      setMoreOpen(false);
      if (value?.entityId && value.variableId)
        onOpenFilters({
          entityId: value.entityId,
          variableId: value.variableId,
        });
      else onOpenFilters();
    },
  };
  const chipListProps = {
    removeFilter: onRemoveFilter,
    variableLinkConfig,
    entities: studyEntities,
    selectedEntityId: selectedVariable?.entityId,
    selectedVariableId: selectedVariable?.variableId,
  };

  const timelineSlotProps: TimelineSlotProps = {
    width: layout.width,
    settingsOpen,
    onSettingsOpenChange: setSettingsOpen,
    onShowHelp: () => setHelpOpen(true),
  };

  const tag = timeWindow && (
    <button
      ref={tagRef}
      type="button"
      title={`Timeline window: ${timeWindow.start} to ${timeWindow.end}`}
      onClick={() => setSettingsOpen(true)}
      css={{
        flexShrink: 0,
        maxWidth: TAG_MAX_WIDTH,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        border: 'none',
        borderRadius: 9,
        padding: '1px 7px',
        background: '#fde2e8',
        color: '#8a2846',
        fontSize: 11,
        lineHeight: '16px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {formatTimeWindowLabel(timeWindow)}
    </button>
  );

  const count = (
    <span
      title={countTooltip}
      css={{
        position: 'relative',
        flexShrink: 0,
        fontSize: 14,
        color: mapUi.muted,
        whiteSpace: 'nowrap',
      }}
    >
      <span css={{ opacity: countPending ? 0.5 : 1 }}>
        {filtered != null && total != null ? (
          <>
            <strong css={{ color: '#222' }}>{format(filtered)}</strong> of{' '}
            {format(total)} {entityName}
          </>
        ) : (
          '…'
        )}
      </span>
      {pin('count')}
    </span>
  );

  const helpButton = (
    <button
      ref={helpButtonRef}
      type="button"
      title="How this bar works"
      aria-label="How this bar works"
      aria-expanded={helpOpen}
      onClick={() => setHelpOpen(!helpOpen)}
      css={{
        flexShrink: 0,
        boxSizing: 'border-box',
        width: 26,
        height: 26,
        borderRadius: '50%',
        border: `1px solid ${primary}`,
        padding: 0,
        background: helpOpen ? '#e8eef4' : 'white',
        color: primary,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        cursor: 'pointer',
        '&:hover': { background: '#e8eef4' },
        '&:focus-visible': { outline: `2px solid ${primary}` },
      }}
    >
      ?
    </button>
  );

  return (
    <div
      ref={barRef}
      css={{
        position: 'relative',
        padding: '0 16px',
        background: '#fafafa',
        borderBottom: mapUi.border,
        flexShrink: 0,
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: ROW_GAP,
          height: BAR_HEIGHT,
        }}
      >
        <span css={{ position: 'relative', flexShrink: 0 }}>
          <TextButton
            onClick={() => onOpenFilters()}
            title="Add or edit filters"
          >
            <span
              css={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <FilterList style={{ fontSize: 16 }} /> Filters
              {filters.length > 0 ? ` (${filters.length})` : ''}
            </span>
          </TextButton>
          {pin('filters')}
        </span>
        <div
          ref={chipsRef}
          css={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: CHIP_GAP,
            overflow: 'hidden',
          }}
        >
          {filters.length > 0 ? (
            <>
              {visibleCount > 0 && (
                <div css={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <FilterChipList
                    filters={filters.slice(0, visibleCount)}
                    {...chipListProps}
                  />
                </div>
              )}
              {hiddenCount > 0 && (
                <MoreButton
                  ref={moreButtonRef}
                  onClick={() => setMoreOpen(true)}
                >
                  +{hiddenCount} more ▾
                </MoreButton>
              )}
            </>
          ) : (
            <span css={{ color: mapUi.muted, fontSize: 13 }}>
              {/* the timeline window is not "all data"; its tag says so */}
              {timeWindow ? 'No filters' : 'No filters: showing all data'}
            </span>
          )}
        </div>
        {showTimeline && layout.placement === 'inline' && (
          <>
            <Divider />
            {tag}
            <div
              css={{
                position: 'relative',
                flexShrink: 0,
                width: layout.width,
              }}
            >
              {renderTimeline(timelineSlotProps)}
              {pin('timeline')}
            </div>
          </>
        )}
        <Divider />
        {count}
        <Divider />
        {helpButton}
      </div>
      {showTimeline && layout.placement === 'below' && (
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 6,
          }}
        >
          {tag}
          <div css={{ position: 'relative', flexShrink: 0 }}>
            {renderTimeline({
              ...timelineSlotProps,
              width: Math.max(layout.width - (tag ? tagWidth + 8 : 0), 0),
            })}
            {pin('timeline')}
          </div>
        </div>
      )}

      {/* off-screen copy of every chip, for measuring */}
      <div
        ref={measureRef}
        aria-hidden
        css={{
          position: 'absolute',
          left: 0,
          top: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          display: 'flex',
        }}
      >
        {filters.map((filter, i) => (
          <span key={i} data-chip-measure css={{ display: 'inline-block' }}>
            <FilterChipList filters={[filter]} {...chipListProps} />
          </span>
        ))}
        <MoreButton data-more-measure onClick={() => {}}>
          +{filters.length} more ▾
        </MoreButton>
      </div>

      <Popover
        open={moreOpen && hiddenCount > 0}
        anchorEl={moreButtonRef.current}
        onClose={() => setMoreOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <div css={{ padding: 12, maxWidth: 420, '& > div': { rowGap: 8 } }}>
          <FilterChipList filters={filters} {...chipListProps} />
        </div>
      </Popover>

      <FilterBarHelp
        open={helpOpen}
        anchorEl={helpButtonRef.current}
        onClose={() => setHelpOpen(false)}
        sections={helpSections}
        entityName={entityName}
        windowApplies={timeWindow != null}
        markerVariableName={markerVariableName}
        onOpenFilters={() => onOpenFilters()}
      />
    </div>
  );
}

/**
 * an element's (border-box) width, kept up to date with a ResizeObserver;
 * change `mountKey` when the element may have been mounted or replaced
 */
function useElementWidth(
  ref: RefObject<HTMLElement>,
  mountKey?: string
): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (element == null) {
      setWidth(0);
      return;
    }
    setWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(() =>
      setWidth(element.getBoundingClientRect().width)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, mountKey]);
  return width;
}
