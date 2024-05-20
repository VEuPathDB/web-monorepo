import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../../types';
import {
  CollectionVariableTreeNode,
  Filter,
  StandaloneCollectionsMarkerDataRequest,
  StudyEntity,
  Variable,
  useDataClient,
  useFindEntityAndVariableCollection,
  useStudyEntities,
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
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { useQuery } from '@tanstack/react-query';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../../../core/types/geoConfig';
import { defaultAnimation, useCommonData } from '../../shared';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import ChartMarker, {
  BaseMarkerData,
} from '@veupathdb/components/lib/map/ChartMarker';
import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { MapFloatingErrorDiv } from '../../../MapFloatingErrorDiv';
import { mFormatter } from '../../../../../core/utils/big-number-formatters';
import Spinner from '@veupathdb/components/lib/components/Spinner';

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
    const firstCollectionWithEntity = Array.from(
      preorder(study.rootEntity, (e) => e.children ?? [])
    )
      .flatMap(
        (e) =>
          e.collections
            ?.filter((c) => c.dataShape === 'categorical')
            .map((c): [StudyEntity, CollectionVariableTreeNode] => [e, c]) ?? []
      )
      .at(0);
    if (firstCollectionWithEntity == null)
      throw new Error('This study does not have any collections.');
    const [entity, collection] = firstCollectionWithEntity;
    return {
      type: 'collection-barplot',
      entityId: entity.id,
      collectionId: collection.id,
      selectedVariableIds: collection.memberVariableIds.slice(0, 8),
      selectedValues: collection.vocabulary ?? [],
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
  const variablesById = new Map(entity?.variables.map((v) => [v.id, v]));
  const variables: Variable[] =
    variableCollection?.memberVariableIds
      .map((id) => variablesById.get(id))
      .filter(Variable.is) ?? [];

  const valueCheckboxListItems = variableCollection?.vocabulary?.map(
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
            collectionPredicate={(c) => c.dataShape === 'categorical'}
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

function MapLayerComponent(
  props: MapTypeMapLayerProps<CollectionBarMarkerConfiguration>
) {
  const markerData = useMarkerData({
    studyId: props.studyId,
    boundsZoomLevel: props.appState.boundsZoomLevel,
    configuration: props.configuration as CollectionBarMarkerConfiguration,
    geoConfigs: props.geoConfigs,
  });

  if (markerData.isError) {
    return <MapFloatingErrorDiv error={markerData.error} />;
  }

  // TODO Order based on collection vocab
  const markers = markerData.data?.markers.map((marker, index) => {
    const data: BaseMarkerData[] = marker.overlayValues.map((entry, index) => ({
      color: ColorPaletteDefault[index],
      label: entry.variableId,
      value: Number(entry.value) || 0,
      count: Number(entry.value) || 0,
    }));
    const bounds: BoundsDriftMarkerProps['bounds'] = {
      southWest: { lat: marker.minLat, lng: marker.minLon },
      northEast: { lat: marker.maxLat, lng: marker.maxLon },
    };
    const position = { lat: marker.avgLat, lng: marker.avgLon };

    return (
      <ChartMarker
        data={data}
        id={marker.geoAggregateValue}
        key={marker.geoAggregateValue}
        bounds={bounds}
        position={position}
        markerLabel={mFormatter(marker.entityCount)}
        duration={100}
      />
    );
  });

  if (markers == null) return null;

  return (
    <>
      {markerData.isFetching && <Spinner />}
      <SemanticMarkers animation={defaultAnimation} markers={markers} />;
    </>
  );
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
      (variable, index): LegendItemsProps => ({
        label: variable.displayName,
        marker: 'square',
        markerColor: ColorPaletteDefault[index],
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

interface MarkerDataProps {
  boundsZoomLevel?: BoundsViewport;
  configuration: CollectionBarMarkerConfiguration;
  geoConfigs: GeoConfig[];
  studyId: string;
  filters?: Filter[];
}

function useMarkerData({
  boundsZoomLevel,
  configuration,
  geoConfigs,
  studyId,
  filters,
}: MarkerDataProps) {
  const dataClient = useDataClient();
  const studyEntities = useStudyEntities();

  const {
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    viewport,
  } = useCommonData(
    // FIXME Using a fake overlay variable. We don't need this here.
    {
      variableId: configuration.selectedVariableIds[0],
      entityId: configuration.entityId,
    },
    geoConfigs,
    studyEntities,
    boundsZoomLevel
  );

  const collection = studyEntities
    .filter((entity) => entity.id === configuration.entityId)
    .flatMap((entity) =>
      entity.collections?.filter(
        (collection) => collection.id === configuration.collectionId
      )
    )
    .at(0);

  if (collection == null) {
    throw new Error('Could not find collection');
  }

  const requestParams: StandaloneCollectionsMarkerDataRequest = {
    studyId,
    filters,
    config: {
      outputEntityId: outputEntity.id,
      geoAggregateVariable,
      longitudeVariable,
      latitudeVariable,
      viewport,
      collectionOverlay: {
        collection: {
          entityId: configuration.entityId,
          collectionId: configuration.collectionId,
        },
        selectedMembers: configuration.selectedVariableIds,
      },
      aggregatorConfig: {
        overlayType: collection.dataShape as any,
        numeratorValues: configuration.selectedValues,
        // FIXME Use all values for denominator
        denominatorValues: (collection as any).vocabulary,
      },
    },
  };

  return useQuery({
    queryKey: [requestParams],
    queryFn: async () => {
      return dataClient.getStandaloneCollectionsMarkerData(
        'standalone-map',
        requestParams
      );
    },
  });
}
