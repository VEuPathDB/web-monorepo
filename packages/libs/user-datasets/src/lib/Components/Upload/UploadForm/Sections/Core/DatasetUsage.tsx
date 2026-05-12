import { ReactElement } from 'react';
import { DatasetPostDetails } from '../../../../../Service';
import { Consumer, JsonPathBuilder, changeHandler } from '../../../../../Utils';
import { FieldHelpText, InputBlock } from '../../Components';

export interface DatasetUsageProps {
  readonly datasetMeta: DatasetPostDetails;
  readonly setDatasetMeta: Consumer<DatasetPostDetails>;
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetUsage({
  datasetMeta,
  setDatasetMeta,
  jsonPath,
}: DatasetUsageProps): ReactElement {
  const fieldName =
    jsonPath.appendToString<DatasetPostDetails>('dataDisclaimer');

  return (
    <InputBlock header="Dataset Usage">
      <div className="field-grid">
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
