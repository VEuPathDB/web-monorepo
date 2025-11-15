import React from 'react';
import { State } from '@veupathdb/wdk-client/lib/StoreModules/DownloadFormStoreModule';

interface ZippedFilesReporterFormProps {
  onSubmit: () => void;
  includeSubmit: boolean;
}

interface ZippedFilesReporterFormState {}

interface ZippedFilesReporterFormUiState {}

const ZippedFilesReporterForm: React.FC<ZippedFilesReporterFormProps> & {
  getInitialState: (downloadFormStoreState: State) => {
    formState: ZippedFilesReporterFormState;
    formUiState: ZippedFilesReporterFormUiState;
  };
} = (props) => {
  const { onSubmit, includeSubmit } = props;
  return (
    <div className="eupathdb-ReporterFormWrapper">
      <h3>Generate a ZIP file containing your selected file records</h3>
      {includeSubmit && (
        <div className="eupathdb-ReporterFormSubmit">
          <button className="btn" type="submit" onClick={onSubmit}>
            Get ZIP file
          </button>
        </div>
      )}
    </div>
  );
};

ZippedFilesReporterForm.getInitialState = (downloadFormStoreState: State) => {
  return {
    formState: {},
    formUiState: {},
  };
};

export default ZippedFilesReporterForm;
