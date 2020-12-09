import { isArray, castArray } from 'lodash';
import React from 'react';
import QueryString from 'querystring';
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
import UserDatasetDetailController from 'wdk-client/Controllers/UserDatasetDetailController';
import FavoritesController from 'wdk-client/Controllers/FavoritesController';
import UserCommentFormController from 'wdk-client/Controllers/UserCommentFormController';
import UserCommentShowController from 'wdk-client/Controllers/UserCommentShowController';
import UserLoginController from 'wdk-client/Controllers/UserLoginController';
import QuestionController from 'wdk-client/Controllers/QuestionController';

import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import StrategyWorkspaceController from 'wdk-client/Controllers/StrategyWorkspaceController';
import BasketController from 'wdk-client/Controllers/BasketController';
import { PermissionDenied } from 'wdk-client/Components';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import Error from 'wdk-client/Components/PageStatus/Error';
import UserDatasetsWorkspace from 'wdk-client/Views/UserDatasets/UserDatasetsWorkspace';

const routes: RouteEntry[] = [
  {
    path: '/',
    component: () => <IndexController/>
  },

  {
    path: '/search/:recordClass/:question/result',
    component: (props: RouteComponentProps<{recordClass: string; question: string;}>) => {
      const { filterTerm, filterAttributes = [], filterTables = [] } = QueryString.parse(props.location.search.slice(1));
      const parameters = parseSearchParamsFromQueryParams(parseQueryString(props));
      return (
        <AnswerController
          {...props.match.params}
          parameters={parameters}
          filterTerm={isArray(filterTerm) ? filterTerm[0] : filterTerm}
          filterAttributes={castArray(filterAttributes)}
          filterTables={castArray(filterTables)}
          history={props.history}
        />
      )
    }
  },

  {
    path: '/search/:recordClass/:question',
    component: (props: RouteComponentProps<{recordClass: string; question: string;}>) => {
      // Parse querystring. Two types of query params are supported: autoRun
      // and param data:
      // - autoRun: boolean (interpretted as true if present without a value, or with 'true' or '1')
      // - param data: Prefix with "param.". E.g., "param.organism=Plasmodium+falciparum+3D7", or "param.ds_gene_ids.idList=PF3D7_1133400,PF3D7_1133401"
      const { autoRun, ...restQueryParams } = parseQueryString(props);
      const initialParamData = parseSearchParamsFromQueryParams(restQueryParams);
      return (
        <Plugin
          context={{
            type: 'questionController',
            recordClassName: props.match.params.recordClass,
            searchName: props.match.params.question
          }}
          pluginProps={{
            ...props.match.params,
            submissionMetadata: {
              type: 'create-strategy'
            } as const,
            shouldChangeDocumentTitle: true,
            initialParamData,
            autoRun: autoRun === '' || autoRun === 'true' || autoRun === '1',
            prepopulateWithLastParamValues: true
          }}
          defaultComponent={QuestionController}
        />
      );
    }
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
    path: '/workspace/basket/:basketName/download',
    component: (props: RouteComponentProps<{ basketName: string }>) => {
      const { format } = parseQueryString(props);
      return (
        <DownloadFormController
          {...props.match.params}
          format={format}
        />
      );
    }
  },

  {
    path: '/web-services-help',
    component: (props: RouteComponentProps<{}>) =>
      <WebServicesHelpController {...parseQueryString(props)}/>,
    rootClassNameModifier: 'web-services-help'
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
    requiresLogin: true,
    component: BasketController
  },

  {
    path: '/workspace/datasets/:id(\\d+)',
    requiresLogin: true,
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
    path: '/workspace/datasets',
    exact: false,
    requiresLogin: false, // uses custom guest views
    component: (props: RouteComponentProps<{}>) => < UserDatasetsWorkspace rootPath={props.match.path} urlParams={parseQueryString(props)}/>
  },

  {
    path: '/workspace/strategies/:subPath*',
    exact: false,
    component: (props: RouteComponentProps<{ subPath?: string }, {}, { allowEmptyOpened?: boolean } | undefined>) => {
      const queryParams = parseQueryString(props);
      const { subPath = '' } = props.match.params;
      const { allowEmptyOpened = false } = props.location.state || {};
      return (
        <StrategyWorkspaceController
          queryParams={queryParams}
          workspacePath="/workspace/strategies"
          subPath={subPath}
          allowEmptyOpened={allowEmptyOpened}
        />
      );
    }
  },

  {
    path: '/workspace/favorites',
    requiresLogin: true,
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
    requiresLogin: true,
    component: (props: RouteComponentProps<{}>) => {
      const parsedProps = parseUserCommentQueryString(props);
      return (
        <UserCommentFormController {...parsedProps} />
      );
    }
  },

  {
    path: '/user-comments/edit',
    requiresLogin: true,
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
    path: '/401',
    component: PermissionDenied
  },

  {
    path: '/404',
    component: NotFound
  },

  {
    path: '/500',
    component: Error
  },

  {
    path: '*',
    component: () => <NotFoundController />
  }
];

export default routes;

function parseSearchParamsFromQueryParams(restQueryParams: { [x: string]: string; }): Record<string, string> | undefined {
  const initialParamValuesEntries = Object.entries(restQueryParams)
    .filter(([key]) => key.startsWith('param.'))
    .map(([key, value]) => [key.replace(/^param\./, ''), value]);
  return initialParamValuesEntries.length > 0
    ? Object.fromEntries(initialParamValuesEntries)
    : undefined;
}

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
