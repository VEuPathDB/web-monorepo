// Components
import { FloatingButton, Warning, Copy, colors } from '@veupathdb/coreui';

// Hooks
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

type ConfirmShareAnalysisProps = {
  contextForUserDataset?: {
    isUserStudy: boolean;
    isCurrentUserStudyManager: boolean;
  };
  sharingUrl: string;
  sharingDatasetUrl?: string;
};

export default function ConfirmShareAnalysis({
  contextForUserDataset,
  sharingUrl,
  sharingDatasetUrl,
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 10,
            padding: 10,
            marginTop: 10,
            marginBottom: 10,
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
              {contextForUserDataset &&
              contextForUserDataset.isUserStudy &&
              sharingDatasetUrl ? (
                <>
                  <span
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {contextForUserDataset.isCurrentUserStudyManager
                      ? 'You own this study.'
                      : 'Another user owns this study.'}
                  </span>{' '}
                  <span>
                    {contextForUserDataset.isCurrentUserStudyManager
                      ? 'This analysis is only viewable to users who have been granted access to your study data.'
                      : 'The owner must grant all recipients of this shared analysis access to the study data for the URL to work.'}
                  </span>{' '}
                  {contextForUserDataset.isCurrentUserStudyManager && (
                    <span>
                      To grant users access to your study data,{' '}
                      <a
                        href={sharingDatasetUrl}
                        style={{
                          fontWeight: 'bold',
                        }}
                      >
                        go to your study's status page
                      </a>{' '}
                      and click the "Grant Access to Study" button in the upper
                      right.
                    </span>
                  )}
                </>
              ) : (
                'Anyone with the link below will be able to get a copy of this analysis.'
              )}
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
                maxWidth: 500,
              }}
            >
              {contextForUserDataset &&
                contextForUserDataset.isUserStudy &&
                'The URL below can be used to share this analysis.'}{' '}
              When a recipient clicks the link, they receive a <em>copy</em> of
              the <em>latest version</em>.
            </p>
            <p
              style={{
                fontSize: '.9rem',
                color: gray[600],
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
          To share this analysis, copy and paste the URL below
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
            onPress={() => navigator.clipboard.writeText(sharingUrl)}
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
          <p style={{ margin: 0, flex: 1 }}>{sharingUrl}</p>
        </div>
      </div>
    </div>
  );
}
