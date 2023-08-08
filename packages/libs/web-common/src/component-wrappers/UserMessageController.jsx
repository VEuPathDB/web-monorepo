import { webAppUrl } from '../config';

export const UserMessageController = (WdkUserMessageController) =>
  class EbrcUserMessageController extends WdkUserMessageController {
    getContactUrl() {
      return `${webAppUrl}/contactUs.do`;
    }
  };
