import { SubscriptionGroup } from '../Service/Mixins/OauthService';
import { User } from './WdkUser';

export function userIsSubscribed(
  user: User,
  subscriptionGroups: SubscriptionGroup[] | undefined
): boolean {
  if (user.isGuest) return false;
  let group = subscriptionGroups?.find(
    (g: SubscriptionGroup) =>
      g.subscriptionToken === user.properties?.['subscriptionToken']
  );
  return (
    group != null &&
    (group.activeStatus == 'active' || group?.activeStatus == 'grace_period')
  );
}

export function userIsClassParticipant(user: User): boolean {
  return !user.isGuest && user.properties?.['groupType'] === 'class';
}
