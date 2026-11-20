import React, { ReactElement } from 'react';

import { PartialDatasetDetails } from '../../../../../Service';
import {
  JsonPathBuilder,
  isNonBlank,
  newTextLengthTest,
} from '../../../../../Utils';
import { InputBlock, LabelInputPair, OptionalSection } from '../../index';
import { useDispatch } from 'react-redux';
import {
  overwriteMetaField,
  patchContentFlags,
} from '../../../../../Actions/DatasetMetadataFormActions';
import { useMetadataSelector } from '../../../Hooks/dataset-metadata-hooks';

const SECTION_HELP_TEXT =
  'Whether this dataset includes important notes, caveats, or limitations that users should' +
  ' review before interpreting or reusing the data.';

const INPUT_HELP_TEXT =
  'Provide any important caveats or limitations users should consider when interpreting or' +
  ' reusing this dataset, such as missing data, potential biases, changes in data collection, or other factors that' +
  ' may affect analysis. (maximum 1000 characters).';

const TEST_INPUT_LENGTH = newTextLengthTest(3, 1000);

export interface DatasetUsageProps {
  readonly jsonPath: JsonPathBuilder;
}

export function DatasetUsage({ jsonPath }: DatasetUsageProps): ReactElement {
  const fieldName = jsonPath.appendToString<PartialDatasetDetails>('dataDisclaimer');

  const dispatch = useDispatch();

  const {
    isPublic = false,
    disclaimer,
    hasDisclaimer,
  } = useMetadataSelector(it => ({
    isPublic: it.visibility === 'public',
    disclaimer: it.dataDisclaimer,
    hasDisclaimer: it.metadataContentFlags?.hasDataDisclaimer,
  })) ?? {};

  const setEnabled = React.useCallback(
    (enabled: boolean) => dispatch(patchContentFlags({
      hasDataDisclaimer: enabled,
    })),
    [dispatch],
  );

  const setDisclaimer = React.useCallback(
    (disclaimer: string) => dispatch(overwriteMetaField('dataDisclaimer', disclaimer)),
    [dispatch]
  );

  if (typeof hasDisclaimer === 'undefined' && isNonBlank(disclaimer)) {
    setEnabled(true);
  }

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
