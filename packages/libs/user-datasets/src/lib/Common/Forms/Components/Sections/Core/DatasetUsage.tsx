import React, { ReactElement } from 'react';
import { PartialDatasetDetails } from '../../../../../Service';
import {
  JsonPathBuilder,
  isNonBlankString,
  newTextLengthTest,
} from '../../../../../Utils';
import { InputBlock, LabelInputPair, OptionalSection } from '../../index';
import { useContentFlags, useDataDisclaimer, useDatasetVisibility } from '../../../Hooks/dataset-metadata-hooks';
import { useDispatch } from 'react-redux';
import { overwriteMetaField, updateContentFlags } from '../../../../../Actions/DatasetMetadataFormActions';

export interface DatasetUsageProps {
  readonly jsonPath: JsonPathBuilder;
}

const SECTION_HELP_TEXT =
  'Whether this dataset includes important notes, caveats, or limitations that users should' +
  ' review before interpreting or reusing the data.';

const INPUT_HELP_TEXT =
  'Provide any important caveats or limitations users should consider when interpreting or' +
  ' reusing this dataset, such as missing data, potential biases, changes in data collection, or other factors that' +
  ' may affect analysis. (maximum 1000 characters).';

const TEST_INPUT_LENGTH = newTextLengthTest(3, 1000);

export function DatasetUsage({ jsonPath }: DatasetUsageProps): ReactElement {
  const fieldName = jsonPath.appendToString<PartialDatasetDetails>('dataDisclaimer');

  const dispatch = useDispatch();

  const contentFlags = useContentFlags();
  const hasDisclaimer = contentFlags?.hasDataDisclaimer;
  const setEnabled = React.useCallback(
    (enabled: boolean) => dispatch(updateContentFlags({
      ...contentFlags,
      hasDataDisclaimer: enabled,
    })),
    [dispatch, contentFlags],
  );

  const disclaimer = useDataDisclaimer();
  const setDisclaimer = React.useCallback(
    (disclaimer: string) => dispatch(overwriteMetaField('dataDisclaimer', disclaimer)),
    [dispatch]
  );

  if (typeof hasDisclaimer === 'undefined' && isNonBlankString(disclaimer)) {
    setEnabled(true);
  }

  const isPublic = useDatasetVisibility() === 'public';

  return (
    <InputBlock header="Dataset Usage">
      <OptionalSection
        toggle={{
          label: 'Any Reuse Considerations?',
          required: isPublic,
          fieldName: 'enable-disclaimer',
          enabled: hasDisclaimer ?? null,
          setEnabled: setEnabled,
          helpText: SECTION_HELP_TEXT,
        }}
        className="field-grid"
      >
        <LabelInputPair
          type="textarea"
          label="Reuse Considerations"
          fieldName={fieldName}
          required={hasDisclaimer}
          disabled={!hasDisclaimer}
          value={disclaimer}
          onChange={setDisclaimer}
          helpText={INPUT_HELP_TEXT}
          validator={TEST_INPUT_LENGTH}
        />
      </OptionalSection>
    </InputBlock>
  );
}
