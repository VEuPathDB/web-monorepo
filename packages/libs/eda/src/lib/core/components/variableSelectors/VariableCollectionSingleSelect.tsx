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
  /** Optionally add additional non-collection items to the dropdown */
  includeEmptyGroup?: boolean;
  emptyItemGroup?: ItemGroup<string | undefined>;
}

export function VariableCollectionSelectList(props: Props) {
  const {
    collectionPredicate,
    onSelect,
    value = null,
    includeEmptyGroup,
    emptyItemGroup = {
      label: 'Metadata',
      items: [
        {
          value: undefined,
          display: 'Continuous metadata variables',
        },
      ],
    },
  } = props;
  const entities = useStudyEntities();

  const items = useMemo(() => {
    const collectionItems = entities
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
      })
      .filter((itemGroup) => itemGroup.items.length > 0); // Remove entites that had all their collections fail the collection predicate.
    return includeEmptyGroup
      ? [...collectionItems, emptyItemGroup]
      : collectionItems;
  }, [entities, collectionPredicate]);

  const handleSelect = useCallback(
    (value?: string | null | undefined) => {
      console.log(value);
      if (value === undefined) {
        onSelect(undefined);
        return;
      }
      if (value === null) {
        onSelect();
        return;
      }
      const [entityId, collectionId] = value.split(':');
      onSelect({ entityId, collectionId });
    },
    [onSelect]
  );

  const display = useMemo(() => {
    console.log('value', value);
    if (value === null) return 'Select the data';
    if (value === undefined) return 'Continuous metadata variables';
    // First check if the value is from a collection
    const collection = entities
      .find((e) => e.id === value.entityId)
      ?.collections?.find((c) => c.id === value.collectionId);
    console.log('collection', collection);
    console.log(collection === undefined);
    // If not, check any additionalItemGroups
    if (!collection && includeEmptyGroup) {
      console.log('items', items);
      // const item = additionalItemGroups
      //   ?.flatMap((group) => group.items)
      //   .find(
      //     (item) => item.value === `${value.entityId}:${value.collectionId}`
      //   );
      // return item ? item.display : `Unknown item: ${value.entityId}`;
    }
    return (
      collection?.displayName ?? `Unknown collection: ${value.collectionId}`
    );
  }, [entities, value]);

  return (
    <SingleSelect<string | undefined | null>
      items={items}
      value={value && `${value.entityId}:${value.collectionId}`}
      onSelect={handleSelect}
      buttonDisplayContent={display}
    />
  );
}
