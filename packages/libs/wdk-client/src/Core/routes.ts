import { RouteSpec } from 'wdk-client/Core/CommonTypes';
import IndexController from 'wdk-client/Views/Index/IndexController';
import RecordController from 'wdk-client/Views/Records/RecordController';
import NotFoundController from 'wdk-client/Views/NotFound/NotFoundController';
import AnswerController from 'wdk-client/Views/Answer/AnswerController';
import QuestionListController from 'wdk-client/Views/Question/QuestionListController';
import DownloadFormController from 'wdk-client/Views/ReporterForm/DownloadFormController';
import UserRegistrationController from 'wdk-client/Views/User/Profile/UserRegistrationController';
import UserProfileController from 'wdk-client/Views/User/Profile/UserProfileController';
import UserPasswordChangeController from 'wdk-client/Views/User/Password/UserPasswordChangeController';
import UserPasswordResetController from 'wdk-client/Views/User/Password/UserPasswordResetController';
import UserMessageController from 'wdk-client/Views/User/UserMessageController';
import SiteMapController from 'wdk-client/Views/SiteMap/SiteMapController';
import UserDatasetListController from 'wdk-client/Views/UserDatasets/List/UserDatasetListController';
import UserDatasetDetailController from 'wdk-client/Views/UserDatasets/Detail/UserDatasetDetailController';
import FavoritesController from 'wdk-client/Views/Favorites/FavoritesController';
import QuestionController from 'wdk-client/Views/Question/QuestionController';
import BlastSummaryViewController from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewController';

export default <RouteSpec[]> [
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
  { path: '*', component: NotFoundController },
];
