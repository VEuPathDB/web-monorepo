import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';

import { StudyEntity } from '../../types/study';
import { makeEntityDisplayName } from '../../utils/study-metadata';
import { ReactNode } from 'react';

interface Props {
  /** StudyEntity. Will use the display name of the entity for the title */
  entity?: StudyEntity;
  /** If present, use in the title in place of the entity display name */
  entityDisplayNameOverride?: string;
  /** Value to be used in the title. Usually the number of points in the plot */
  outputSize?: number;
  /** Optional subtitle to show below the title */
  subtitle?: ReactNode;
}

const cx = makeClassNameHelper('OutputEntityTitle');
const cxSubtitle = makeClassNameHelper('OutputEntitySubtitle');

export function OutputEntityTitle({
  entity,
  entityDisplayNameOverride,
  outputSize,
  subtitle,
}: Props) {
  return (
    <p className={cx()}>
      {outputSize != null && <>{outputSize.toLocaleString()} </>}
      {entityDisplayNameOverride != null ? (
        <span className={cx('-EntityName')}> {entityDisplayNameOverride} </span>
      ) : (
        <span className={cx('-EntityName', entity == null && 'unselected')}>
          {entity != null
            ? makeEntityDisplayName(
                entity,
                outputSize == null || outputSize !== 1
              )
            : 'No entity selected'}
        </span>
      )}
      {subtitle && (
        <div className={cxSubtitle()} style={{ color: gray[700] }}>
          {subtitle}
        </div>
      )}
    </p>
  );
}
