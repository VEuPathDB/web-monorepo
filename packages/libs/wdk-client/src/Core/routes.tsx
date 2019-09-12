import React from 'react';
import { RouteComponentProps, Redirect } from 'react-router';

import { RouteEntry, parseQueryString } from 'wdk-client/Core/RouteEntry';

import IndexController from 'wdk-client/Controllers/IndexController';
import RecordController from 'wdk-client/Controllers/RecordController';
import NotFoundController from 'wdk-client/Controllers/NotFoundController';
import AnswerController from 'wdk-client/Controllers/AnswerController';
import QuestionListController from 'wdk-client/Controllers/QuestionListController';
import DownloadFormController from 'wdk-client/Controllers/DownloadFormController';
import WebServicesHelpController from 'wdk-client/Controllers/WebServicesHelpController';
import UserRegistrationController from 'wdk-client/Controllers/UserRegistrationController';
import UserProfileController from 'wdk-client/Controllers/UserProfileController';
import UserPasswordChangeController from 'wdk-client/Controllers/UserPasswordChangeController';
import UserPasswordResetController from 'wdk-client/Controllers/UserPasswordResetController';
import UserMessageController from 'wdk-client/Controllers/UserMessageController';
import SiteMapController from 'wdk-client/Controllers/SiteMapController';
import UserDatasetListController from 'wdk-client/Controllers/UserDatasetListController';
import UserDatasetDetailController from 'wdk-client/Controllers/UserDatasetDetailController';
import FavoritesController from 'wdk-client/Controllers/FavoritesController';
import UserCommentFormController from 'wdk-client/Controllers/UserCommentFormController';
import UserCommentShowController from 'wdk-client/Controllers/UserCommentShowController';
import UserLoginController from 'wdk-client/Controllers/UserLoginController';

import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import StrategyWorkspaceController from 'wdk-client/Controllers/StrategyWorkspaceController';
import BasketController from 'wdk-client/Controllers/BasketController';

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
    component: (props: RouteComponentProps<{recordClass: string; question: string;}>) => <Plugin
      context={{
        type: 'questionController',
        recordClassName: props.match.params.recordClass,
        searchName: props.match.params.question
      }}
      pluginProps={{
        ...props.match.params,
        hash: props.location.hash.slice(1),
        submissionMetadata: {
          type: 'create-strategy'
        }
      }}
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
    path: '/web-services-help',
    component: (props: RouteComponentProps<{}>) =>
      <WebServicesHelpController {...parseQueryString(props)}/>
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
    path: '/user/login',
    component: (props: RouteComponentProps<void>) => {
      const { destination } = parseQueryString(props);
      return (
        <UserLoginController destination={destination} />
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
    path: '/workspace/basket',
    component: BasketController
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
    path: '/workspace/strategies/:subPath*',
    exact: false,
    component: (props: RouteComponentProps<{ subPath?: string }, {}, { allowEmptyOpened?: boolean } | undefined>) => {
      const { subPath = '' } = props.match.params;
      const { state: { allowEmptyOpened = false } = {} } = props.location;
      return (
        <StrategyWorkspaceController workspacePath="/workspace/strategies" subPath={subPath} allowEmptyOpened={allowEmptyOpened}/>
      );
    }
  },

  {
    path: '/workspace/favorites',
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
    path: '/import/:signature',
    component: (props: RouteComponentProps<{ signature: string }>) => 
      <Redirect to={`/workspace/strategies/import/${props.match.params.signature}`} />
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
