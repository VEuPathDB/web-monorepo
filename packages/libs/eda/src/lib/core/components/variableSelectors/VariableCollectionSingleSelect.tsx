import React, { useCallback, useMemo } from 'react';
import { CollectionVariableTreeNode, StudyEntity } from '../../types/study';
import SingleSelect, {
  ItemGroup,
} from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { useStudyEntities } from '../../hooks/workspace';
import { VariableCollectionDescriptor } from '../../types/variable';

interface Props {
  collectionPredicate?: (collection: CollectionVariableTreeNode) => boolean;
  value?: VariableCollectionDescriptor;
  onSelect: (value?: VariableCollectionDescriptor) => void;
}

export function VariableCollectionSelectList(props: Props) {
  const { collectionPredicate, onSelect, value } = props;
  const entities = useStudyEntities();

  const items = useMemo(() => {
    return entities
      .filter(
        (e): e is StudyEntity & Required<Pick<StudyEntity, 'collections'>> =>
          !!e.collections?.length
      )
      .map((e): ItemGroup<string> => {
        const collections = collectionPredicate
          ? e.collections.filter(collectionPredicate)
          : e.collections;
        return {
          label: e.displayName,
          items: collections.map(
            (collection): Item<string> => ({
              value: `${e.id}:${collection.id}`,
              display: collection.displayName ?? collection.id,
            })
          ),
        };
      });
  }, [entities, collectionPredicate]);

  const handleSelect = useCallback(
    (value?: string) => {
      if (value == null) {
        onSelect();
        return;
      }
      const [entityId, collectionId] = value.split(':');
      onSelect({ entityId, collectionId });
    },
    [onSelect]
  );

  const display = useMemo(() => {
    if (value == null) return 'Select the data';
    const collection = entities
      .find((e) => e.id === value.entityId)
      ?.collections?.find((c) => c.id === value.collectionId);
    return (
      collection?.displayName ?? `Unknown collection: ${value.collectionId}`
    );
  }, [entities, value]);

  return (
    <SingleSelect<string | undefined>
      items={items}
      value={value && `${value.entityId}:${value.collectionId}`}
      onSelect={handleSelect}
      buttonDisplayContent={display}
    />
  );
}