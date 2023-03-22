import { useState, useMemo } from 'react';
import { debounce } from 'lodash';

// Definitions
import { AnalysisState } from '../../core';

// Components
import MultilineTextField, {
  MultilineTextFieldProps,
} from '@veupathdb/coreui/dist/components/forms/MultilineTextField';

type props = {
  analysisState: AnalysisState;
};

export default function NotesTab({ analysisState }: props) {
  const {
    setDescription: setAnalysisDescription,
    setNotes: setAnalysisNotes,
  } = analysisState;

  const [description, setDescription] = useState(
    analysisState.analysis?.description ?? ''
  );
  const [details, setDetails] = useState(analysisState.analysis?.notes ?? '');

  const [descriptionStatus, setDescriptionStatus] = useState<
    MultilineTextFieldProps['status']
  >();
  const [detailsStatus, setDetailsStatus] = useState<
    MultilineTextFieldProps['status']
  >();

  const syncDescriptionToAnalysis = useMemo(
    () =>
      debounce((value: string) => {
        setAnalysisDescription(value);
        setDescriptionStatus('synced');
      }, 1000),
    [setAnalysisDescription]
  );

  const syncDetailsToAnalysis = useMemo(
    () =>
      debounce((value: string) => {
        setAnalysisNotes(value);
        setDetailsStatus('synced');
      }, 1000),
    [setAnalysisNotes]
  );

  return (
    <div
      style={{
        marginTop: 35,
        marginBottom: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MultilineTextField
        heading="Analysis Description"
        instructions='Provide a brief summary of the analysis. This will appear in the "Description" column in the My analyses and Public analyses tables.'
        width="60vw"
        height="17.5vh"
        characterLimit={255}
        value={description}
        onValueChange={(value) => {
          setDescription(value);
          setDescriptionStatus('syncing');
          syncDescriptionToAnalysis(value);
        }}
        status={descriptionStatus}
      />

      <MultilineTextField
        heading="Analysis Details"
        instructions="Record details of your analysis for yourself and those you share it with."
        width="60vw"
        height="50vh"
        value={details}
        onValueChange={(value) => {
          setDetails(value);
          setDetailsStatus('syncing');
          syncDetailsToAnalysis(value);
        }}
        status={detailsStatus}
        containerStyles={{ paddingTop: 25 }}
      />
    </div>
  );
}
