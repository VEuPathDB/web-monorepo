import { DatasetFormConfig } from '../../../../Configuration';
import { Consumer } from '../../../../../Utils';
import React, { ReactElement } from 'react';
import { InputPair } from '../../InputPair';
import {
  SAMPLE_INFO_FIELD_NAME,
  SAMPLE_INFO_MAX_BYTES,
  utf8ByteLength
} from '../../../../../Service/utils/rnaseq-rc-data-files';
import { RootDetailsSectionProps } from './RootDetailsSection';
import { getSamplesDescription, UploadContentMap } from '../../../../../Service/Model/utility-types';
import { newUploadContent } from '../../../../../Service/Model';

export function SamplesDescriptionInput({ formProps, formConfig, dataUploads, setDataUploads }: {
  formProps: RootDetailsSectionProps,
  formConfig: DatasetFormConfig,
  dataUploads: UploadContentMap,
  setDataUploads: Consumer<UploadContentMap>,
}): ReactElement {
  const value = getSamplesDescription(dataUploads)?.value;

  return (
    <>
      <InputPair
        label={formConfig.verbiage.formInputs!.samplesDescription!.label}
        fieldName={SAMPLE_INFO_FIELD_NAME}
        value={value}
        required={formProps.showDataInputs}
        type="textarea"
        rows={15}
        inputClass="samples-description"
        onChange={(v) =>
          setDataUploads({
            ...dataUploads,
            [SAMPLE_INFO_FIELD_NAME]: [newUploadContent(v, 'sample-info.txt')],
          })
        }
        placeholder={
          'Describe your samples here using free text or a table. For example, you can provide the relevant'
          + ' Methods section from the associated paper or sample metadata from supplementary files.\n\n'
          + 'If the sample names in your count file headers already describe the samples (e.g.'
          + ' \'male_3h_rep1\'), you don\'t need to repeat that here - though details such as time-series'
          + ' reference points or treatment specifics are still worth adding. But if those sample names are'
          + ' codes or numbers (e.g. \'S001\'), each one must appear somewhere in this description, with its'
          + ' meaning explained.\n\n'
          + 'State the units for any numbers you mention (e.g. \'age: 5 days\', not \'age: 5\').\n\n'
          + '*This text is submitted to the VEuPathDB AI Metadata Analyzer*, which uses it to describe your'
          + ' samples so you can compare groups (for example, treated vs. control) in your analysis.'
        }
        helpText={
          typeof formConfig.verbiage.formInputs!.samplesDescription!.helpText === 'function'
            ? formConfig.verbiage.formInputs!.samplesDescription!.helpText()
            : formConfig.verbiage.formInputs!.samplesDescription!.helpText
        }
      />
      <div className="column-2" style={{ textAlign: 'right', marginTop: '-1em' }}>
        <span
          style={{
            fontSize: '0.9em',
            color:
              utf8ByteLength(value ?? '') >
              SAMPLE_INFO_MAX_BYTES
                ? 'red'
                : '#666'
          }}
        >
          {utf8ByteLength(
            value ?? ''
          ).toLocaleString()}{' '}
          / {SAMPLE_INFO_MAX_BYTES.toLocaleString()} bytes
        </span>
      </div>
    </>
  );
}