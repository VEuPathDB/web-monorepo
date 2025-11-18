import { ServiceBase } from '../../Service/ServiceBase';
import * as Decode from '../../Utils/Json';

export type UserBasicInfo = {
  name: string;
  organization: string;
};

type SubscriptionGroupBase = {
  groupName: string;
  subscriptionToken: string;
  groupLeads: UserBasicInfo[];
};

// if changed, change decoder below
type ActiveStatus = 'never_subscribed' | 'active' | 'grace_period' | 'expired';

export type SubscriptionGroup = SubscriptionGroupBase & {
  subscriberName?: string; // omitted if identical to groupName
  activeStatus: ActiveStatus;
};

export type SubscriptionGroupWithMembers = SubscriptionGroupBase & {
  members: UserBasicInfo[];
};

const UserBasicInfoDecoder: Decode.Decoder<UserBasicInfo> = Decode.combine(
  Decode.field('name', Decode.string),
  Decode.field('organization', Decode.string)
);

const SubscriptionGroupBaseDecoder: Decode.Decoder<SubscriptionGroupBase> =
  Decode.combine(
    Decode.field('groupName', Decode.string),
    Decode.field('subscriptionToken', Decode.string),
    Decode.field('groupLeads', Decode.arrayOf(UserBasicInfoDecoder))
  );

const SubscriptionGroupDecoder: Decode.Decoder<SubscriptionGroup> =
  Decode.combine(
    SubscriptionGroupBaseDecoder,
    Decode.optional(Decode.field('subscriberName', Decode.string)),
    Decode.field(
      'activeStatus',
      Decode.oneOf(
        Decode.constant('never_subscribed'),
        Decode.constant('active'),
        Decode.constant('grace_period'),
        Decode.constant('expired')
      )
    )
  );

const SubscriptionGroupWithMembersDecoder: Decode.Decoder<SubscriptionGroupWithMembers> =
  Decode.combine(
    SubscriptionGroupBaseDecoder,
    Decode.field('members', Decode.arrayOf(UserBasicInfoDecoder))
  );

export default (base: ServiceBase) => {
  function getOauthStateToken() {
    return base._fetchJson<{ oauthStateToken: string }>(
      'get',
      '/oauth/state-token'
    );
  }

  /**
   * Get vocabularies for user profile properties.
   */
  function getUserProfileVocabulary() {
    const decoder = Decode.objectOf(
      Decode.arrayOf(
        Decode.record({
          value: Decode.string,
          display: Decode.string,
        })
      )
    );
    return base.sendRequest(decoder, {
      method: 'get',
      path: '/user-profile-vocabularies',
      useCache: true,
    });
  }

  /**
   * Get subscription groups for user profile and subscription-based UI features.
   */
  function getSubscriptionGroups() {
    return base.sendRequest(Decode.arrayOf(SubscriptionGroupDecoder), {
      method: 'get',
      path: '/subscription-groups?filter=active_and_expired',
      useCache: false,
    });
  }

  /**
   * Get subscription groups for user profile and subscription-based UI features.
   */
  function getManagedGroupsForUser() {
    return base.sendRequest(
      Decode.arrayOf(SubscriptionGroupWithMembersDecoder),
      {
        method: 'get',
        path: '/my-managed-groups',
        useCache: false,
      }
    );
  }

  return {
    getOauthStateToken,
    getUserProfileVocabulary,
    getSubscriptionGroups,
    getManagedGroupsForUser,
  };
};
