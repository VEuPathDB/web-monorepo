import { ReactNode, useCallback, useMemo } from 'react';
import { Toggle } from '@veupathdb/coreui';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';
import { AppState } from './appState';
import { timeSliderVariableConstraints } from './config/eztimeslider';
import { mapUi, PanelHeader } from './layout/ui';

type TimeSliderConfig = NonNullable<AppState['timeSliderConfig']>;

interface Props {
  entities: StudyEntity[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  config: TimeSliderConfig;
  updateConfig: (config: TimeSliderConfig) => void;
  /** the timeline's full date range (the step arrows stay within it) */
  extendedDisplayRange: { start: string; end: string } | undefined;
  onClose: () => void;
}

/**
 * The timeline's settings, shown in a pop-over from the filter bar: the date
 * variable, the window's exact dates, step arrows and the on/off switch.
 */
export function TimelineSettings({
  entities,
  starredVariables,
  toggleStarredVariable,
  config,
  updateConfig,
  extendedDisplayRange,
  onClose,
}: Props) {
  const { variable, active, selectedRange } = config;

  function handleVariableChange(selection: VariablesByInputName) {
    if (!selection.overlayVariable) {
      console.error(
        `Expected overlayVariable to be defined but got ${typeof selection.overlayVariable}`
      );
      return;
    }
    updateConfig({
      variable: selection.overlayVariable,
      selectedRange: undefined,
      active: true,
    });
  }

  const handleAxisRangeChange = useCallback(
    (newRange?: NumberOrDateRange) => {
      if (newRange)
        updateConfig({
          ...config,
          selectedRange: {
            start: newRange.min as string,
            end: newRange.max as string,
          },
        });
    },
    [config, updateConfig]
  );

  const handleArrowClick = useCallback(
    (arrow: 'left' | 'right') => {
      if (selectedRange != null)
        updateConfig({
          ...config,
          selectedRange: newArrowRange(selectedRange, arrow),
        });
    },
    [config, updateConfig, selectedRange]
  );

  // can the window step a whole window-length without leaving the range?
  const { disableLeftArrow, disableRightArrow } = useMemo(() => {
    if (extendedDisplayRange == null || selectedRange == null)
      return { disableLeftArrow: false, disableRightArrow: false };
    const diff =
      new Date(selectedRange.end).getTime() -
      new Date(selectedRange.start).getTime();
    const expectedStart = new Date(
      new Date(selectedRange.start).getTime() - diff
    )
      .toISOString()
      .split('T')[0];
    const expectedEnd = new Date(new Date(selectedRange.end).getTime() + diff)
      .toISOString()
      .split('T')[0];
    return {
      disableLeftArrow:
        new Date(expectedStart).getTime() <
        new Date(extendedDisplayRange.start).getTime(),
      disableRightArrow:
        new Date(expectedEnd).getTime() >
        new Date(extendedDisplayRange.end).getTime(),
    };
  }, [extendedDisplayRange, selectedRange]);

  return (
    <div css={{ width: 440 }}>
      <PanelHeader title="Timeline" onClose={onClose} />
      <div
        css={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontSize: 13,
        }}
      >
        <Row label="Date">
          <InputVariables
            inputs={[
              {
                name: 'overlayVariable',
                label: '',
                noTitle: true,
                isNonNullable: true,
              },
            ]}
            entities={entities}
            selectedVariables={{ overlayVariable: variable }}
            onChange={handleVariableChange}
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
            constraints={timeSliderVariableConstraints}
          />
        </Row>
        <Row label="Window">
          <AxisRangeControl
            range={
              selectedRange != null
                ? { min: selectedRange.start, max: selectedRange.end }
                : undefined
            }
            onRangeChange={handleAxisRangeChange}
            valueType="date"
            inputHeight={30}
            disabled={!active}
          />
        </Row>
        <Row label="Step">
          <ArrowButton
            direction="left"
            disabled={!active || selectedRange == null || disableLeftArrow}
            onClick={() => handleArrowClick('left')}
          />
          <ArrowButton
            direction="right"
            disabled={!active || selectedRange == null || disableRightArrow}
            onClick={() => handleArrowClick('right')}
          />
          <span css={{ color: mapUi.muted, fontSize: 12 }}>
            by the window's length
          </span>
        </Row>
        <Row label="Apply">
          <Toggle
            label={active ? 'On' : 'Off'}
            labelPosition="right"
            value={!!active}
            onChange={(active) => updateConfig({ ...config, active })}
          />
        </Row>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div css={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span css={{ width: 60, flexShrink: 0, color: mapUi.muted }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={`move range ${direction}`}
      onClick={onClick}
      disabled={disabled}
    >
      <i
        className={`fa fa-arrow-${direction}`}
        aria-hidden="true"
        style={{ color: disabled ? 'lightgray' : 'black' }}
      />
    </button>
  );
}

/** step a `YYYY-MM-DD` range by its own length, keeping leap days in step */
export function newArrowRange(
  selectedRange: { start: string; end: string },
  arrow: 'left' | 'right'
): { start: string; end: string } {
  const diff =
    new Date(selectedRange.end).getTime() -
    new Date(selectedRange.start).getTime();
  const diffSign = arrow === 'right' ? diff : -diff;

  const newSelectedRange = {
    start: new Date(new Date(selectedRange.start).getTime() + diffSign)
      .toISOString()
      .split('T')[0],
    end: new Date(new Date(selectedRange.end).getTime() + diffSign)
      .toISOString()
      .split('T')[0],
  };

  // unit in milliseconds
  const deltaLeapDaysMS =
    (countLeapDays(newSelectedRange) - countLeapDays(selectedRange)) *
    (1000 * 3600 * 24);

  return {
    start: new Date(
      new Date(newSelectedRange.start).getTime() -
        (arrow === 'left' ? deltaLeapDaysMS : 0)
    )
      .toISOString()
      .split('T')[0],
    end: new Date(
      new Date(newSelectedRange.end).getTime() +
        (arrow === 'right' ? deltaLeapDaysMS : 0)
    )
      .toISOString()
      .split('T')[0],
  };
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// the number of leap days within a date range
function countLeapDays(dateRange: { start: string; end: string }) {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  let leapDayCount = 0;
  for (
    let year = startDate.getFullYear();
    year <= endDate.getFullYear();
    year++
  ) {
    if (isLeapYear(year)) {
      const leapDay = new Date(year, 1, 29);
      if (leapDay >= startDate && leapDay <= endDate) leapDayCount++;
    }
  }
  return leapDayCount;
}
