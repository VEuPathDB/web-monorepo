import React from 'react';
import * as util from '../../../../../Utils';
import * as vdi from '../../../../../Service';
import * as actions from '../../../../../Actions/DatasetMetadataFormActions'

import { isEmpty } from 'lodash';
import { AddRowButton, InputBlock, LabelInputPair, YesNoToggle } from '../../';
import { TextInputProps } from '../../LabelInputPair';
import { testNonBlank } from '../../../../../Utils';
import { useContentFlags, useDatasetSources, useDatasetVisibility } from '../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';

export const DatasetSourcesToggleID = 'dataset-sources-toggle';

export interface DatasetSourcesProps {
  readonly jsonPath: util.JsonPathBuilder;
}

export function DatasetSources(props: DatasetSourcesProps): React.ReactElement {
  const jsonPath = props.jsonPath.append<vdi.PartialDatasetDetails>('datasetSources');

  const dispatch = useDispatch();

  const sources = useDatasetSources();
  const updateSources = React.useCallback(
    (sources: ReadonlyArray<vdi.PartialDatasetSource>) => dispatch(actions.updateSources(sources)),
    [dispatch]
  );
  const setSource = React.useCallback(
    (source: vdi.PartialDatasetSource, index: number) =>
      updateSources(util.replaceElement(sources, index, source)),
    [sources, updateSources],
  )

  const contentFlags = useContentFlags();
  const enabled = contentFlags?.hasDatasetSources;
  const setEnabled = React.useCallback(
    (v: boolean) => dispatch(actions.updateContentFlags({
      ...contentFlags,
      hasDatasetSources: v,
    })),
    [dispatch, contentFlags],
  );

  if (typeof enabled === 'undefined' && !isEmpty(sources)) {
    setEnabled(true);
  }

  const disabledClass = enabled ? '' : ' disabled-fields';

  const safeSources = isEmpty(sources) ? [{}] : sources!;

  const inputRows = safeSources.map((src, i) => {
    // Add the index of the current array element to the JSON path.
    const jPath = jsonPath.append(i);

    return (
      <DataSource
        key={jPath.toString()}
        index={i}
        jsonPath={jPath}
        enabled={enabled === true}
        source={src}
        setSource={setSource}
      />
    );
  });

  const isPublic = useDatasetVisibility() === 'public';

  return (
    <InputBlock header="Dataset Source">
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
          onClick={() => setSource({}, Infinity)}
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
  readonly jsonPath: util.JsonPathBuilder;

  readonly enabled: boolean;

  readonly source: vdi.PartialDatasetSource;
  readonly setSource: util.BiConsumer<vdi.PartialDatasetSource, number>;
}

function testUrl({ value, required, disabled }: TextInputProps): boolean {
  if (disabled || (!required && isEmpty(value))) return true;

  return /^(https?|ftp):\/\/(\w+\.)+\w+.*$/.test(value!);
}

function DataSource({
  index,
  jsonPath,
  enabled,
  source,
  setSource,
}: DataSourceProps): React.ReactElement {
  // Fields are required for the first entry, and for any other entries that
  // contain any truthy values
  const required =
    enabled &&
    (index === 0 || !(isEmpty(source.url) && isEmpty(source.version)));

  return (
    <li className="field-grid">
      <LabelInputPair
        label="Source URL"
        type="url"
        fieldName={jsonPath.appendToString<vdi.PartialDatasetSource>('url')}
        value={source.url}
        onChange={(v) => setSource({ ...source, url: v }, index)}
        disabled={!enabled}
        required={required}
        placeholder="https://data.source.org/path"
        validator={testUrl}
        helpText={
          'The full URL where the dataset is hosted or was obtained. URLs must' +
          ' include a protocol prefix such as "https://", "ftp://", etc..'
        }
      />

      <LabelInputPair
        type="text"
        label="Source Version"
        fieldName={jsonPath.appendToString<vdi.PartialDatasetSource>('version')}
        value={source.version}
        onChange={(v) => setSource({ ...source, version: v }, index)}
        disabled={!enabled}
        required={required}
        validator={testNonBlank}
        helpText={
          'The version number or publication date from the site where the' +
          ' data was obtained. If neither is available, the data download' +
          ' date is recommended.'
        }
      />
    </li>
  );
}
