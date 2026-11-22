import { ReactNode, useCallback } from 'react';
import { Toggle } from '@veupathdb/coreui';
import AxisRangeControl from '@veupathdb/components/lib/components/plotControls/AxisRangeControl';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
import { InputVariables } from '../../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../../core/utils/data-element-constraints';
import { StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';
import { AppState } from './appState';
import { timeSliderVariableConstraints } from './config/eztimeslider';
import { mapUi, PanelHeader, usePrimaryColor } from './layout/ui';

type TimeSliderConfig = NonNullable<AppState['timeSliderConfig']>;

interface Props {
  entities: StudyEntity[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (variable: VariableDescriptor) => void;
  config: TimeSliderConfig;
  updateConfig: (config: TimeSliderConfig) => void;
  onClose: () => void;
  /** open the filter bar's help panel (called just after `onClose`) */
  onShowHelp: () => void;
}

/**
 * The timeline's settings, shown in a pop-over from the filter bar: the date
 * variable, the window's exact dates and the on/off switch. (The step
 * buttons are on the strip itself.)
 */
export function TimelineSettings({
  entities,
  starredVariables,
  toggleStarredVariable,
  config,
  updateConfig,
  onClose,
  onShowHelp,
}: Props) {
  const primary = usePrimaryColor();
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
        <Row label="Apply">
          <Toggle
            label={active ? 'On' : 'Off'}
            labelPosition="right"
            value={!!active}
            onChange={(active) => updateConfig({ ...config, active })}
          />
        </Row>
        <button
          type="button"
          onClick={() => {
            onClose();
            onShowHelp();
          }}
          css={{
            alignSelf: 'flex-start',
            border: 'none',
            padding: 0,
            background: 'none',
            color: primary,
            fontSize: 12,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          How the timeline works
        </button>
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
