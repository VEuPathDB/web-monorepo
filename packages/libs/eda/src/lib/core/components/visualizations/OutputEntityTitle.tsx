import { useMemo } from 'react';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { SampleSizeTableArray } from '../../api/data-api';
import { StudyEntity } from '../../types/study';
import { makeEntityDisplayName } from '../../utils/study-metadata';

interface Props {
  entity?: StudyEntity;
  sampleSize?: SampleSizeTableArray;
}

const cx = makeClassNameHelper('OutputEntityTitle');

export function OutputEntityTitle({ entity, sampleSize }: Props) {
  const outputSize = useMemo(
    () =>
      sampleSize?.reduce(
        (tableSum, { size: rowSizes }) =>
          rowSizes == null
            ? tableSum
            : typeof rowSizes === 'number'
            ? tableSum + rowSizes
            : rowSizes.reduce(
                (rowSum, subSampleSize) => rowSum + subSampleSize,
                tableSum
              ),
        0
      ),
    [sampleSize]
  );

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
    </p>
  );
}
