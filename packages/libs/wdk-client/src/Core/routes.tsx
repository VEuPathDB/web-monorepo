import React from 'react';
import { RouteComponentProps } from 'react-router';

import { RouteEntry, parseQueryString } from 'wdk-client/Core/RouteEntry';

import IndexController from 'wdk-client/Controllers/IndexController';
import RecordController from 'wdk-client/Controllers/RecordController';
import NotFoundController from 'wdk-client/Controllers/NotFoundController';
import AnswerController from 'wdk-client/Controllers/AnswerController';
import QuestionListController from 'wdk-client/Controllers/QuestionListController';
import DownloadFormController from 'wdk-client/Controllers/DownloadFormController';
import UserRegistrationController from 'wdk-client/Controllers/UserRegistrationController';
import UserProfileController from 'wdk-client/Controllers/UserProfileController';
import UserPasswordChangeController from 'wdk-client/Controllers/UserPasswordChangeController';
import UserPasswordResetController from 'wdk-client/Controllers/UserPasswordResetController';
import UserMessageController from 'wdk-client/Controllers/UserMessageController';
import SiteMapController from 'wdk-client/Controllers/SiteMapController';
import UserDatasetListController from 'wdk-client/Controllers/UserDatasetListController';
import UserDatasetDetailController from 'wdk-client/Controllers/UserDatasetDetailController';
import FavoritesController from 'wdk-client/Controllers/FavoritesController';
import QuestionController from 'wdk-client/Controllers/QuestionController';
import BlastSummaryViewController from 'wdk-client/Controllers/BlastSummaryViewController';
import GenomeSummaryViewController from 'wdk-client/Controllers/GenomeSummaryViewController';
import ResultTableSummaryViewController from 'wdk-client/Controllers/ResultTableSummaryViewController';
import StepAnalysisController from 'wdk-client/Core/MoveAfterRefactor/Containers/StepAnalysis/StepAnalysisContainer';
import ResultPanelController from 'wdk-client/Controllers/ResultPanelController';
import UserCommentFormController from 'wdk-client/Controllers/UserCommentFormController';
import UserCommentShowController from 'wdk-client/Controllers/UserCommentShowController';

const routes: RouteEntry[] = [
  {
    path: '/',
    component: () => <IndexController/>
  },

  {
    path: '/search/:recordClass/:question/result',
    component: (props: RouteComponentProps<{recordClass: string; question: string;}>) => <AnswerController
      {...props.match.params}
      parameters={parseQueryString(props)}
    />
  },

  {
    path: '/search/:recordClass/:question',
    component: (props: RouteComponentProps<{recordClass: string; question: string;}>) => <QuestionController
      {...props.match.params}
    />
  },

  {
    path: '/record/:recordClass/download/:primaryKey+',
    component: (props: RouteComponentProps<{recordClass: string; primaryKey: string;}>) => {
      const { format, summaryView } = parseQueryString(props);
      return <DownloadFormController
        {...props.match.params}
        format={format}
        summaryView={summaryView}
      />
    }
  },

  {
    path: '/record/:recordClass/:primaryKey+',
    component: (props: RouteComponentProps<{ recordClass: string; primaryKey: string; }>) => <RecordController
      {...props.match.params}
    />
  },

  {
    path: '/step/:stepId(\\d+)/download',
    component: (props: RouteComponentProps<{ stepId: string }>) => {
      const { format, summaryView } = parseQueryString(props);
      const stepId = Number(props.match.params.stepId);
      return (
        <DownloadFormController
          stepId={stepId}
          format={format}
          summaryView={summaryView}
        />
      );
    }
  },

  {
    path: '/user/registration',
    component: () => <UserRegistrationController/>
  },

  {
    path: '/user/profile',
    component: () => <UserProfileController/>
  },

  {
    path: '/user/profile/password',
    component: () => <UserPasswordChangeController/>
  },

  {
    path: '/user/forgot-password',
    component: () => <UserPasswordResetController/>
  },

  {
    path: '/user/message/:messageKey',
    component: (props: RouteComponentProps<{messageKey: string}>) =>
      <UserMessageController
        {...parseQueryString(props)}
        {...props.match.params}
      />
  },

  {
    path: '/workspace/datasets',
    component: (props: RouteComponentProps<{}>) => {
      const { history, location } = props;
      return <UserDatasetListController history={history} location={location}/>
    }
  },

  {
    path: '/workspace/datasets/:id',
    component: (props: RouteComponentProps<{ id: string }>) => {
      // FIXME Remove this requirement from the component by updating action creators
      const rootUrl = window.location.href.substring(
        0,
        window.location.href.indexOf(`/app${props.location.pathname}`)
      );
      return (
        <UserDatasetDetailController
          {...props.match.params}
          rootUrl={rootUrl}
        />
      );
    }
  },

  {
    path: '/favorites',
    component: () => <FavoritesController/>
  },

  {
    path: '/data-finder',
    component: () => <SiteMapController/>
  },

  {
    path: '/question-list',
    component: () => <QuestionListController />
  },

  {
    path: '/step/:stepId(\\d+)/blastSummaryView',
    component: (props: RouteComponentProps<{stepId: string}>) =>
      <BlastSummaryViewController
        stepId={Number(props.match.params.stepId)}
      />
  },

  {
    path: '/step/:stepId(\\d+)/genomeSummaryView',
    component: (props: RouteComponentProps<{ stepId: string }>) =>
      <GenomeSummaryViewController
        viewId="route"
        stepId={Number(props.match.params.stepId)}
      />
  },

  {
    path: '/step-analysis/:stepId(\\d+)',
    component: (props: RouteComponentProps<{ strategyId: string, stepId: string, viewId: string }>) =>
      <StepAnalysisController
        strategyId={Number(props.match.params.strategyId)}
        stepId={Number(props.match.params.stepId)}
        viewId={props.match.params.viewId}
      />
  },

  {
    path: '/step/:stepId(\\d+)/resultPanel',
    component: (props: RouteComponentProps<{ strategyId: string, stepId: string, viewId: string }>) => {
      const { initialTab } = parseQueryString(props);
      return (
        <ResultPanelController
          strategyId={Number(props.match.params.strategyId)}
          stepId={Number(props.match.params.stepId)}
          viewId="strategy"
          initialTab={initialTab}
        />
      );
    }
  },

  {
    path: '/step/:stepId(\\d+)/defaultSummaryView',
    component: (props: RouteComponentProps<{ strategyId: string, stepId: string, viewId: string }>) =>
      <ResultTableSummaryViewController
        strategyId={Number(props.match.params.strategyId)}
        stepId={Number(props.match.params.stepId)}
        viewId={props.match.params.viewId}
      />
  },

  {
    path: '/user-comments/add',
    component: (props: RouteComponentProps<{}>) => {
      const parsedProps = parseUserCommentQueryString(props);
      return (
        <UserCommentFormController {...parsedProps} />
      );
    }
  },

  {
    path: '/user-comments/edit',
    component: (props: RouteComponentProps<{}>) => {
      const parsedProps = parseUserCommentQueryString(props);
      return (
        <UserCommentFormController {...parsedProps} />
      );
    }
  },

  {
    path: '/user-comments/show',
    component: (props: RouteComponentProps<{}>) => {
      const { stableId = '', commentTargetId = '' } = parseQueryString(props);
      const initialCommentId = parseInt((props.location.hash || '#').slice(1)) || undefined;

      return (
        <UserCommentShowController
          targetId={stableId}
          targetType={commentTargetId}
          initialCommentId={initialCommentId}
        />
      );
    }
  },

  {
    path: '*',
    component: () => <NotFoundController />
  }
];

export default routes;

function parseUserCommentQueryString(props: RouteComponentProps<{}>) {
  const { 
    commentId: stringCommentId,
    commentTargetId: targetType,
    stableId: targetId,
    externalDbName,
    externalDbVersion,
    organism,
    locations,
    contig,
    strand
  } = parseQueryString(props);

  const commentId = parseInt(stringCommentId || '') || undefined;
  const target = targetId && targetType
    ? { id: targetId, type: targetType }
    : undefined;
  const externalDatabase = externalDbName && externalDbVersion
    ? { name: externalDbName, version: externalDbVersion }
    : undefined;

  return {
    commentId,
    target,
    externalDatabase,
    organism,
    locations,
    contig,
    strand
  };
}
