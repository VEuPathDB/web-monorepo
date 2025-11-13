import { ServiceBase } from '../../Service/ServiceBase';
import * as Decode from '../../Utils/Json';

export type UserBasicInfo = {
  name: string;
  organization: string;
};

export type SubscriptionGroup = {
  groupName: string;
  subscriptionToken: string;
  subscriberName?: string;
  groupLeads: UserBasicInfo[];
};

export type SubscriptionGroupWithMembers = SubscriptionGroup & {
  members: UserBasicInfo[];
};

const GroupLeadDecoder: Decode.Decoder<UserBasicInfo> = Decode.combine(
  Decode.field('name', Decode.string),
  Decode.field('organization', Decode.string)
);

const SubscriptionGroupDecoder: Decode.Decoder<SubscriptionGroup> =
  Decode.combine(
    Decode.field('groupName', Decode.string),
    Decode.field('subscriptionToken', Decode.string),
    Decode.field('groupLeads', Decode.arrayOf(GroupLeadDecoder))
  );

const SubscriptionGroupWithMembersDecoder: Decode.Decoder<SubscriptionGroupWithMembers> =
  Decode.combine(
    SubscriptionGroupDecoder,
    Decode.field('members', Decode.arrayOf(GroupLeadDecoder))
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
      path: '/subscription-groups',
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
