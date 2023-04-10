// Components
import { FloatingButton, H5, Warning, Copy, colors } from '@veupathdb/coreui';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

// Hooks
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

import { isUserDatasetsCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service/UserDatasetWrappers';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/wdk-client/lib/Utils/diyDatasets';

type ConfirmShareAnalysisProps = {
  showContextForOwnedUserDataset: boolean;
  sharingUrl: string;
  sharingDatasetUrl: string | undefined;
  studyId: string;
};

export default function ConfirmShareAnalysis({
  showContextForOwnedUserDataset,
  sharingUrl,
  sharingDatasetUrl,
  studyId,
}: ConfirmShareAnalysisProps) {
  const theme = useUITheme();
  const userStudy = useWdkService(
    async (wdkService) => {
      if (
        isUserDatasetsCompatibleWdkService(wdkService) &&
        showContextForOwnedUserDataset
      ) {
        return wdkService.getUserDataset(
          wdkRecordIdToDiyUserDatasetId(studyId)
        );
      }
    },
    [studyId, showContextForOwnedUserDataset]
  );

  const isLoading = showContextForOwnedUserDataset && !userStudy;
  const showUrl =
    !showContextForOwnedUserDataset ||
    (userStudy && Boolean(userStudy.sharedWith?.length));

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
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <H5
              text="Sharing URL"
              additionalStyles={{ marginTop: 15, marginBottom: 0 }}
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
                  {showContextForOwnedUserDataset && sharingDatasetUrl ? (
                    <>
                      <span
                        style={{
                          color: theme?.palette.primary.hue[600] ?? gray[600],
                          fontWeight: 'bold',
                        }}
                      >
                        This is a User Study.
                      </span>{' '}
                      {!showUrl && (
                        <span>
                          Our records indicate that you have not shared this
                          study before.{' '}
                        </span>
                      )}
                      <span>
                        You must <a href={sharingDatasetUrl}>share the study</a>{' '}
                        with whomever you share this analysis before the
                        recipient can view the analysis.
                      </span>
                    </>
                  ) : (
                    'Anyone with the link below will be able to get a copy of this analysis.'
                  )}
                </p>
                {showUrl && (
                  <>
                    <p
                      style={{
                        fontSize: '.9rem',
                        color: gray[600],
                        maxWidth: 500,
                      }}
                    >
                      When a recipient clicks the link, they receive a{' '}
                      <em>copy</em> of the <em>latest version</em>.
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
                      If you update or delete your analysis, preexisting copies
                      will not be affected.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          {showUrl && (
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
          )}
        </>
      )}
    </div>
  );
}
