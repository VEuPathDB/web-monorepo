// Components
import { FloatingButton, H5, Warning, Copy, colors } from '@veupathdb/coreui';

// Hooks
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

type ConfirmShareAnalysisProps = { sharingURL: string };

export default function ConfirmShareAnalysis({
  sharingURL,
}: ConfirmShareAnalysisProps) {
  const theme = useUITheme();

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: 25,
      }}
    >
      <div style={{ flex: 1 }}>
        <H5
          text="Sharing URL"
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
                color: gray[600],
                maxWidth: 500,
              }}
            >
              Anyone with the link below will be able to get a copy of this
              analysis.
            </p>

            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
                maxWidth: 500,
              }}
            >
              When a recipient clicks the link, they receive a <em>copy</em> of
              the <em>latest version</em>.
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: theme?.palette.primary.hue[600] ?? gray[600],
                maxWidth: 500,
                fontWeight: 'bold',
                marginTop: 0,
              }}
            >
              If you update or delete your analysis, preexisting copies will not
              be affected.
            </p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            marginBottom: 3,
            fontSize: 13,
            fontFamily: 'Inter',
            fontWeight: 500,
            color: gray[600],
          }}
        >
          To share, copy and paste the URL below
        </p>
        <div
          style={{
            fontFamily: '"Roboto",sans-serif',
            fontStyle: 'normal',
            fontSize: '0.8rem',
            fontWeight: 400,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 5,
            maxWidth: '65%',
            color: gray[500],
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <FloatingButton
            themeRole="secondary"
            ariaLabel="Copy URL to Clipboard"
            icon={Copy}
            tooltip="Copy URL to Clipboard"
            onPress={() => navigator.clipboard.writeText(sharingURL)}
            styleOverrides={{
              container: { marginLeft: 10, marginRight: 5, padding: 0 },
              hover: { color: 'transparent' },
              pressed: {
                color: 'transparent',
                textColor:
                  theme?.palette.secondary.hue[
                    theme?.palette.secondary.level + 100
                  ],
              },
            }}
          />
          <p style={{ margin: 0, flex: 1 }}>{sharingURL}</p>
        </div>
      </div>
    </div>
  );
}
