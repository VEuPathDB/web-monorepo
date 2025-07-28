import React, { useCallback, useMemo } from 'react';
import { CollectionVariableTreeNode, StudyEntity } from '../../types/study';
import SingleSelect, {
  ItemGroup,
} from '@veupathdb/coreui/lib/components/inputs/SingleSelect';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { useStudyEntities } from '../../hooks/workspace';
import { VariableCollectionDescriptor } from '../../types/variable';
import { isVariableCollectionDescriptor } from '../../utils/study-metadata';

interface Props {
  /** Optional logic to filter out unwanted collections */
  collectionPredicate?: (collection: CollectionVariableTreeNode) => boolean;
  /** Selected value */
  value?: VariableCollectionDescriptor | string;
  /** Function to apply when a value is selected */
  onSelect: (value?: VariableCollectionDescriptor | string) => void;
  /** Optionally add additional non-collection items to the dropdown */
  additionalItemGroups?: ItemGroup<string>[];
}

export function VariableCollectionSingleSelect(props: Props) {
  const { collectionPredicate, onSelect, value, additionalItemGroups } = props;
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

    return additionalItemGroups
      ? [...collectionItems, ...additionalItemGroups]
      : collectionItems;
  }, [entities, collectionPredicate, additionalItemGroups]);

  const handleSelect = useCallback(
    (value?: string) => {
      if (value == null) {
        onSelect();
        return;
      }
      if (value.includes(':')) {
        const [entityId, collectionId] = value.split(':');
        onSelect({ entityId, collectionId });
      } else {
        onSelect(value);
      }
    },
    [onSelect]
  );

  const display = useMemo(() => {
    if (value == null) return 'Select the data';

    // Handle different types of values we may see (either VariableCollectionDescriptors or strings)
    if (isVariableCollectionDescriptor(value)) {
      const collection = entities
        .find((e) => e.id === value.entityId)
        ?.collections?.find((c) => c.id === value.collectionId);
      return (
        collection?.displayName ?? `Unknown collection: ${value.collectionId}`
      );
    } else {
      const valueDisplay = items
        .flatMap((group) => group.items)
        .find((item) => item.value === value)?.display;
      return valueDisplay;
    }
  }, [entities, value, items]);

  // Handle the case of only one option
  if (items.length === 1 && items[0].items.length === 1) {
    // Run handleSelect immediately to set the selection.
    const singleItem = items[0].items[0];
    handleSelect(singleItem.value);

    // Return a placeholder to avoid rendering the select, since there's nothing to select!
    return (
      <span style={{ fontWeight: 400, marginRight: 15 }}>
        {singleItem.display}
      </span>
    );
  }

  return (
    <SingleSelect<string | undefined>
      items={items}
      value={
        value &&
        (isVariableCollectionDescriptor(value)
          ? `${value.entityId}:${value.collectionId}`
          : value)
      }
      onSelect={handleSelect}
      buttonDisplayContent={display}
    />
  );
}
