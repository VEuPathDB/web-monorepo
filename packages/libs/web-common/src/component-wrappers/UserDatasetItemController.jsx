import { webAppUrl } from '../config';

export const UserDatasetItemController = (WdkUserDatasetItemController) =>
  class EbrcUserDatasetItemController extends WdkUserDatasetItemController {
    getQuestionUrl(question) {
      return `${webAppUrl}/showQuestion.do?questionFullName=${question.fullName}`;
    }
  };
