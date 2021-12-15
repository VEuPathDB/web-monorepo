import { H5 } from '@veupathdb/core-components';
import { FilledButton } from '@veupathdb/core-components/dist/components/buttons';

import { useUITheme } from '@veupathdb/core-components/dist/components/theming';
import { gray } from '@veupathdb/core-components/dist/definitions/colors';

type ConfirmAnalysisSharingProps = {
  makeAnalysisPublic: () => void;
  toggleVisible: (visible: boolean) => void;
};

export default function ConfirmPublicAnalysis({
  makeAnalysisPublic,
  toggleVisible,
}: ConfirmAnalysisSharingProps) {
  const theme = useUITheme();

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: 1 }}>
        <H5
          text="Confirmation"
          additionalStyles={{ marginTop: 25, marginBottom: 0 }}
        />
        <p
          style={{
            fontSize: '.9rem',
            color: theme?.palette.primary.hue[600] ?? gray[600],
            maxWidth: 500,
            fontWeight: 'bold',
            marginTop: 0,
          }}
        >
          You are about to make this analysis public.
        </p>
        <p
          style={{
            fontSize: '.9rem',
            color: gray[600],
            maxWidth: 500,
          }}
        >
          This analysis will appear on the ClinEpiDB Public analyses page. When
          someone clicks on the public link, they will get a copy of the latest
          version.
        </p>
        <p
          style={{
            fontSize: '.9rem',
            color: gray[600],
            maxWidth: 500,
          }}
        >
          If you update or delete your analysis, preexisting copies will not be
          affected. You can make this analysis private again later, but
          preexisting copies will not be affected.
        </p>
      </div>
      <FilledButton
        text="Make Analysis Public"
        themeRole="secondary"
        onPress={() => {
          makeAnalysisPublic();
          toggleVisible(false);
        }}
        styleOverrides={{ container: { flex: 1, marginTop: 25 } }}
      />
    </div>
  );
}
