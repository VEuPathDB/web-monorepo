import { useMemo, useRef } from 'react';
import { Popover } from '@material-ui/core';
import { Tune } from '@material-ui/icons';
import { H6 } from '@veupathdb/coreui';
import TimeSlider, {
  TimeSliderDataProp,
} from '@veupathdb/components/lib/components/plotControls/TimeSlider';
import { DistributionRequestParams, useSubsettingClient } from '../../core';
import { DateVariable, StudyEntity } from '../../core/types/study';
import { VariableDescriptor } from '../../core/types/variable';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { useFindEntityAndVariable, Filter } from '../../core';
import { zip } from 'lodash';
import { AppState } from './appState';
import HelpIcon from '@veupathdb/wdk-client/lib/Components/Icon/HelpIcon';
import { useQuery } from '@tanstack/react-query';
import { IconButton } from './layout/ui';
import { TimelineSettings } from './TimelineSettings';

/** the strip's height: a ~15px brush area plus 9px tick labels */
const TIMELINE_HEIGHT = 36;
/** room for the settings (36px) and help (14px) buttons and gaps */
const BUTTONS_WIDTH = 60;

interface Props {
  studyId: string;
  entities: StudyEntity[];
  /** subset filters plus the marker configuration's (not the timeline's) */
  filters: Filter[] | undefined;
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  config: NonNullable<AppState['timeSliderConfig']>;
  updateConfig: (newConfig: NonNullable<AppState['timeSliderConfig']>) => void;
  /** total width, buttons included */
  width: number;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
}

/**
 * The compact timeline in the map's filter bar: black bars show when there
 * is data, and dragging a window applies a temporary time filter. Its other
 * controls are in a settings pop-over.
 */
export default function TimeSliderQuickFilter({
  studyId,
  entities,
  filters,
  starredVariables,
  toggleStarredVariable,
  config,
  updateConfig,
  width,
  settingsOpen,
  onSettingsOpenChange,
}: Props) {
  const subsettingClient = useSubsettingClient();

  const findEntityAndVariable = useFindEntityAndVariable(filters); // filter sensitivity
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const { variable, active, selectedRange } = config;
  const variableMetadata = findEntityAndVariable(variable);

  // extend the back end range request if our selectedRange is outside of it
  const extendedDisplayRange = useMemo(
    () =>
      variableMetadata && DateVariable.is(variableMetadata.variable)
        ? selectedRange == null
          ? {
              start: variableMetadata.variable.distributionDefaults.rangeMin,
              end: variableMetadata.variable.distributionDefaults.rangeMax,
            }
          : {
              start:
                variableMetadata.variable.distributionDefaults.rangeMin <
                selectedRange.start
                  ? variableMetadata.variable.distributionDefaults.rangeMin
                  : selectedRange.start,
              end:
                variableMetadata.variable.distributionDefaults.rangeMax >
                selectedRange.end
                  ? variableMetadata.variable.distributionDefaults.rangeMax
                  : selectedRange.end,
            }
        : undefined,
    [variableMetadata, selectedRange]
  );

  // converting old usePromise code to useQuery in an efficient manner
  const { enabled, queryKey, queryFn } = useMemo(() => {
    // no data request if no variable is available
    if (
      variableMetadata == null ||
      variable == null ||
      extendedDisplayRange == null ||
      !DateVariable.is(variableMetadata.variable)
    )
      return { enabled: false };

    const binSpec = {
      displayRangeMin:
        extendedDisplayRange.start +
        (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
      displayRangeMax:
        extendedDisplayRange.end +
        (variableMetadata.variable.type === 'date' ? 'T00:00:00Z' : ''),
      binWidth: variableMetadata.variable.distributionDefaults.binWidth ?? 1,
      binUnits:
        'binUnits' in variableMetadata.variable.distributionDefaults
          ? variableMetadata.variable.distributionDefaults.binUnits
          : undefined,
    };

    const payload: [string, string, string, DistributionRequestParams] = [
      studyId,
      variable.entityId,
      variable.variableId,
      {
        valueSpec: 'count',
        filters: filters ?? [],
        binSpec,
      },
    ];

    return {
      enabled: true,
      queryKey: payload,
      queryFn: async () => {
        const distributionResponse = await subsettingClient.getDistribution(
          ...payload
        );
        const histo = distributionResponse.histogram;
        // return the bin starts and the final bin end (with a fixed y value of zero)
        return {
          x: histo
            .map((d) => d.binStart)
            .concat([histo[histo.length - 1].binEnd]),
          // conditionally set y-values to be 1 (with data) and 0 (no data)
          y: histo.map<number>((d) => (d.value >= 1 ? 1 : 0)).concat([0]),
        };
      },
    };
  }, [
    variable,
    subsettingClient,
    filters,
    extendedDisplayRange,
    studyId,
    variableMetadata,
  ]);

  const timeSliderData = useQuery({
    enabled,
    queryFn,
    queryKey,
    keepPreviousData: true,
  });

  // converting data to visx format
  const timeFilterData: TimeSliderDataProp[] = useMemo(() => {
    const restructured =
      timeSliderData.data != null
        ? zip(timeSliderData.data.x, timeSliderData.data.y)
            .map(([xValue, yValue]) => ({ x: xValue, y: yValue }))
            // and a type guard filter to avoid any `!` assertions.
            .filter(
              (val): val is TimeSliderDataProp => val.x != null && val.y != null
            )
        : [];

    return restructured;
  }, [timeSliderData.data]);

  const sliderWidth = Math.max(width - BUTTONS_WIDTH, 0);

  const helpText = (
    <div style={{ paddingTop: 10 }}>
      <H6>Timeline help</H6>
      <p>
        Black bars indicate when <i>in time</i> there is data that...
        <ul>
          <li>is located anywhere on Earth*, not just currently in view</li>
          <li>
            has a value for <b>{variableMetadata?.variable.displayName}</b>
          </li>
          <li>satisfies any filters you have applied</li>
          <li>
            has values for the variable currently displayed on markers,
            including custom-configurations
          </li>
        </ul>
        (* data that has no geolocation will also be shown on the timeline)
      </p>
      <p>
        How to use
        <ul>
          <li>
            Apply a temporary time-based filter by dragging a window across the
            graphic
          </li>
          <li>
            Click once on the graphic outside the window to cancel the temporary
            filter
          </li>
        </ul>
      </p>
      <p>
        Open the timeline settings with the sliders button to change the date
        variable (currently <b>{variableMetadata?.variable.displayName}</b>),
        set start and end dates precisely, step the window forwards and
        backwards, or turn the timeline filter on and off.
      </p>
      {!active && (
        <p>
          <b>
            The timeline temporary filter is currently disabled. To enable it,
            open the timeline settings and switch it on.
          </b>
        </p>
      )}
    </div>
  );

  // if no variable in a study is suitable to time slider, do not show time slider
  return variable != null && variableMetadata != null ? (
    <div css={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        css={{
          width: sliderWidth,
          height: TIMELINE_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!timeSliderData.isFetching &&
        timeFilterData != null &&
        timeFilterData.length > 0 ? (
          <TimeSlider
            data={timeFilterData}
            selectedRange={selectedRange}
            setSelectedRange={(selectedRange) =>
              updateConfig({ ...config, selectedRange })
            }
            xAxisRange={extendedDisplayRange}
            width={sliderWidth}
            height={TIMELINE_HEIGHT}
            tickLabelFontSize={9}
            numTicks={Math.max(2, Math.floor(sliderWidth / 65))}
            // fill color of the selectedRange
            brushColor={'lightpink'}
            brushOpacity={0.4}
            // axis tick and tick label color
            barColor={!active ? '#aaa' : '#000'}
            axisColor={!active ? '#888' : '#000'}
            // disable user-interaction
            disabled={!active}
          />
        ) : (
          <Spinner size={16} />
        )}
      </div>
      <IconButton
        ref={settingsButtonRef}
        title="Timeline settings"
        active={settingsOpen}
        onClick={() => onSettingsOpenChange(!settingsOpen)}
      >
        <Tune />
      </IconButton>
      <HelpIcon children={helpText} />
      <Popover
        open={settingsOpen}
        anchorEl={settingsButtonRef.current}
        onClose={() => onSettingsOpenChange(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <TimelineSettings
          entities={entities}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          config={config}
          updateConfig={updateConfig}
          extendedDisplayRange={extendedDisplayRange}
          onClose={() => onSettingsOpenChange(false)}
        />
      </Popover>
    </div>
  ) : null;
}
