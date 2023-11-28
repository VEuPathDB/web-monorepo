import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';

import { StudyEntity } from '../../types/study';
import { makeEntityDisplayName } from '../../utils/study-metadata';
import { ReactNode } from 'react';

interface Props {
  entity?: StudyEntity;
  outputSize?: number;
  subtitle?: ReactNode;
}

const cx = makeClassNameHelper('OutputEntityTitle');
const cxSubtitle = makeClassNameHelper('OutputEntitySubtitle');

export function OutputEntityTitle({ entity, outputSize, subtitle }: Props) {
  return (
    <p className={cx()}>
      {outputSize != null && <>{outputSize.toLocaleString()} </>}
      <span className={cx('-EntityName', entity == null && 'unselected')}>
        {entity != null
          ? makeEntityDisplayName(
              entity,
              outputSize == null || outputSize !== 1
            )
          : 'No entity selected'}
      </span>
      {subtitle && (
        <div className={cxSubtitle()} style={{ color: gray[700] }}>
          {subtitle}
        </div>
      )}
    </p>
  );
}
