import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import { FieldHelpText, InputBlock } from '../../index';
import { ClientSideUploadFormState } from '../../../../../StoreModules';
import { OptionalSection } from '../../OptionalSection';

export interface DatasetUsageProps {
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetUsage({
  clientSideState,
  setClientSideState,
  datasetMeta,
  setDatasetMeta,
  jsonPath,
}: DatasetUsageProps): ReactElement {
  const fieldName =
    jsonPath.appendToString<PartialDatasetDetails>('dataDisclaimer');

  const { hasDisclaimer } = clientSideState;

  const disabledClass = hasDisclaimer ? '' : ' disabled-fields';

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, hasDisclaimer: enabled });

  if (typeof hasDisclaimer === 'undefined' && datasetMeta.dataDisclaimer) {
    setEnabled(true);
  }

  const isPublic = datasetMeta.visibility === 'public';

  return (
    <InputBlock header="Dataset Usage">
      <OptionalSection
        toggle={{
          label: 'Any Reuse Considerations?',
          required: isPublic,
          fieldName: 'enable-disclaimer',
          enabled: hasDisclaimer ?? null,
          setEnabled: setEnabled,
          helpText:
            'Whether this dataset includes important notes, caveats,' +
            ' or limitations that users should review before interpreting or' +
            ' reusing the data.',
        }}
        className="field-grid"
      >
        <label
          htmlFor={fieldName}
          className={hasDisclaimer ? 'required' : undefined}
        >
          Reuse Considerations
        </label>
        <textarea
          name={fieldName}
          id={fieldName}
          value={datasetMeta.dataDisclaimer}
          disabled={!hasDisclaimer}
          required={hasDisclaimer}
          onChange={(e) =>
            changeHandler(
              'dataDisclaimer',
              datasetMeta,
              setDatasetMeta
            )(e.currentTarget?.value)
          }
        />
        <FieldHelpText>
          Provide any important caveats or limitations users should consider
          when interpreting or reusing this dataset, such as missing data,
          potential biases, changes in data collection, or other factors that
          may affect analysis. (maximum 1000 characters).
        </FieldHelpText>
      </OptionalSection>
    </InputBlock>
  );
}
