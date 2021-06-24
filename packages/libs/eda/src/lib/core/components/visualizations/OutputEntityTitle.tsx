import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useEntityCounts } from '../../hooks/entityCounts';
import { Filter } from '../../types/filter';
import { StudyEntity } from '../../types/study';
import { makeEntityDisplayName } from '../../utils/study-metadata';

interface Props {
  incompleteCases?: number;
  entity?: StudyEntity;
  filters: Filter[];
}

const cx = makeClassNameHelper('OutputEntityTitle');

export function OutputEntityTitle({ entity, incompleteCases, filters }: Props) {
  const entityCounts = useEntityCounts(filters);

  const outputSize =
    incompleteCases == null ||
    entity == null ||
    entityCounts.value?.[entity.id] == null
      ? null
      : entityCounts.value[entity.id] - incompleteCases;

  return (
    <p className={cx('', (entity == null || outputSize == null) && 'loading')}>
      {outputSize != null && <>{outputSize.toLocaleString()} </>}
      {entity != null && outputSize != null
        ? makeEntityDisplayName(entity, outputSize !== 1)
        : 'Loading visualization...'}
    </p>
  );
}
