import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import {
  Consumer,
  JsonPathBuilder,
  Optional,
  useChangeHandler,
  useTextLengthTest
} from '../../../../../Utils';
import { InputBlock, LabelInputPair, OptionalSection } from '../../index';
import { OptionalSectionToggleProps } from '../../OptionalSection';

export interface DatasetUsageProps {
  readonly datasetMeta: PartialDatasetDetails;
  readonly setDatasetMeta: Consumer<PartialDatasetDetails>;
  readonly jsonPath: JsonPathBuilder;
}

const SECTION_HELP_TEXT =
  'Whether this dataset includes important notes, caveats, or limitations that users should' +
  ' review before interpreting or reusing the data.';

const INPUT_HELP_TEXT =
  'Provide any important caveats or limitations users should consider when interpreting or' +
  ' reusing this dataset, such as missing data, potential biases, changes in data collection, or other factors that' +
  ' may affect analysis. (maximum 1000 characters).';

export function DatasetUsage({
  datasetMeta,
  setDatasetMeta,
  jsonPath,
}: DatasetUsageProps): ReactElement {
  const fieldName = jsonPath.appendToString<PartialDatasetDetails>('dataDisclaimer');

  const hasDisclaimer = datasetMeta.metadataContentFlags?.hasDataDisclaimer;

  const setEnabled = React.useCallback(
    (enabled: Optional<boolean>) => setDatasetMeta({
      ...datasetMeta,
      metadataContentFlags: {
        ...(datasetMeta.metadataContentFlags ?? {}),
        hasDataDisclaimer: enabled ?? undefined,
      },
    }),
    [datasetMeta, setDatasetMeta]
  );

  if (typeof hasDisclaimer === 'undefined' && datasetMeta.dataDisclaimer) {
    setEnabled(true);
  }

  const isPublic = datasetMeta.visibility === 'public';

  const onChange = useChangeHandler(
    'dataDisclaimer',
    datasetMeta,
    setDatasetMeta
  );

  const toggleProps = React.useMemo<OptionalSectionToggleProps>(
    () => ({
      label: 'Any Reuse Considerations?',
      required: isPublic,
      fieldName: 'enable-disclaimer',
      enabled: hasDisclaimer ?? null,
      setEnabled: setEnabled,
      helpText: SECTION_HELP_TEXT,
    }),
    [isPublic, hasDisclaimer, setEnabled],
  )

  const testInputLength = useTextLengthTest(3, 1000);

  return (
    <InputBlock header="Dataset Usage">
      <OptionalSection toggle={toggleProps} className="field-grid">
        <LabelInputPair
          type="textarea"
          label="Reuse Considerations"
          fieldName={fieldName}
          required={hasDisclaimer ?? undefined}
          disabled={!hasDisclaimer}
          value={datasetMeta.dataDisclaimer}
          onChange={onChange}
          helpText={INPUT_HELP_TEXT}
          validator={testInputLength}
        />
      </OptionalSection>
    </InputBlock>
  );
}
