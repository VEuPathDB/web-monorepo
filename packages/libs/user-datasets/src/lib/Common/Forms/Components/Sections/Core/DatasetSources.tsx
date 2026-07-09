import React, { ReactElement } from 'react';

import { InputBlock, InputPair, YesNoToggle } from '../../index';
import {
  PartialDatasetDetails,
  PostDatasetSource,
} from '../../../../../Service';
import {
  BiConsumer,
  Consumer,
  JsonPathBuilder,
  arrayChangeHandler,
} from '../../../../../Utils';
import { AddRowButton } from '../../index';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { isEmpty } from 'lodash';

export const DatasetSourcesToggleID = 'dataset-sources-toggle';

export interface DatasetSourcesProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly clientState: ClientSideUploadFormState;
  readonly setClientState: Consumer<ClientSideUploadFormState>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetSources(props: DatasetSourcesProps): ReactElement {
  const { hasExternalSources: enabled } = props.clientState;

  const setEnabled = (v: boolean) =>
    props.setClientState({
      ...props.clientState,
      hasExternalSources: v,
    });

  if (
    typeof enabled === 'undefined' &&
    !isEmpty(props.datasetMeta.datasetSources)
  ) {
    setEnabled(true);
  }

  const safeSources = isEmpty(props.datasetMeta.datasetSources)
    ? [{}]
    : props.datasetMeta.datasetSources!;

  const disabledClass = enabled ? '' : ' disabled-fields';

  const updateSources = arrayChangeHandler<
    PartialDatasetDetails,
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

  const isPublic = props.datasetMeta.visibility === 'public';

  return (
    <InputBlock header="Dataset Source" isCommunityRelated={true}>
      <div className={'field-grid' + disabledClass}>
        <label
          className={'not-disabled' + (isPublic ? ' required' : '')}
          id={DatasetSourcesToggleID}
        >
          Available from External Source?
        </label>
        <YesNoToggle
          value={enabled}
          setValue={setEnabled}
          fieldName="enable-dataset-srouces"
          className="not-disabled"
          required={isPublic}
          disableRequiredStyling={true}
          helpText={
            'Whether this dataset is also available from an external source' +
            ' (e.g., a public repository, journal-hosted supplementary' +
            ' materials, project website, or institutional archive) outside of' +
            ' this platform.'
          }
        />

        <span className="multi-input-label">External Source Information</span>
        <ol className="multi-input non-bold-labels">{inputRows}</ol>

        <AddRowButton
          className="column-2"
          onClick={addSource}
          disabled={!enabled}
        >
          + Additional External Source
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
  // Fields are required for the first entry, and for any other entries that
  // contain any truthy values
  const required =
    enabled &&
    (index === 0 || !(isEmpty(source.url) && isEmpty(source.version)));

  return (
    <li className="field-grid">
      <InputPair
        label="Source URL"
        type="url"
        fieldName={jsonPath.appendToString<PostDatasetSource>('url')}
        value={source.url}
        onChange={(v) => setSource({ ...source, url: v }, index)}
        disabled={!enabled}
        required={required}
        placeholder="https://data.source.org/path"
        helpText={
          'The full URL where the dataset is hosted or was obtained. URLs must'
          + ' include a protocol prefix such as "https://", "ftp://", etc..'
        }
      />

      <InputPair
        label="Source Version"
        fieldName={jsonPath.appendToString<PostDatasetSource>('version')}
        value={source.version}
        onChange={(v) => setSource({ ...source, version: v }, index)}
        disabled={!enabled}
        required={required}
        helpText={
          'The version number or publication date from the site where the' +
          ' data was obtained. If neither is available, the data download' +
          ' date is recommended.'
        }
      />
    </li>
  );
}
