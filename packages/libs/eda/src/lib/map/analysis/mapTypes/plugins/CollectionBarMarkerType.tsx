import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { VariableCollectionDescriptor } from '../../../../core/types/variable';
import { MapTypeConfigPanelProps, MapTypePlugin } from '../types';

const displayName = 'Bar plots';

interface CollectionBarMarkerConfiguration {
  type: 'collection-barplot';
  selectedCollection: VariableCollectionDescriptor;
}

export const plugin: MapTypePlugin<CollectionBarMarkerConfiguration> = {
  displayName,
  getDefaultConfig({ study }) {
    const firstCollection = Array.from(
      preorder(study.rootEntity, (e) => e.children ?? [])
    )
      .flatMap((e) => e.collections?.map((c) => [e, c]) ?? [])
      .at(0);
    if (firstCollection == null)
      throw new Error('This study does not have any collections.');
    return {
      type: 'collection-barplot',
      selectedCollection: {
        entityId: firstCollection[0].id,
        collectionId: firstCollection[1].id,
      },
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
  return (
    <div css={{ padding: '2em' }}>
      <p>I am a config component</p>
      <p>Selected collection: {JSON.stringify(props.configuration)}</p>
    </div>
  );
}

function MapLayerComponent() {
  return <div>I am a map layer component</div>;
}

function MapOverlayComponent() {
  return <div>I am a map overlay component</div>;
}

function MapTypeHeaderDetails() {
  return <div>I am a map type header details component</div>;
}
