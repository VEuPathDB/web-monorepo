import { Filter } from '../types/filter';
import { EntityCounts } from '../hooks/entityCounts';
import { CoverageStatistics } from '../types/visualization';
import BirdsEyePlot from '@veupathdb/components/lib/plots/BirdsEyePlot';
import { red, gray } from './filter/colors';
import { StudyEntity } from '../types/study';
import { HelpIcon } from '@veupathdb/wdk-client/lib/Components';

interface Props extends Partial<CoverageStatistics> {
  /** Current active filters */
  filters?: Filter[];
  /** The output entity */
  outputEntity?: StudyEntity;
  /** Are any stratification variables active? */
  stratificationIsActive: boolean;
  /** Should the spinner be enabled? This doesn't mean that it is shown. Just that it might be. */
  enableSpinner?: boolean;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
}

export function BirdsEyeView(props: Props) {
  const {
    filters = [],
    outputEntity,
    completeCasesAllVars,
    completeCasesAxesVars,
    stratificationIsActive,
    enableSpinner = false,
    totalCounts,
    filteredCounts,
  } = props;

  const outputEntityId = outputEntity?.id;

  const totalSize =
    totalCounts && outputEntityId ? totalCounts[outputEntityId] : undefined;
  const subsetSize =
    filteredCounts && outputEntityId
      ? filteredCounts[outputEntityId]
      : undefined;

  const birdsEyeData =
    completeCasesAxesVars != null &&
    completeCasesAllVars != null &&
    totalSize != null &&
    subsetSize != null
      ? {
          brackets: [
            {
              value: completeCasesAxesVars,
              label: 'Data for axes',
            },
            ...(stratificationIsActive
              ? [
                  {
                    value: completeCasesAllVars,
                    label: 'Data for axes & strata',
                  },
                ]
              : []),
          ],
          bars: [
            // total comes first, or the subset is hidden
            {
              label: 'Total',
              value: totalSize,
              color: gray,
            },
            {
              label: 'Subset',
              value: subsetSize,
              color: red,
            },
          ],
        }
      : undefined;

  const entityPluralString =
    outputEntity?.displayNamePlural ?? outputEntity?.displayName;

  return (
    // wrap 500px birds eye plot in an overflowing 400px div so that the mouseover-popup isn't clipped,
    // but at the same time don't cause wrapping of the side plots/tables on 1280px screens.
    <div style={{ width: '400px', overflow: 'visible' }}>
      <div
        style={{
          marginLeft: '100px',
          visibility: birdsEyeData ? 'visible' : 'hidden',
        }}
      >
        <HelpIcon
          tooltipPosition={{
            my: 'bottom left',
            at: 'top right',
          }}
        >
          <div>
            <b>Data for axes & strata:</b> The number of{' '}
            <i>{entityPluralString}</i> in the subset that have data for all
            axis and stratification variables.
            <br />
            <b>Data for axes:</b> The number of <i>{entityPluralString}</i> in
            the subset that have data for all axis variables.
            <br />
            <b>Subset:</b> The number of <i>{entityPluralString}</i> that match
            the filters applied in this analysis.
            <br />
            <b>All:</b> The total number of <i>{entityPluralString}</i> in the
            dataset.
          </div>
        </HelpIcon>
      </div>
      <BirdsEyePlot
        data={birdsEyeData}
        containerClass="birds-eye-plot"
        containerStyles={{
          width: '500px',
          height: '110px',
          marginBottom: '1.5em',
        }}
        spacingOptions={{
          marginTop: 5,
          marginBottom: 5,
          marginLeft: 5,
          marginRight: 100,
        }}
        interactive={true}
        dependentAxisLabel={entityPluralString}
        showSpinner={enableSpinner && !birdsEyeData}
      />
    </div>
  );
}
