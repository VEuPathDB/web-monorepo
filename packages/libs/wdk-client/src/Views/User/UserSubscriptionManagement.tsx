import React, { useState, useEffect, JSX } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { wrappable } from '../../Utils/ComponentUtils';
import {
  SubscriptionGroup,
  GroupLead,
} from '../../Service/Mixins/OauthService';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import Select from 'react-select';

interface UserSubscriptionManagementProps {
  user: UserProfileFormData;
  subscriptionGroups: SubscriptionGroup[] | undefined;
  onPropertyChange: (field: string) => (value: any) => void;
  saveButton: JSX.Element;
}

const UserSubscriptionManagement: React.FC<UserSubscriptionManagementProps> = ({
  user,
  subscriptionGroups,
  onPropertyChange,
  saveButton,
}) => {
  if (!subscriptionGroups)
    return (
      <div>
        We're sorry; an error has occurred and your subscription details cannot
        be loaded at this time.
      </div>
    );

  let userGroupToken =
    user != null && user.properties != null
      ? user.properties['subscriptionToken']
      : undefined;
  let validGroupList = !userGroupToken
    ? []
    : subscriptionGroups.filter((g) => g.subscriptionToken === userGroupToken);
  let validGroup = validGroupList.length === 0 ? undefined : validGroupList[0];

  if (validGroup) {
    return (
      <div>
        <p>You are a member of {validGroup.groupName}.</p>
        {validGroup.groupLeads.length > 0 && (
          <div>
            <p>This group is led by:</p>
            <ul>
              {validGroup.groupLeads.map((lead) => (
                <li>
                  {lead.name}, {lead.organization}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  let groupVocab = subscriptionGroups.map((group) => ({
    value: group.subscriptionToken,
    label: group.groupName,
  }));
  let selectedGroup = groupVocab.filter((g) => g.value === userGroupToken)[0];
  let tokenField = 'subscriptionToken';
  return (
    <fieldset>
      <legend>Subscription Management</legend>
      <div style={{ padding: '1em 0' }}>
        <p>
          Please choose your subscription group. If you do not see your group,
          please talk to your group lead about becoming a subscriber.
        </p>
        <p>
          <form>
            <Select
              isSearchable={true}
              name={tokenField}
              value={selectedGroup}
              required={true}
              onChange={onPropertyChange(tokenField)}
              items={[{ value: '', label: '--' }].concat(groupVocab)}
            />
            {saveButton}
          </form>
        </p>
      </div>
    </fieldset>
  );
};

export default wrappable(UserSubscriptionManagement);
