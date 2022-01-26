import React, { useEffect, useState } from 'react';
import { uniq } from 'lodash';
import {
  Redirect,
  Route,
  RouteComponentProps,
  useLocation,
  useRouteMatch,
} from 'react-router';

// Functions
import { getAnalysisId } from '../core/utils/analysis';
import { cx } from './Utils';

// Definitions
import { AnalysisState } from '../core';
import { Status } from '../core';

// Hooks
import { useEntityCounts } from '../core/hooks/entityCounts';
import { usePrevious } from '../core/hooks/previousValue';
import { useStudyEntities } from '../core/hooks/study';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useStudyMetadata, useStudyRecord } from '../core';

// Components
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { AnalysisSummary } from './AnalysisSummary';
import { EntityDiagram } from '../core';
import { ComputationRoute } from './ComputationRoute';
import { DefaultVariableRedirect } from './DefaultVariableRedirect';
import Subsetting from './Subsetting';
import {
  ErrorBoundary,
  RecordController,
} from '@veupathdb/wdk-client/lib/Controllers';
import GlobalFiltersDialog from '../core/components/GlobalFiltersDialog';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import ShowHideVariableContextProvider from '../core/utils/show-hide-variable-context';
import NotesTab from './NotesTab';
import { Alert } from '@material-ui/lab';
import ShareFromAnalysis from './sharing/ShareFromAnalysis';

const AnalysisTabErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ErrorBoundary
    children={children}
    renderError={() => (
      <Alert severity="error" style={{ marginTop: 10 }}>
        We're sorry, something went wrong with this tab. Please change to
        another tab or{' '}
        {
          // Disabling error about invalid a tag href
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a href="" title="Reload the page.">
            reload the page
          </a>
        }{' '}
        to try again.
      </Alert>
    )}
  />
);

interface Props {
  analysisState: AnalysisState;
  hideCopyAndSave?: boolean;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /**
   * A callback to open a login form.
   * This is also passed down through several component layers. */
  showLoginForm: () => void;
}

/**
 * Welcome citizen! You have finally transvered the many layered labyrinth
 * of components to the place where an analysis is actually rendered.
 *
 * However, you aren't really done yet... there is some interesting
 * stuff going on here... it is a component that is displaying UI but
 * also acting as a router that toggles some of the displayed content.
 */
export function AnalysisPanel({
  analysisState,
  hideCopyAndSave = false,
  sharingUrlPrefix,
  showLoginForm,
}: Props) {
  const studyRecord = useStudyRecord();

  const {
    status,
    analysis,
    setName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis,
    setFilters,
  } = analysisState;

  const { url: routeBase } = useRouteMatch();
  const totalCounts = useEntityCounts();
  const filters = analysis?.descriptor.subset.descriptor;
  const filteredCounts = useEntityCounts(filters);
  const studyMetadata = useStudyMetadata();
  const entities = useStudyEntities(studyMetadata.rootEntity);
  const filteredEntities = uniq(filters?.map((f) => f.entityId));
  const location = useLocation();

  const [lastVarPath, setLastVarPath] = useState('');
  const [lastVizPath, setLastVizPath] = useState('');
  const [globalFiltersDialogOpen, setGlobalFiltersDialogOpen] = useState(false);
  const [sharingModalVisible, setSharingModalVisible] = useState<boolean>(
    false
  );

  const analysisId = getAnalysisId(analysis);
  const previousAnalysisId = usePrevious(analysisId);

  useEffect(() => {
    if (
      previousAnalysisId === analysisId ||
      (previousAnalysisId == null && analysisId != null)
    ) {
      // Preserve the last variable and visualization visited if
      // the analysis id hasn't changed, or if transitioning from a
      // new to a saved analysis
      return;
    }

    setLastVarPath('');
    setLastVizPath('');
  }, [previousAnalysisId, analysisId]);

  useEffect(() => {
    const relativePath = location.pathname.replace(routeBase, '');
    if (relativePath.startsWith('/variables')) {
      setLastVarPath(relativePath.replace('/variables', ''));
    } else if (relativePath.startsWith('/visualizations')) {
      setLastVizPath(relativePath.replace('/visualizations', ''));
    }
  }, [location, routeBase]);

  useSetDocumentTitle(
    analysis
      ? `${analysis?.displayName} - ${studyRecord.displayName}`
      : 'Analysis'
  );

  if (status === Status.Error)
    return (
      <div>
        <h2>Error</h2>
        <p>Could not load the analysis.</p>
      </div>
    );
  if (analysis == null) return <Loading />;
  return (
    <ShowHideVariableContextProvider>
      <ShareFromAnalysis
        visible={sharingModalVisible}
        toggleVisible={setSharingModalVisible}
        analysisState={analysisState}
        sharingUrlPrefix={sharingUrlPrefix}
        showLoginForm={showLoginForm}
      />
      <div className={cx('-Analysis')}>
        <AnalysisSummary
          analysis={analysis}
          setAnalysisName={setName}
          copyAnalysis={hideCopyAndSave ? undefined : copyAnalysis}
          saveAnalysis={saveAnalysis}
          deleteAnalysis={hideCopyAndSave ? undefined : deleteAnalysis}
          onFilterIconClick={() =>
            setGlobalFiltersDialogOpen(!globalFiltersDialogOpen)
          }
          globalFiltersDialogOpen={globalFiltersDialogOpen}
          displaySharingModal={() => setSharingModalVisible(true)}
        />
        <GlobalFiltersDialog
          open={globalFiltersDialogOpen}
          setOpen={setGlobalFiltersDialogOpen}
          entities={entities}
          filters={analysis.descriptor.subset.descriptor}
          setFilters={setFilters}
          removeFilter={(filter) =>
            setFilters(
              analysis.descriptor.subset.descriptor.filter((f) => f !== filter)
            )
          }
        />
        <Route
          path={[
            `${routeBase}/variables/:entityId?/:variableId?`,
            `${routeBase}`,
          ]}
          render={(
            props: RouteComponentProps<{
              entityId?: string;
              variableId?: string;
            }>
          ) => (
            <div className="Entities">
              <EntityDiagram
                expanded
                orientation="horizontal"
                selectedEntity={props.match.params.entityId}
                selectedVariable={props.match.params.variableId}
                entityCounts={totalCounts.value}
                filteredEntityCounts={filteredCounts.value}
                filteredEntities={filteredEntities}
              />
            </div>
          )}
        />
        <WorkspaceNavigation
          heading={<></>}
          routeBase={routeBase}
          items={[
            {
              display: 'View study details',
              route: `/details`,
              exact: false,
              replace: true,
            },
            {
              display: 'Browse and subset',
              route: `/variables${lastVarPath}`,
              exact: false,
              replace: true,
            },
            {
              display: 'Visualize',
              // check whether user is at viz
              route: location.pathname
                .replace(routeBase, '')
                .startsWith('/visualizations')
                ? '/visualizations'
                : `/visualizations${lastVizPath}`,
              exact: false,
              replace: true,
            },
            {
              display: 'Notes',
              route: '/notes',
            },
          ]}
        />
        <Route
          path={routeBase}
          exact
          render={() => <Redirect to={`${routeBase}/variables`} />}
        />
        <Route
          path={`${routeBase}/details`}
          render={() => (
            <AnalysisTabErrorBoundary>
              <RecordController
                recordClass="dataset"
                primaryKey={studyRecord.id.map((p) => p.value).join('/')}
              />
            </AnalysisTabErrorBoundary>
          )}
        />
        <Route
          path={`${routeBase}/variables/:entityId?`}
          exact
          render={(props) => (
            <DefaultVariableRedirect {...props.match.params} />
          )}
        />
        <Route
          path={`${routeBase}/variables/:entityId/:variableId`}
          exact
          render={(
            props: RouteComponentProps<{ entityId: string; variableId: string }>
          ) => (
            <AnalysisTabErrorBoundary>
              <Subsetting
                {...props.match.params}
                analysisState={analysisState}
                totalCounts={totalCounts.value}
                filteredCounts={filteredCounts.value}
              />
            </AnalysisTabErrorBoundary>
          )}
        />
        <Route
          path={`${routeBase}/visualizations`}
          render={() => (
            <AnalysisTabErrorBoundary>
              <ComputationRoute
                analysisState={analysisState}
                totalCounts={totalCounts}
                filteredCounts={filteredCounts}
              />
            </AnalysisTabErrorBoundary>
          )}
        />
        <Route
          path={`${routeBase}/notes`}
          render={() => (
            <AnalysisTabErrorBoundary>
              <NotesTab analysisState={analysisState} />
            </AnalysisTabErrorBoundary>
          )}
        />
      </div>
    </ShowHideVariableContextProvider>
  );
}
