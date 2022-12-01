import React from 'react';
import { RadioList } from '@veupathdb/wdk-client/lib/Components';
import { deflineFieldOptions, ComponentsList } from './BedFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';


let util = Object.assign({}, ComponentUtils, ReporterUtils);

/** @type import('./Types').ReporterFormComponent */
const BedSegmentableSequenceReporterForm = props => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);

  return (
    <div>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="attachmentType" value={formState.attachmentType} items={util.attachmentTypes}
            onChange={getUpdateHandler('attachmentType')}/>
      </div>
      <h3>Fasta defline:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="deflineType" value={formState.deflineType}
          onChange={getUpdateHandler('deflineType')} items={[
            {  value: "short", display: 'ID Only' },
            { 
              value: "full", display: 'Full Fasta Header',
              body: (<ComponentsList field="deflineFields" features={deflineFieldOptions} formState={formState} getUpdateHandler={getUpdateHandler} />),
            }
            ]}/>
      </div>
      { includeSubmit &&
        <div style={{margin:'0.8em'}}>
          <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
        </div>
      }
    </div>
  );
};

BedSegmentableSequenceReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    deflineType: "short",
    deflineFields: deflineFieldOptions.map((x) => x.value),
  },
  formUiState: {}
});

export default BedSegmentableSequenceReporterForm;

