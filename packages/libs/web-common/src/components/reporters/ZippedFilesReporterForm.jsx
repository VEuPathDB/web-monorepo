import React from 'react';

let ZippedFilesReporterForm = props => {
  let { onSubmit, includeSubmit  } = props;
  return (
    <div className='eupathdb-ReporterFormWrapper'>
      <h3>Generate a ZIP file containing your selected file records</h3>
      { includeSubmit &&
        <div className="eupathdb-ReporterFormSubmit">
          <button className="btn" type="submit" onClick={onSubmit}>Get ZIP file</button>
        </div>
      }
    </div>
  );
};

ZippedFilesReporterForm.getInitialState = (downloadFormStoreState) => {
  return {
    formState: {},
    formUiState: {}
  };
};

export default ZippedFilesReporterForm;
