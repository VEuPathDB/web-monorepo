import React, { ReactNode, useEffect, useState } from 'react';
import { uniq } from 'lodash';
import Path from 'path';
import {
  Redirect,
  Route,
  RouteComponentProps,
  useLocation,
  useRouteMatch,
} from 'react-router';

// Functions
import { cx } from './Utils';

// Definitions
import { Status, useStudyEntities } from '../core';

// This is likely temporary, so not investing too much effort
// @ts-ignore
import betaImage from '../images/beta2-30.png';

// Hooks
import { useEntityCounts } from '../core/hooks/entityCounts';
import { usePrevious } from '../core/hooks/previousValue';
import { isStubEntity } from '../core/hooks/study';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useStudyMetadata, useStudyRecord } from '../core';
import { useGeoConfig } from '../core/hooks/geoConfig';

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
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import ShowHideVariableContextProvider from '../core/utils/show-hide-variable-context';
import NotesTab from './NotesTab';
import DownloadTab from './DownloadTab';
import { Alert } from '@material-ui/lab';
import ShareFromAnalysis from './sharing/ShareFromAnalysis';
import { useAnalysis } from '../core/hooks/analysis';
import { ApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { DownloadClient } from '../core/api/DownloadClient';
import useUITheme from '@veupathdb/coreui/lib/components/theming/useUITheme';
import { VariableLinkConfig } from '../core/components/VariableLink';
import FilterChipList from '../core/components/FilterChipList';
import { Public } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { AnalysisError } from '../core/components/AnalysisError';

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
  analysisId?: string;
  studyId: string;
  hideSavedAnalysisButtons?: boolean;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /**
   * A callback to open a login form.
   * This is also passed down through several component layers. */
  showLoginForm: () => void;
  /** API client that will be used in the Download Tab */
  downloadClient: DownloadClient;
  singleAppMode?: string;
  showUnreleasedData: boolean;
  helpTabContents?: ReactNode;
  isStudyExplorerWorkspace?: boolean;
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
  analysisId,
  studyId,
  hideSavedAnalysisButtons = false,
  sharingUrlPrefix,
  showLoginForm,
  downloadClient,
  singleAppMode,
  showUnreleasedData,
  helpTabContents,
  isStudyExplorerWorkspace = false,
}: Props) {
  const studyRecord = useStudyRecord();
  const analysisState = useAnalysis(analysisId, singleAppMode);

  const {
    status,
    error,
    analysis,
    setName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis,
    setFilters,
  } = analysisState;
  const themePrimaryColor = useUITheme()?.palette.primary;
  const { url: routeBase } = useRouteMatch();
  const totalCounts = useEntityCounts();
  const filters = analysis?.descriptor.subset.descriptor;
  const filteredCounts = useEntityCounts(filters);
  const studyMetadata = useStudyMetadata();
  const entities = useStudyEntities();
  const filteredEntities = uniq(filters?.map((f) => f.entityId));
  const geoConfigs = useGeoConfig(entities);
  const location = useLocation();
  const mapLink =
    geoConfigs.length > 0
      ? routeBase.replace('/analyses/', '/maps/')
      : undefined;

  const [lastVarPath, setLastVarPath] = useState('');
  const [lastVizPath, setLastVizPath] = useState('');
  const [sharingModalVisible, setSharingModalVisible] =
    useState<boolean>(false);

  /**
   * Used in FilterChipList to highlight filter chip if/when an on-view Browse & Subset
   * var matches a filter chip. Logic is:
   * 1. check pathname to determine if Browse & Subset tab is selected
   * 2. split lastVarPath into an array structured as ['', entityId, variableId]
   */
  const isSubsetTabSelected = location.pathname.includes('variables');
  const lastVarPathList = lastVarPath.split('/');
  const selectedEntityId = isSubsetTabSelected ? lastVarPathList[1] : undefined;
  const selectedVariableId = isSubsetTabSelected
    ? lastVarPathList[2]
    : undefined;

  const permissionsValue = usePermissions();
  const approvalStatus: ApprovalStatus = permissionsValue.loading
    ? 'loading'
    : permissionsValue.permissions.perDataset[studyId] == null
    ? 'study-not-found'
    : permissionsValue.permissions.perDataset[studyId]?.actionAuthorization
        .subsetting
    ? 'approved'
    : 'not-approved';

  const isDatasetAUserStudy = Boolean(
    !permissionsValue.loading &&
      !hideSavedAnalysisButtons &&
      permissionsValue.permissions.perDataset[studyId]?.isUserStudy
  );
  const isCurrentUserStudyManager = Boolean(
    !permissionsValue.loading &&
      !hideSavedAnalysisButtons &&
      permissionsValue.permissions.perDataset[studyId]?.isManager
  );

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

  const variableLinkConfig: VariableLinkConfig = {
    type: 'link',
    makeVariableLink: (value) => {
      const { entityId, variableId } = value ?? {};
      const linkBase = `${routeBase}/variables`;
      if (entityId) {
        if (variableId) {
          return `${linkBase}/${entityId}/${variableId}`;
        }
        return `${linkBase}/${entityId}`;
      }
      return linkBase;
    },
  };

  if (error) {
    return <AnalysisError error={error} baseAnalysisPath={routeBase} />;
  }

  if (status === Status.Error)
    return (
      <div>
        <h2>Error</h2>
        <p>Could not load the analysis.</p>
      </div>
    );

  if (analysis == null || approvalStatus === 'loading') return <Loading />;

  if (
    (studyRecord.attributes.is_public === 'false' && !showUnreleasedData) ||
    approvalStatus === 'not-approved' ||
    isStubEntity(studyMetadata.rootEntity)
  )
    return <Redirect to={Path.normalize(routeBase + '/..')} />;

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <ShowHideVariableContextProvider>
        <EDAWorkspaceHeading
          analysisState={analysisState}
          isStudyExplorerWorkspace={isStudyExplorerWorkspace}
        />
        <ShareFromAnalysis
          visible={sharingModalVisible}
          toggleVisible={setSharingModalVisible}
          analysisState={analysisState}
          sharingUrlPrefix={sharingUrlPrefix}
          showLoginForm={showLoginForm}
          contextForUserDataset={{
            isUserStudy: isDatasetAUserStudy,
            isCurrentUserStudyManager,
          }}
        />
        <div
          css={
            themePrimaryColor
              ? {
                  '& .WorkspaceNavigation--Item': {
                    color: themePrimaryColor.hue[themePrimaryColor.level],
                  },
                }
              : undefined
          }
          className={cx('-Analysis')}
        >
          <AnalysisSummary
            analysis={analysis}
            setAnalysisName={setName}
            copyAnalysis={hideSavedAnalysisButtons ? undefined : copyAnalysis}
            saveAnalysis={saveAnalysis}
            deleteAnalysis={
              hideSavedAnalysisButtons ? undefined : deleteAnalysis
            }
            displaySharingModal={
              hideSavedAnalysisButtons
                ? undefined
                : () => setSharingModalVisible(true)
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
                  variableLinkConfig={variableLinkConfig}
                />
              </div>
            )}
          />
          <div className="EDAWorkspaceNavigation">
            <div className="FilterChips">
              <FilterChipList
                filters={filters}
                removeFilter={(filter) =>
                  analysis &&
                  setFilters(
                    analysis.descriptor.subset.descriptor.filter(
                      (f) => f !== filter
                    )
                  )
                }
                variableLinkConfig={variableLinkConfig}
                entities={entities}
                selectedEntityId={selectedEntityId}
                selectedVariableId={selectedVariableId}
              />
            </div>
            <WorkspaceNavigation
              heading={<></>}
              routeBase={routeBase}
              items={[
                {
                  display: 'View Study Details',
                  route: `/details`,
                  exact: false,
                },
                {
                  display: 'Browse and Subset',
                  route: `/variables${lastVarPath}`,
                  exact: false,
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
                },
                {
                  display: 'Download',
                  route: '/download',
                },
                {
                  display: 'Record Notes',
                  route: '/notes',
                },
              ].concat(
                isStudyExplorerWorkspace
                  ? {
                      display: 'Learn',
                      route: '/learn',
                    }
                  : []
              )}
            />
            {mapLink && (
              <Link
                to={mapLink}
                style={{
                  color: themePrimaryColor?.hue[themePrimaryColor?.level],
                  paddingLeft: 10,
                  paddingRight: 10,
                  fontSize: '1.2em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.5ex',
                  position: 'absolute',
                  right: '0',
                  bottom: '.5em',
                }}
              >
                <Public /> Explore in Interactive Map{' '}
                <img alt="BETA" src={betaImage} />
              </Link>
            )}
          </div>
          <Route
            path={routeBase}
            exact
            render={() =>
              approvalStatus === 'approved' && (
                <Redirect to={`${routeBase}/variables`} />
              )
            }
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
              props: RouteComponentProps<{
                entityId: string;
                variableId: string;
              }>
            ) => (
              <AnalysisTabErrorBoundary>
                <Subsetting
                  {...props.match.params}
                  variableLinkConfig={variableLinkConfig}
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
                  geoConfigs={geoConfigs}
                  singleAppMode={singleAppMode}
                />
              </AnalysisTabErrorBoundary>
            )}
          />
          <Route
            path={`${routeBase}/download`}
            render={() => (
              <AnalysisTabErrorBoundary>
                <DownloadTab
                  analysisState={analysisState}
                  totalCounts={totalCounts.value}
                  filteredCounts={filteredCounts.value}
                  downloadClient={downloadClient}
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
          <Route
            path={`${routeBase}/learn`}
            render={() => (
              <AnalysisTabErrorBoundary>
                {helpTabContents}
              </AnalysisTabErrorBoundary>
            )}
          />
        </div>
      </ShowHideVariableContextProvider>
    </RestrictedPage>
  );
}
