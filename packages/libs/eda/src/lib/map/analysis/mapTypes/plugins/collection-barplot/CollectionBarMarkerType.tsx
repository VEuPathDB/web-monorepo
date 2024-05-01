import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../../types';
import {
  CollectionVariableTreeNode,
  StudyEntity,
  Variable,
  useFindEntityAndVariableCollection,
} from '../../../../../core';
import { VariableCollectionSelectList } from '../../../../../core/components/variableSelectors/VariableCollectionSingleSelect';
import { SelectList } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { DraggableLegendPanel } from '../../../DraggableLegendPanel';
import { MapLegend } from '../../../MapLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { BarPlotMarkerIcon } from '../../MarkerConfiguration/icons';
import { difference, noop, union, uniq } from 'lodash';
import { Mesa } from '@veupathdb/coreui';

const displayName = 'Bar plots';

interface CollectionBarMarkerConfiguration {
  type: 'collection-barplot';
  entityId: string;
  collectionId: string;
  selectedVariableIds: string[];
  selectedValues: string[];
}

export const plugin: MapTypePlugin<CollectionBarMarkerConfiguration> = {
  type: 'collection-barplot',
  IconComponent: BarPlotMarkerIcon,
  displayName,
  getDefaultConfig({ study }) {
    const firstCollection = Array.from(
      preorder(study.rootEntity, (e) => e.children ?? [])
    )
      .flatMap(
        (e) =>
          e.collections?.map((c): [StudyEntity, CollectionVariableTreeNode] => [
            e,
            c,
          ]) ?? []
      )
      .at(0);
    if (firstCollection == null)
      throw new Error('This study does not have any collections.');
    const [entity, collection] = firstCollection;
    const selectedValues = entity.variables
      .filter((variable): variable is Variable =>
        collection.memberVariableIds.includes(variable.id)
      )
      .flatMap((variable) => variable.vocabulary ?? []);
    return {
      type: 'collection-barplot',
      entityId: entity.id,
      collectionId: collection.id,
      selectedVariableIds: collection.memberVariableIds.slice(0, 8),
      selectedValues: union(selectedValues),
    };
  },
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
  MapTypeHeaderDetails,
};

function ConfigPanelComponent(
  props: MapTypeConfigPanelProps<CollectionBarMarkerConfiguration>
) {
  const configuration = props.configuration as CollectionBarMarkerConfiguration;
  const { updateConfiguration } = props;
  const findEntityAndCollection = useFindEntityAndVariableCollection();
  const { entity, variableCollection } =
    findEntityAndCollection({
      entityId: configuration.entityId,
      collectionId: configuration.collectionId,
    }) ?? {};
  const memberVariableIdSet = new Set(variableCollection?.memberVariableIds);
  const variables =
    entity?.variables.filter((v): v is Variable =>
      memberVariableIdSet.has(v.id)
    ) ?? [];
  const valueCheckboxListItems = union(
    variables?.flatMap((v) => v.vocabulary ?? [])
  ).map(
    (value): Item<string> => ({
      display: value,
      value,
    })
  );
  return (
    <div css={{ padding: '2em' }}>
      <p
        style={{
          margin: '5px 0 0 0',
          fontWeight: 'bold',
        }}
      >
        Marker preview:
      </p>
      <div>TBD</div>

      <p
        style={{
          margin: '5px 0 0 0',
          fontWeight: 'bold',
        }}
      >
        Color:
      </p>
      <div>
        <div css={{ margin: '1em 0' }}>
          <label>Grouped Variable:</label>
          <VariableCollectionSelectList
            value={{
              entityId: configuration.entityId,
              collectionId: configuration.collectionId,
            }}
            onSelect={function (
              value?:
                | { entityId: string; collectionId: string }
                | string
                | undefined
            ): void {
              if (value == null || typeof value === 'string') return;
              const { entity, variableCollection } =
                findEntityAndCollection(value) ?? {};
              if (entity == null || variableCollection == null) return;
              const selectedVariableIds =
                variableCollection.memberVariableIds.slice(0, 8);
              const selectedValues = uniq(
                entity.variables
                  .filter((v): v is Variable =>
                    selectedVariableIds.includes(v.id)
                  )
                  .flatMap((v) => v.vocabulary ?? [])
              );

              updateConfiguration({
                type: 'collection-barplot',
                entityId: entity.id,
                collectionId: variableCollection.id,
                selectedVariableIds,
                selectedValues,
              });
            }}
          />
        </div>
        <div
          css={{
            width: '30em',
            margin: '1em 0',
          }}
        >
          <Mesa
            state={{
              rows: variables,
              columns: [
                {
                  key: 'displayName',
                  name: 'Variable',
                  sortable: true,
                },
              ],
              options: {
                title: 'Choose variables',
                useStickyHeader: true,
                tableBodyMaxHeight: '20em',
                isRowSelected: (row) =>
                  configuration.selectedVariableIds.includes(row.id),
              },
              eventHandlers: {
                onSearch: noop,
                onSort: noop,
                onRowSelect: (row) => {
                  updateConfiguration({
                    ...configuration,
                    selectedVariableIds: union(
                      configuration.selectedVariableIds,
                      [row.id]
                    ),
                  });
                },
                onRowDeselect: (row) => {
                  updateConfiguration({
                    ...configuration,
                    selectedVariableIds: difference(
                      configuration.selectedVariableIds,
                      [row.id]
                    ),
                  });
                },
                onMultipleRowDeselect: (rows) => {
                  updateConfiguration({
                    ...configuration,
                    selectedVariableIds: difference(
                      configuration.selectedVariableIds,
                      rows.map((r) => r.id)
                    ),
                  });
                },
                onMultipleRowSelect: (rows) => {
                  updateConfiguration({
                    ...configuration,
                    selectedVariableIds: union(
                      configuration.selectedVariableIds,
                      rows.map((r) => r.id)
                    ),
                  });
                },
              },
            }}
          />
        </div>
        <div css={{ margin: '1em 0' }}>
          <label>Select values:</label>
          <SelectList
            defaultButtonDisplayContent="Select values"
            items={valueCheckboxListItems ?? []}
            value={configuration.selectedValues ?? []}
            onChange={function (selectedValues: string[]): void {
              updateConfiguration({
                ...configuration,
                selectedValues,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MapLayerComponent() {
  return <div>I am a map layer component</div>;
}

function MapOverlayComponent(
  props: MapTypeMapLayerProps<CollectionBarMarkerConfiguration>
) {
  const configuration = props.configuration as CollectionBarMarkerConfiguration;
  const { headerButtons } = props;

  const findEntityAndCollection = useFindEntityAndVariableCollection();
  const { entity, variableCollection } =
    findEntityAndCollection(configuration) ?? {};

  const noDataError = null;

  const legendItems = entity?.variables
    .filter((variable) =>
      configuration.selectedVariableIds.includes(variable.id)
    )
    .map(
      (variable): LegendItemsProps => ({
        label: variable.displayName,
        marker: 'square',
        hasData: true,
      })
    );

  return (
    <DraggableLegendPanel
      panelTitle={variableCollection?.displayName}
      zIndex={3}
      headerButtons={headerButtons}
    >
      <div style={{ padding: '5px 10px' }}>
        {noDataError ?? (
          <MapLegend
            isLoading={false}
            plotLegendProps={{ type: 'list', legendItems: legendItems ?? [] }}
            showCheckbox={false}
          />
        )}
      </div>
    </DraggableLegendPanel>
  );
}

function MapTypeHeaderDetails() {
  return <div>I am a map type header details component</div>;
}
