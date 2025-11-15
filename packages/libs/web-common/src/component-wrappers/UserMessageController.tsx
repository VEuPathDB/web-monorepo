import { webAppUrl } from '../config';

export const UserMessageController = <T extends new (...args: any[]) => any>(
  WdkUserMessageController: T
) =>
  class EbrcUserMessageController extends WdkUserMessageController {
    getContactUrl(): string {
      return `${webAppUrl}/contactUs.do`;
    }
  };
