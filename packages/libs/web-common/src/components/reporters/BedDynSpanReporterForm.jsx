import React from 'react';
import { RadioList, Checkbox, TextBox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let deflineTypes = [
  {  value: 'short', display: 'ID Only' },
  {  value: 'full', display: 'Full Fasta Header' }
];

/** @type import('./Types').ReporterFormComponent */
const BedDynSpanReporterForm = props => {
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
          onChange={getUpdateHandler('deflineType')} items={deflineTypes}/>
      </div>
      { includeSubmit &&
        <div style={{margin:'0.8em'}}>
          <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
        </div>
      }
    </div>
  );
};

BedDynSpanReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    deflineType: deflineTypes[0].value,
  },
  formUiState: {}
});

export default BedDynSpanReporterForm;
