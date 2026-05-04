import { ReactElement, useState } from 'react';
import { InputPair } from '../../Components';
import {
  DatasetPostDetails,
  PostDatasetSource,
} from '../../../../../Service/model/requests';
import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  arrayChangeHandler,
} from '../../../../../Utils';
import { AddRowButton } from '../../Components/AddRowButton';

export interface DatasetSourcesProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetSources(props: DatasetSourcesProps): ReactElement {
  const [enabled, setEnabled] = useState(false);

  const safeSources = props.datasetMeta.datasetSources ?? [];
  if (safeSources.length < 1) safeSources.push({});

  const updateSources = arrayChangeHandler<
    DatasetPostDetails,
    'datasetSources'
  >('datasetSources', props.datasetMeta, props.setDatasetMeta);

  const addSource = () => updateSources({}, undefined);

  const inputRows = safeSources.map((src, i) => (
    <DataSource
      index={i}
      jsonPath={props.jsonPath}
      enabled={enabled}
      source={src}
      setSource={updateSources}
    />
  ));

  return (
    <div className="input-block">
      <h4>Dataset Source</h4>

      <InputPair
        label="Available from External Source"
        fieldName="enabled"
        type="checkbox"
        checked={enabled}
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
  // Add the index of the current array element to the json path.
  const jPath = jsonPath.append(index);

  return (
    <li className="field-grid">
      <InputPair
        label="Source URL"
        fieldName={jPath.appendToString<PostDatasetSource>('url')}
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
        fieldName={jPath.appendToString<PostDatasetSource>('version')}
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
