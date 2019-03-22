import React from 'react';

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
import UserCommentFormController from 'wdk-client/Controllers/UserCommentFormController';
import UserCommentShowController from 'wdk-client/Controllers/UserCommentShowController';

export default [
  { path: '/', component: IndexController },
  { path: '/search/:recordClass/:question/result', component: AnswerController },
  { path: '/search/:recordClass/:question', component: QuestionController },
  { path: '/record/:recordClass/download/:primaryKey+', component: DownloadFormController },
  { path: '/record/:recordClass/:primaryKey+', component: RecordController },
  { path: '/step/:stepId/download', component: DownloadFormController },
  { path: '/user/registration', component: UserRegistrationController },
  { path: '/user/profile', component: UserProfileController },
  { path: '/user/profile/password', component: UserPasswordChangeController },
  { path: '/user/forgot-password', component: UserPasswordResetController },
  { path: '/user/message/:messageKey', component: UserMessageController },
  { path: '/workspace/datasets', component: UserDatasetListController },
  { path: '/workspace/datasets/:id', component: UserDatasetDetailController },
  { path: '/favorites', component: FavoritesController },
  { path: '/data-finder', component: SiteMapController },
  { path: '/question-list', component: QuestionListController },
  { path: '/step/:stepId/blastSummaryView', component: BlastSummaryViewController },
  { path: '/step/:stepId/isolatesSummaryView', component: IsolatesSummaryViewController },
  { path: '/step/:stepId/genomeSummaryView', component: GenomeSummaryViewController },
  { path: '/user-comments/add', component: UserCommentFormController },
  { path: '/user-comments/edit', component: UserCommentFormController },
  { path: '/user-comments/show', component: UserCommentShowController },
  { path: '*', component: NotFoundController },
];
