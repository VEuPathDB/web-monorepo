import React from 'react';
import { cx } from './Utils';
import { AnalysisSummary } from './AnalysisSummary';
import { useAnalysis, useStudy } from '@veupathdb/eda-workspace-core';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { Redirect, Route } from 'react-router';
import { Variables } from './Variables';

export function EDAAnalysis() {
  const {
    history,
    setName,
    copyAnalysis,
    saveAnalysis,
    deleteAnalysis,
  } = useAnalysis();
  const { studyRecord } = useStudy();
  if (history.current == null) return null;
  const routeBase = `/eda/${studyRecord.id.map((p) => p.value).join('/')}/${
    history.current.id
  }`;
  return (
    <div className={cx('-Analysis')}>
      <WorkspaceNavigation
        heading={
          <AnalysisSummary
            analysis={history.current}
            setAnalysisName={setName}
            copyAnalysis={copyAnalysis}
            saveAnalysis={saveAnalysis}
            deleteAnalysis={deleteAnalysis}
          />
        }
        routeBase={routeBase}
        items={[
          {
            display: 'Browse and subset',
            route: '/variables',
          },
          {
            display: 'Visualize',
            route: '/visualizations',
          },
        ]}
      />
      <Route
        path={routeBase}
        exact
        render={() => <Redirect to={`${routeBase}/variables`} />}
      />
      <Route path={`${routeBase}/variables`} component={Variables} />
      <Route
        path={`${routeBase}/visualizations`}
        component={() => <h3>TODO</h3>}
      />
    </div>
  );
}
