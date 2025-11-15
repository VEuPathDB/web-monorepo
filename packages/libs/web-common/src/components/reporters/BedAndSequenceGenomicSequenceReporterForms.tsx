import React from 'react';
import {
  SingleSelect,
  NumberSelector,
  RadioList,
  Checkbox,
  TextBox,
} from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList, ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import createSequenceForm from './SequenceFormFactory';
import { ReporterFormComponent } from './Types';

const util = Object.assign({}, ComponentUtils, ReporterUtils);

interface FormListItem {
  value: string;
  display: React.ReactNode;
}

interface SequenceRegionRangeProps {
  label: string;
  anchor: string;
  offset: string;
  formState: Record<string, any>;
  getUpdateHandler: (field: string) => (value: any) => void;
}

interface GenomicSequenceRegionInputsProps {
  formState: Record<string, any>;
  getUpdateHandler: (field: string) => (value: any) => void;
}

/*
 * Taken from SequenceGeneReporterForm and adapted:
 * - similar to the protein region toggle in choice
 * - has "nucleotides" as unit, like in sequence region toggle
 */
const anchorValues: FormListItem[] = [
  { value: 'DownstreamFromStart', display: 'Downstream From Start' },
  { value: 'UpstreamFromEnd', display: 'Upstream From End' },
];

const SequenceRegionRange: React.FC<SequenceRegionRangeProps> = (props) => {
  const { label, anchor, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect
        name={anchor}
        value={formState[anchor]}
        onChange={getUpdateHandler(anchor)}
        items={anchorValues}
      />
      <NumberSelector
        name={offset}
        value={formState[offset]}
        start={0}
        end={10000}
        step={1}
        onChange={getUpdateHandler(offset)}
        size={6}
      />
      nucleotides
    </React.Fragment>
  );
};
/*
 * Taken from BedAndSequenceGeneReporterForm and adapted:
 * - no reverse & complement checkbox here, because we have a global "strand" toggle
 */
const GenomicSequenceRegionInputs: React.FC<GenomicSequenceRegionInputsProps> =
  (props) => {
    const { formState, getUpdateHandler } = props;
    return (
      <div>
        <div
          style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(4, auto)',
            alignItems: 'center',
            gridRowGap: '0.25em',
            gridColumnGap: '0.5em',
            marginLeft: '0.75em',
          }}
        >
          <SequenceRegionRange
            label="Begin at"
            anchor="startAnchor"
            offset="startOffset"
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
          <SequenceRegionRange
            label="End at"
            anchor="endAnchor"
            offset="endOffset"
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        </div>
      </div>
    );
  };

const strands: FormListItem[] = [
  { value: 'forward', display: 'Forward' },
  { value: 'reverse', display: 'Reverse' },
];

const sequenceFeatureOptions: FormListItem[] = [
  { value: 'low_complexity', display: 'Low Complexity Regions' },
  { value: 'repeats', display: 'Repeats' },
  { value: 'tandem', display: 'Tandem Repeats' },
  { value: 'centromere', display: 'Centromere' },
];

const resultTypes: FormListItem[] = [
  { value: 'sequence_range', display: 'Sequence Region' },
  { value: 'sequence_features', display: 'Sequence Features' },
];

const formBeforeCommonOptions = (props: any) => {
  const { formState, updateFormState, onSubmit, includeSubmit } = props;
  const getUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  const typeUpdateHandler = (newTypeValue: string) => {
    updateFormState(Object.assign({}, formState, { resultType: newTypeValue }));
  };
  const getTypeSpecificParams = () => {
    switch (formState.resultType) {
      case 'sequence_range':
        return (
          <GenomicSequenceRegionInputs
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'sequence_features':
        return (
          <FeaturesList
            field="sequenceFeature"
            features={sequenceFeatureOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
    }
  };
  return (
    <React.Fragment>
      <h3>Choose the type of result:</h3>
      <div style={{ marginLeft: '2em' }}>
        <RadioList
          name="resultType"
          value={formState.resultType}
          onChange={typeUpdateHandler}
          items={resultTypes}
        />
        <h4>Configure details:</h4>
        {getTypeSpecificParams()}
      </div>
      <h3>Strand:</h3>
      <div style={{ marginLeft: '2em' }}>
        <RadioList
          name="strand"
          value={formState.strand}
          items={strands}
          onChange={getUpdateHandler('strand')}
        />
      </div>
    </React.Fragment>
  );
};

const formAfterSubmitButton = (props: any) => {
  return <React.Fragment></React.Fragment>;
};
const getFormInitialState = (): Record<string, any> => ({
  resultType: resultTypes[0].value,
  strand: strands[0].value,
  startAnchor: anchorValues[0].value,
  startOffset: 0,
  endAnchor: anchorValues[1].value,
  endOffset: 0,
  sequenceFeature: sequenceFeatureOptions[0].value,
});

const SequenceGenomicSequenceReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Sequences'
);
const BedGenomicSequenceReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Coordinates'
);
export { SequenceGenomicSequenceReporterForm, BedGenomicSequenceReporterForm };
