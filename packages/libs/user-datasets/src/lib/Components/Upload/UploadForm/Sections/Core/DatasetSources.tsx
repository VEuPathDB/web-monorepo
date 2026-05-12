import { ReactElement } from 'react';

import { InputBlock, InputPair } from '../../Components';
import { DatasetPostDetails, PostDatasetSource } from '../../../../../Service';
import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  arrayChangeHandler,
} from '../../../../../Utils';
import { AddRowButton } from '../../Components/AddRowButton';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export interface DatasetSourcesProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly clientMeta: ClientSideUploadFormState;
  readonly setClientMeta: Consumer<ClientSideUploadFormState>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetSources(props: DatasetSourcesProps): ReactElement {
  const { hasExternalSources: enabled } = props.clientMeta;

  const setEnabled = (v: boolean) =>
    props.setClientMeta({ ...props.clientMeta, hasExternalSources: v });

  const safeSources = props.datasetMeta.datasetSources ?? [];
  if (safeSources.length < 1) safeSources.push({});

  const disabledClass = enabled ? '' : ' disabled-fields';

  const updateSources = arrayChangeHandler<
    DatasetPostDetails,
    'datasetSources'
  >('datasetSources', props.datasetMeta, props.setDatasetMeta);

  const addSource = () => updateSources({}, undefined);

  const inputRows = safeSources.map((src, i) => {
    // Add the index of the current array element to the json path.
    const jPath = props.jsonPath.append(i);

    return (
      <DataSource
        key={jPath.toString()}
        index={i}
        jsonPath={jPath}
        enabled={enabled}
        source={src}
        setSource={updateSources}
      />
    );
  });

  return (
    <InputBlock header="Dataset Source">
      <div className={'field-grid' + disabledClass}>
        <InputPair
          label="Available from External Source"
          fieldName="enabled"
          type="checkbox"
          checked={enabled}
          className="not-disabled"
          helpText={
            'Whether this dataset is also available from an external source' +
            ' (e.g., a public repository, journal-hosted supplementary' +
            ' materials, project website, or institutional archive) outside of' +
            ' this platform.'
          }
          onChange={setEnabled}
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
        helpText={
          'For datasets also available from an external source (e.g., a' +
          ' journal supplement, data repository, or project website), provide' +
          ' the URL where the dataset is hosted or was obtained.'
        }
      />

      <InputPair
        label="Source Version"
        fieldName={jsonPath.appendToString<PostDatasetSource>('version')}
        value={source.version}
        onChange={(v) => setSource({ ...source, version: v }, index)}
        disabled={!enabled}
        helpText={
          'For datasets also available from an external source: the version' +
          ' number or publication date from the site where the data was' +
          ' obtained. If neither is available, the data download date is' +
          ' acceptable.'
        }
      />
    </li>
  );
}
