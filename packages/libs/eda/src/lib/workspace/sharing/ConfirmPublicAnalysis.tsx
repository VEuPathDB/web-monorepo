import { Link } from 'react-router-dom';

import { H5, Warning } from '@veupathdb/coreui';
import { FilledButton } from '@veupathdb/coreui/dist/components/buttons';

import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import colors, { gray } from '@veupathdb/coreui/dist/definitions/colors';

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
        paddingBottom: 25,
      }}
    >
      <div style={{ flex: 1 }}>
        <H5
          text="Confirmation"
          additionalStyles={{ marginTop: 25, marginBottom: 0 }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 10,
            padding: 10,
            marginTop: 10,
            marginBottom: 20,
            borderColor: theme?.palette.primary.hue[500],
          }}
        >
          <Warning fontSize={48} fill={colors.orange[500]} />
          <div style={{ marginLeft: 15 }}>
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
              This analysis will appear on the{' '}
              <Link
                to="/eda/public"
                target="_blank"
                style={{ color: theme?.palette.primary.hue[600] }}
              >
                Public analyses page.
              </Link>
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
                maxWidth: 500,
              }}
            >
              When someone clicks on the public link, they will get a copy of
              the latest version.
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
                maxWidth: 500,
              }}
            >
              If you update or delete your analysis, preexisting copies will not
              be affected.
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
                maxWidth: 500,
              }}
            >
              You can make this analysis private again later, but preexisting
              copies will not be affected.
            </p>
          </div>
        </div>
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
