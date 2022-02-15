import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Path from 'path';

// Components
import {
  // Download,
  Table,
} from '@veupathdb/core-components/dist/components/icons';

import FloatingButton from '@veupathdb/core-components/dist/components/buttons/FloatingButton';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AnalysisNameDialog } from './AnalysisNameDialog';
import AddIcon from '@material-ui/icons/Add';

// Hooks
import { useStudyRecord } from '../core/hooks/workspace';

// Definitions & Utilities
import { cx } from './Utils';
import { AnalysisState, DEFAULT_ANALYSIS_NAME } from '../core';
import { getAnalysisId, isSavedAnalysis } from '../core/utils/analysis';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';

interface EDAWorkspaceHeadingProps {
  /** Optional AnalysisState for "New analysis" button functionality */
  analysisState?: AnalysisState;
}

/** Study Header Component */
export function EDAWorkspaceHeading({
  analysisState,
}: EDAWorkspaceHeadingProps) {
  const studyRecord = useStudyRecord();
  // const attemptAction = useAttemptActionCallback();
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
  const showButtons =
    !permissionsValue.loading &&
    Boolean(
      permissionsValue.permissions.perDataset[
        studyRecord.attributes.dataset_id as string
      ]?.actionAuthorization.subsetting
    );

  useEffect(() => {
    setDialogIsOpen(false);
  }, [analysisId]);

  return (
    <>
      <div className={cx('-Heading')}>
        <h1>{safeHtml(studyRecord.displayName)}</h1>
        {showButtons && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>
              <FloatingButton
                themeRole="primary"
                text="New Analysis"
                tooltip="Create a new analysis"
                size="medium"
                // @ts-ignore
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
                tooltip="View all your analyses of this study"
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
            newName && analysisState.setName(newName)
          }
          redirectToNewAnalysis={redirectToNewAnalysis}
        />
      )}
    </>
  );
}
