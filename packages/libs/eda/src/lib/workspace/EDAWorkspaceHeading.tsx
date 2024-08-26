import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Path from 'path';

// Components
import { H3, H4, Table, FloatingButton, FilledButton } from '@veupathdb/coreui';

import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import AnalysisNameDialog from './AnalysisNameDialog';
import AddIcon from '@material-ui/icons/Add';

// Hooks
import { useStudyMetadata, useStudyRecord } from '../core/hooks/workspace';

// Definitions & Utilities
import { cx } from './Utils';
import { AnalysisState, DEFAULT_ANALYSIS_NAME } from '../core';
import { getAnalysisId, isSavedAnalysis } from '../core/utils/analysis';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { getStudyAccess } from '@veupathdb/study-data-access/lib/shared/studies';
import { shouldOfferLinkToDashboard } from '@veupathdb/study-data-access/lib/study-access/permission';
import { isStubEntity } from '../core/hooks/study';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface EDAWorkspaceHeadingProps {
  /** Optional AnalysisState for "New analysis" button functionality */
  analysisState?: AnalysisState;
  isStudyExplorerWorkspace?: boolean;
}

/** Study Header Component */
export function EDAWorkspaceHeading({
  analysisState,
  isStudyExplorerWorkspace = false,
}: EDAWorkspaceHeadingProps) {
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const analysis = analysisState?.analysis;
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const { url } = useRouteMatch();
  const redirectURL = url.endsWith(studyRecord.id[0].value)
    ? `${url}/new`
    : Path.resolve(url, '../new');
  const history = useHistory();
  const redirectToNewAnalysis = () => history.push(redirectURL);

  const analysisId = getAnalysisId(analysis);

  const permissionsValue = usePermissions();

  // Default to `public`, if attribute is not defined
  const studyAccess = getStudyAccess(studyRecord) ?? 'public';

  const showButtons =
    !permissionsValue.loading &&
    Boolean(
      permissionsValue.permissions.perDataset[
        studyRecord.attributes.dataset_id as string
      ]?.actionAuthorization.subsetting
    ) &&
    !isStubEntity(studyMetadata.rootEntity);

  useEffect(() => {
    setDialogIsOpen(false);
  }, [analysisId]);

  return (
    <>
      <div className={cx('-Heading')}>
        {isStudyExplorerWorkspace ? (
          <div>
            <H3 additionalStyles={{ padding: 0, fontWeight: 500 }}>
              <em>Study Explorer</em>
            </H3>
            <H4 additionalStyles={{ fontWeight: 400 }}>
              {safeHtml(studyRecord.displayName)}
            </H4>
          </div>
        ) : (
          <H3 additionalStyles={{ padding: 0 }}>
            {safeHtml(studyRecord.displayName)}
          </H3>
        )}
        <div>
          {!permissionsValue.loading &&
            !studyMetadata.isUserStudy &&
            studyAccess.toLowerCase() !== 'public' &&
            shouldOfferLinkToDashboard(
              permissionsValue.permissions,
              studyRecord.id[0].value
            ) && (
              <div style={{ marginLeft: '1em' }}>
                <FilledButton
                  themeRole="primary"
                  text="Management Dashboard"
                  tooltip="Manage user access to study data"
                  textTransform="capitalize"
                  size="medium"
                  onPress={() =>
                    history.push(`/study-access/${studyRecord.id[0].value}`)
                  }
                />
              </div>
            )}
        </div>
        <div style={{ height: '100%' }}>
          {showButtons && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: isStudyExplorerWorkspace ? 'flex-end' : 'center',
                height: '100%',
              }}
            >
              <div>
                <FloatingButton
                  themeRole="primary"
                  text="New analysis"
                  tooltip="Create a new analysis"
                  textTransform="capitalize"
                  size="medium"
                  icon={AddIcon}
                  onPress={
                    /** If (1) there is no analysis, (2) we're in an unsaved new
                     * analysis (here `analysis` is still undefined in this case),
                     * or (3) we're in a renamed analysis, just go straight to the
                     * new analysis. Otherwise, show the renaming dialog. */
                    analysis && analysis.displayName === DEFAULT_ANALYSIS_NAME
                      ? () => setDialogIsOpen(true)
                      : redirectToNewAnalysis
                  }
                />
              </div>
              <div>
                <FloatingButton
                  themeRole="primary"
                  text="My analyses"
                  textTransform="capitalize"
                  tooltip="View all of your analyses for this study"
                  icon={Table}
                  onPress={() =>
                    history.push(
                      '/eda?s=' + encodeURIComponent(studyRecord.displayName)
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
        {analysisState && isSavedAnalysis(analysis) && (
          <AnalysisNameDialog
            isOpen={dialogIsOpen}
            setIsOpen={setDialogIsOpen}
            initialAnalysisName={analysis.displayName}
            setAnalysisName={(newName) =>
              newName &&
              analysis.displayName !== newName &&
              analysisState.setName(newName)
            }
            redirectToNewAnalysis={redirectToNewAnalysis}
          />
        )}
      </div>
      {getStudyAccess(studyRecord) !== 'prerelease' &&
        isStubEntity(studyMetadata.rootEntity) && (
          <Banner
            banner={{
              type: 'info',
              message:
                'This study has not been integrated into the analysis workspace, but data files are available on the Download tab.',
            }}
          />
        )}
    </>
  );
}
