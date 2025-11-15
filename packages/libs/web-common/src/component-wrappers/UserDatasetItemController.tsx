import { webAppUrl } from '../config';
import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const UserDatasetItemController = <
  T extends new (...args: any[]) => any
>(
  WdkUserDatasetItemController: T
) =>
  class EbrcUserDatasetItemController extends WdkUserDatasetItemController {
    getQuestionUrl(question: Question): string {
      return `${webAppUrl}/showQuestion.do?questionFullName=${question.fullName}`;
    }
  };
