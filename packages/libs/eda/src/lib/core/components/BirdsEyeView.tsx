import { Filter } from '../types/filter';
import { useEntityCounts } from '../hooks/entityCounts';
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
}

export function BirdsEyeView(props: Props) {
  const {
    filters = [],
    outputEntity,
    completeCasesAllVars,
    completeCasesAxesVars,
    stratificationIsActive,
    enableSpinner = false,
  } = props;

  const unfilteredEntityCounts = useEntityCounts();
  const filteredEntityCounts = useEntityCounts(filters);
  const outputEntityId = outputEntity?.id;

  const totalSize =
    unfilteredEntityCounts.value && outputEntityId
      ? unfilteredEntityCounts.value[outputEntityId]
      : undefined;
  const subsetSize =
    filteredEntityCounts.value && outputEntityId
      ? filteredEntityCounts.value[outputEntityId]
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
    <div>
      <div style={{ marginLeft: '100px' }}>
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
          width: '400px',
          height: '110px',
          marginBottom: '1.5em',
        }}
        spacingOptions={{
          marginTop: 5,
          marginBottom: 5,
          marginLeft: 5,
          marginRight: 5,
        }}
        interactive={true}
        dependentAxisLabel={entityPluralString}
        showSpinner={enableSpinner && !birdsEyeData}
      />
    </div>
  );
}
