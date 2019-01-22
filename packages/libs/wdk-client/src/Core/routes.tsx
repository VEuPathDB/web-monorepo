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
import IsolatesSummaryViewController from 'wdk-client/Controllers/IsolatesSummaryViewController';
import GenomeSummaryViewController from 'wdk-client/Controllers/GenomeSummaryViewController';
import StepAnalysisController from 'wdk-client/Core/MoveAfterRefactor/Containers/StepAnalysis/StepAnalysisContainer';

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
    path: '/step/:stepId(\\d+)/isolatesSummaryView',
    component: (props: RouteComponentProps<{ stepId: string }>) =>
      <IsolatesSummaryViewController
        stepId={Number(props.match.params.stepId)}
      />
  },

  {
    path: '/step/:stepId(\\d+)/genomeSummaryView',
    component: (props: RouteComponentProps<{ stepId: string }>) =>
      <GenomeSummaryViewController
        stepId={Number(props.match.params.stepId)}
      />
  },

  {
    path: '/step-analysis/:stepId',
    component: (props: RouteComponentProps<{ stepId: string }>) =>
      <StepAnalysisController
        stepId={Number(props.match.params.stepId)}
      />
  },

  {
    path: '*',
    component: () => <NotFoundController />
  }
];

export default routes;
