import React, { useState, useEffect, JSX } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { wrappable } from '../../Utils/ComponentUtils';
import { SubscriptionGroup } from '../../Service/Mixins/OauthService';
import SingleSelect from '../../Components/InputControls/SingleSelect';

interface UserSubscriptionManagementProps {
  user: UserProfileFormData;
  subscriptionGroups: SubscriptionGroup[] | undefined;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  hasUnsavedChanges: boolean;
  onPropertyChange: (field: string) => (value: any) => void;
  saveButton: JSX.Element;
}

const UserSubscriptionManagement: React.FC<UserSubscriptionManagementProps> = ({
  user,
  subscriptionGroups,
  onPropertyChange,
  saveButton,
}) => {
  if (!subscriptionGroups) return null;

  let userGroupToken =
    user != null && user.properties != null
      ? user.properties['subscriptionToken']
      : undefined;
  let validGroupList = !userGroupToken
    ? []
    : subscriptionGroups.filter((g) => g.subscriptionToken === userGroupToken);
  let validGroup = validGroupList.length === 0 ? undefined : validGroupList[0];

  let groupVocab = subscriptionGroups.map((group) => ({
    value: group.subscriptionToken,
    display: group.groupName,
  }));
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
            <SingleSelect
              //id={tokenField}
              name={tokenField}
              value={validGroup?.subscriptionToken}
              required={true}
              onChange={onPropertyChange(tokenField)}
              items={[{ value: '', display: '--' }].concat(groupVocab)}
            />
            {saveButton}
          </form>
        </p>
        <p style={{ marginTop: '1em' }}>
          Current user: <strong>{user.email || 'No email'}</strong>
        </p>
      </div>
    </fieldset>
  );
};

export default wrappable(UserSubscriptionManagement);
