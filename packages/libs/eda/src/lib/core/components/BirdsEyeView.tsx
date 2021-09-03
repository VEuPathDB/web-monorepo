import { Filter } from '../types/filter';
import { useEntityCounts } from '../hooks/entityCounts';
import { CoverageStatistics } from '../types/visualization';
import BirdsEyePlot from '@veupathdb/components/lib/plots/BirdsEyePlot';
import { red, gray } from './filter/colors';
import { StudyEntity } from '../types/study';

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
              label: 'Has data for axis variables',
            },
            ...(stratificationIsActive
              ? [
                  {
                    value: completeCasesAllVars,
                    label: 'Has data for axis & stratification variables',
                  },
                ]
              : []),
          ],
          bars: [
            // total comes first, or the subset is hidden
            {
              name: 'Total',
              value: [totalSize],
              label: [''],
              color: gray,
            },
            {
              name: 'Subset',
              value: [subsetSize],
              label: [''],
              color: red,
            },
          ],
        }
      : undefined;

  return (
    <BirdsEyePlot
      data={birdsEyeData}
      containerClass="birds-eye-plot"
      containerStyles={{
        width: '500px',
        marginLeft: '3em',
      }}
      spacingOptions={{
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
      }}
      dependentAxisLabel={
        outputEntity?.displayNamePlural ?? outputEntity?.displayName
      }
      showSpinner={enableSpinner && !birdsEyeData}
    />
  );
}
