import { RouteSpec } from './CommonTypes';
import IndexController from '../Views/Index/IndexController';
import RecordController from '../Views/Records/RecordController';
import NotFoundController from '../Views/NotFound/NotFoundController';
import AnswerController from '../Views/Answer/AnswerController';
import QuestionListController from '../Views/Question/QuestionListController';
import DownloadFormController from '../Views/ReporterForm/DownloadFormController';
import UserRegistrationController from '../Views/User/Profile/UserRegistrationController';
import UserProfileController from '../Views/User/Profile/UserProfileController';
import UserPasswordChangeController from '../Views/User/Password/UserPasswordChangeController';
import UserPasswordResetController from '../Views/User/Password/UserPasswordResetController';
import UserMessageController from '../Views/User/UserMessageController';
import SiteMapController from '../Views/SiteMap/SiteMapController';
import UserDatasetListController from '../Views/UserDatasets/List/UserDatasetListController';
import UserDatasetDetailController from '../Views/UserDatasets/Detail/UserDatasetDetailController';
import FavoritesController from '../Views/Favorites/FavoritesController';
import QuestionController from '../Views/Question/QuestionController';

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
  { path: '*', component: NotFoundController },
];
