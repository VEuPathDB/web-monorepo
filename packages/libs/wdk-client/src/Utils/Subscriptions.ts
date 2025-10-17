import { SubscriptionGroup } from '../Service/Mixins/OauthService';
import { User } from './WdkUser';

export function userIsSubscribed(
  user: User,
  subscriptionGroups: SubscriptionGroup[] | undefined
): boolean {
  return (
    !user.isGuest &&
    subscriptionGroups?.find(
      (g: SubscriptionGroup) =>
        g.subscriptionToken === user.properties?.['subscriptionToken']
    ) != null
  );
}

export function userIsClassParticipant(user: User): boolean {
  return !user.isGuest && user.properties?.['groupType'] === 'class';
}
