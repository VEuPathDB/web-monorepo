import { ReactElement } from 'react';

import { InputBlock, InputPair, YesNoToggle } from '../../Components';
import { DatasetPostDetails, PostDatasetSource } from '../../../../../Service';
import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  arrayChangeHandler,
} from '../../../../../Utils';
import { AddRowButton } from '../../Components';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export const DatasetSourcesToggleID = 'dataset-sources-toggle';

export interface DatasetSourcesProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetSources(props: DatasetSourcesProps): ReactElement {
  const { hasExternalSources: enabled } = props.clientSideState;

  const setEnabled = (v: boolean) =>
    props.setClientSideState({
      ...props.clientSideState,
      hasExternalSources: v,
    });

  const safeSources = props.datasetMeta.datasetSources ?? [];
  if (safeSources.length < 1) safeSources.push({});

  const disabledClass = enabled ? '' : ' disabled-fields';

  const updateSources = arrayChangeHandler<
    DatasetPostDetails,
    'datasetSources'
  >('datasetSources', props.datasetMeta, props.setDatasetMeta);

  const addSource = () => updateSources({}, undefined);

  const inputRows = safeSources.map((src, i) => {
    // Add the index of the current array element to the JSON path.
    const jPath = props.jsonPath.append(i);

    return (
      <DataSource
        key={jPath.toString()}
        index={i}
        jsonPath={jPath}
        enabled={enabled === true}
        source={src}
        setSource={updateSources}
      />
    );
  });

  return (
    <InputBlock header="Dataset Source" isCommunityRelated={true}>
      <div className={'field-grid' + disabledClass}>
        <label className="not-disabled required" id={DatasetSourcesToggleID}>
          Available from External Source
        </label>
        <YesNoToggle
          value={enabled}
          setValue={setEnabled}
          fieldName="enable-dataset-srouces"
          className="not-disabled"
          helpText={
            'Whether this dataset is also available from an external source' +
            ' (e.g., a public repository, journal-hosted supplementary' +
            ' materials, project website, or institutional archive) outside of' +
            ' this platform.'
          }
        />

        <span className="multi-input-label">Sources</span>
        <ol className="multi-input non-bold-labels">{inputRows}</ol>

        <AddRowButton
          className="column-2"
          onClick={addSource}
          disabled={!enabled}
        >
          + Additional Dataset Source
        </AddRowButton>
      </div>
    </InputBlock>
  );
}

interface DataSourceProps {
  readonly index: number;
  readonly jsonPath: JsonPathBuilder;

  readonly enabled: boolean;

  readonly source: PostDatasetSource;
  readonly setSource: BiConsumer<PostDatasetSource, number>;
}

function DataSource({
  index,
  jsonPath,
  enabled,
  source,
  setSource,
}: DataSourceProps): ReactElement {
  return (
    <li className="field-grid">
      <InputPair
        label="Source URL"
        fieldName={jsonPath.appendToString<PostDatasetSource>('url')}
        value={source.url}
        onChange={(v) => setSource({ ...source, url: v }, index)}
        disabled={!enabled}
        helpText="The URL where the dataset is hosted or was obtained."
      />

      <InputPair
        label="Source Version"
        fieldName={jsonPath.appendToString<PostDatasetSource>('version')}
        value={source.version}
        onChange={(v) => setSource({ ...source, version: v }, index)}
        disabled={!enabled}
        helpText={
          'The version number or publication date from the site where the' +
          ' data was obtained. If neither is available, the data download' +
          ' date is recommended.'
        }
      />
    </li>
  );
}
