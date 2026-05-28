import { ReactElement } from 'react';
import { DatasetPostDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import { FieldHelpText, InputBlock, YesNoToggle } from '../../Components';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export const DatasetUsageToggleID = 'dataset-usage-toggle';

export interface DatasetUsageProps {
  readonly clientSideState: ClientSideUploadFormState;
  readonly setClientSideState: Consumer<ClientSideUploadFormState>;
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
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
    jsonPath.appendToString<DatasetPostDetails>('dataDisclaimer');

  const { hasDisclaimer } = clientSideState;

  const disabledClass = hasDisclaimer ? '' : ' disabled-fields';

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, hasDisclaimer: enabled });

  return (
    <InputBlock header="Dataset Usage" isCommunityRelated={true}>
      <div className={'field-grid' + disabledClass}>
        <label className="not-disabled" id={DatasetUsageToggleID}>
          Important Reuse Considerations
        </label>
        <YesNoToggle
          value={hasDisclaimer}
          setValue={setEnabled}
          fieldName="enable-disclaimer"
          className="not-disabled"
          helpText={
            'Whether this dataset includes important notes, caveats, or' +
            ' limitations that users should review before interpreting or' +
            ' reusing the data.'
          }
        />

        <label
          htmlFor={fieldName}
          className={hasDisclaimer ? 'required' : undefined}
        >
          Disclaimers
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
      </div>
    </InputBlock>
  );
}
