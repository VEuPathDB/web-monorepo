import React from 'react';
import { RadioList, Checkbox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

/** @type import('./Types').ReporterFormComponent */
let FastaOrthoSequenceReporterForm = (props) => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = (fieldName) =>
    util.getChangeHandler(fieldName, updateFormState, formState);

  return (
    <div>
      <h3>Output options:</h3>
      <div style={{ marginLeft: '2em' }}>
        <div style={{ display: 'block' }}>
          <Checkbox
            value={formState.includeOrganism}
            onChange={getUpdateHandler('includeOrganism')}
          />{' '}
          Include organism
        </div>
        <div style={{ display: 'block' }}>
          <Checkbox
            value={formState.includeDescription}
            onChange={getUpdateHandler('includeDescription')}
          />{' '}
          Include description
        </div>
        <div style={{ display: 'block' }}>
          <Checkbox
            value={formState.includeGroup}
            onChange={getUpdateHandler('includeGroup')}
          />{' '}
          Include group
        </div>
      </div>
      <hr />
      <h3>Download Type:</h3>
      <div style={{ marginLeft: '2em' }}>
        <RadioList
          value={formState.attachmentType}
          items={util.attachmentTypes}
          onChange={getUpdateHandler('attachmentType')}
        />
      </div>
      {includeSubmit && (
        <div style={{ margin: '0.8em' }}>
          <button className="btn" type="submit" onClick={onSubmit}>
            Download
          </button>
        </div>
      )}
    </div>
  );
};

FastaOrthoSequenceReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    includeOrganism: true,
    includeDescription: true,
    includeGroup: true,
  },
  formUiState: {},
});

export default FastaOrthoSequenceReporterForm;
