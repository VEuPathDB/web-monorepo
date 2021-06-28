import React, { useEffect, useState } from 'react';
import { cx } from './Utils';
import { AnalysisSummary } from './AnalysisSummary';
import {
  EntityDiagram,
  Status,
  useAnalysis,
  useStudyMetadata,
  useStudyRecord,
} from '../core';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import {
  Redirect,
  Route,
  RouteComponentProps,
  useLocation,
  useRouteMatch,
} from 'react-router';
import { ComputationRoute } from './ComputationRoute';
import { DefaultVariableRedirect } from './DefaultVariableRedirect';
import { Subsetting } from './Subsetting';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { uniq } from 'lodash';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import GlobalFiltersDialog from '../core/components/GlobalFiltersDialog';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

interface Props {
  analysisId: string;
}

export function AnalysisPanel(props: Props) {
  const { analysisId } = props;
  const studyRecord = useStudyRecord();
  const analysisState = useAnalysis(analysisId);
  const {
    status,
    analysis,
    setName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis,
  } = analysisState;
  const { url: routeBase } = useRouteMatch();
  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(analysisState.analysis?.filters);
  const studyMetadata = useStudyMetadata();
  const entities = Array.from(
    preorder(
      studyMetadata.rootEntity,
      (e) => e.children?.slice().reverse() ?? []
    )
  );
  const filteredEntities = uniq(
    analysisState.analysis?.filters.map((f) => f.entityId)
  );
  const location = useLocation();
  const [lastVarPath, setLastVarPath] = useState('');
  const [lastVizPath, setLastVizPath] = useState('');
  const [globalFiltersDialogOpen, setGlobalFiltersDialogOpen] = useState(false);

  useEffect(() => {
    const relativePath = location.pathname.replace(routeBase, '');
    if (relativePath.startsWith('/variables')) {
      setLastVarPath(relativePath.replace('/variables', ''));
    } else if (relativePath.startsWith('/visualizations')) {
      setLastVizPath(relativePath.replace('/visualizations', ''));
    }
  }, [location, routeBase]);
  if (status === Status.Error)
    return (
      <div>
        <h2>Error</h2>
        <p>Could not load the analysis analysis.</p>
      </div>
    );
  if (analysis == null) return null;
  return (
    <div className={cx('-Analysis')}>
      <AnalysisSummary
        analysis={analysis}
        setAnalysisName={setName}
        copyAnalysis={copyAnalysis}
        saveAnalysis={saveAnalysis}
        deleteAnalysis={deleteAnalysis}
        onFilterIconClick={() =>
          setGlobalFiltersDialogOpen(!globalFiltersDialogOpen)
        }
      />
      {globalFiltersDialogOpen && (
        <GlobalFiltersDialog
          setOpen={setGlobalFiltersDialogOpen}
          entities={entities}
          filters={analysis.filters}
          setFilters={analysisState.setFilters}
          removeFilter={(filter) =>
            analysisState.setFilters(
              analysis.filters.filter((f) => f !== filter)
            )
          }
        />
      )}
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
          },
          {
            display: 'Browse and subset',
            route: `/variables${lastVarPath}`,
            exact: false,
          },
          {
            display: 'Visualize',
            route: `/visualizations${lastVizPath}`,
            exact: false,
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
          <RecordController
            recordClass="dataset"
            primaryKey={studyRecord.id.map((p) => p.value).join('/')}
          />
        )}
      />
      <Route
        path={`${routeBase}/variables/:entityId?`}
        exact
        render={(props) => <DefaultVariableRedirect {...props.match.params} />}
      />
      <Route
        path={`${routeBase}/variables/:entityId/:variableId`}
        exact
        render={(
          props: RouteComponentProps<{ entityId: string; variableId: string }>
        ) => (
          <Subsetting analysisState={analysisState} {...props.match.params} />
        )}
      />
      <Route
        path={`${routeBase}/visualizations`}
        render={() => <ComputationRoute analysisState={analysisState} />}
      />
    </div>
  );
}
