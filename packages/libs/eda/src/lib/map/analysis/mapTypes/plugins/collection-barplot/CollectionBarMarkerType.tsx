import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../../types';
import {
  CollectionVariableTreeNode,
  StudyEntity,
  useFindEntityAndVariableCollection,
  useStudyEntities,
} from '../../../../../core';
import { VariableCollectionSelectList } from '../../../../../core/components/variableSelectors/VariableCollectionSingleSelect';
import { CheckboxList, SelectList } from '@veupathdb/coreui';
import { Item } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { DraggablePanel } from '@veupathdb/coreui/lib/components/containers';
import { DraggableLegendPanel } from '../../../DraggableLegendPanel';
import { MapLegend } from '../../../MapLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { BarPlotMarkerIcon } from '../../MarkerConfiguration/icons';

const displayName = 'Bar plots';

interface CollectionBarMarkerConfiguration {
  type: 'collection-barplot';
  entityId: string;
  collectionId: string;
  selectedVariableIds: string[];
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
    return {
      type: 'collection-barplot',
      entityId: entity.id,
      collectionId: collection.id,
      selectedVariableIds: collection.memberVariableIds,
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
  const variableCheckboxListItems = entity?.variables
    .filter((v) => memberVariableIdSet.has(v.id))
    .map(
      (variable): Item<string> => ({
        display: variable.displayName,
        value: variable.id,
      })
    );
  return (
    <div css={{ padding: '2em' }}>
      <p>I am a config component</p>
      <VariableCollectionSelectList
        value={{
          entityId: configuration.entityId,
          collectionId: configuration.collectionId,
        }}
        onSelect={function (
          value?: { entityId: string; collectionId: string } | undefined
        ): void {
          if (value == null) return;
          const { entityId, collectionId } = value;
          updateConfiguration({
            type: 'collection-barplot',
            entityId,
            collectionId,
            selectedVariableIds: [],
          });
        }}
      />
      <SelectList
        defaultButtonDisplayContent="Select variables"
        items={variableCheckboxListItems ?? []}
        value={configuration.selectedVariableIds}
        onChange={function (selectedVariableIds: string[]): void {
          updateConfiguration({
            ...configuration,
            selectedVariableIds,
          });
        }}
      />
      <p>
        Selected collection:{' '}
        <pre>{JSON.stringify(props.configuration, null, 2)}</pre>
      </p>
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
