import { ReactElement } from 'react';
import { DatasetPostDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import { FieldHelpText, InputBlock, YesNoToggle } from '../../Components';
import { ClientSideUploadFormState } from '../../../../../StoreModules/UserDatasetUploadStoreModule';

export const DatasetUsageToggleID = "dataset-usage-toggle";

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

  const disabledClass = clientSideState.hasDisclaimer ? '' : ' disabled-fields';

  const setEnabled = (enabled: boolean) =>
    setClientSideState({ ...clientSideState, hasDisclaimer: enabled });

  return (
    <InputBlock header="Dataset Usage">
      <div className={'field-grid' + disabledClass}>
        <label className="not-disabled required" id={DatasetUsageToggleID}>Filler Text</label>
        <YesNoToggle
          value={clientSideState.hasDisclaimer}
          setValue={setEnabled}
          fieldName="enable-disclaimer"
          className="not-disabled"
        />

        <label htmlFor={fieldName}>Disclaimers</label>
        <textarea
          name={fieldName}
          id={fieldName}
          value={datasetMeta.dataDisclaimer}
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
