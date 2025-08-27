import React, { useState, useEffect, JSX, FormEvent } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { wrappable } from '../../Utils/ComponentUtils';
import { SubscriptionGroup } from '../../Service/Mixins/OauthService';
import Select from 'react-select';
import {
  OutlinedButton,
  SaveButton,
} from '@veupathdb/coreui/lib/components/buttons';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import { Dialog } from '../../Components';

interface UserSubscriptionManagementProps {
  user: UserProfileFormData;
  subscriptionGroups: SubscriptionGroup[] | undefined;
  onPropertyChange: (
    field: string
  ) => (value: any, submitAfterChange?: boolean) => void;
  saveButton: JSX.Element;
  onSubmit: (event: FormEvent<Element>) => void;
  onDiscardChanges: () => void;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
}

const UserSubscriptionManagement: React.FC<UserSubscriptionManagementProps> = ({
  user,
  subscriptionGroups,
  onPropertyChange,
  saveButton,
  onSubmit,
  onDiscardChanges,
  formStatus,
}) => {
  let [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

  if (!subscriptionGroups) return null;

  let tokenField = 'subscriptionToken';
  let userGroupToken =
    user != null && user.properties != null
      ? user.properties[tokenField]
      : undefined;
  let validGroupList = !userGroupToken
    ? []
    : subscriptionGroups.filter((g) => g.subscriptionToken === userGroupToken);
  let validGroup = validGroupList.length === 0 ? undefined : validGroupList[0];

  /**
   * What is shown is dependent on two state values:
   *
   * Screen To Show Based On State                         ValidGroupPresent?   FormStatus?
   * ----------------------------------------------------------------------------------------------
   * div w/your subscription status                        valid-group          new/success/error
   * div w/your subscription status w/dialog               no-group             modified
   * div w/your subscription status w/dialog (Saving...)   no-group             pending
   * choose group select (empty group)                     no-group             new/success/error
   * choose group select (group selected modified form)    valid-group          modified
   * choose group select (Saving...)                       valid-group          pending
   */
  if (
    validGroup &&
    (formStatus == 'new' || formStatus == 'success' || formStatus == 'error')
  ) {
    return (
      <div>
        <fieldset>
          <legend>My Subscription Status</legend>
          <p>You are a member of {validGroup.groupName}.</p>
          {validGroup.groupLeads.length > 0 && (
            <div>
              <p>This group is led by:</p>
              <ul>
                {validGroup.groupLeads.map((lead) => (
                  <li key={lead.name + lead.organization}>
                    {lead.name}, {lead.organization}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </fieldset>
        <form>
          <OutlinedButton
            text="Leave This Group"
            onPress={(e) => onPropertyChange(tokenField)('')}
            themeRole="primary"
          />
        </form>
      </div>
    );
  }
  if (!validGroup && (formStatus == 'modified' || formStatus == 'pending')) {
    return (
      <div>
        <Dialog
          open={!validGroup}
          modal={true}
          title="Confirmation"
          /* An optional description for screen readers only */
          description={<div>Confirm you want to leave the group.</div>}
          children={
            <div>
              <p>Are you sure you want to leave the group?</p>
              <div
                style={{
                  marginTop: '1em',
                  display: 'flex',
                  gap: '0.5em',
                  alignItems: 'center',
                }}
              >
                <SaveButton
                  customText={{
                    save: 'Yes, leave the group',
                    saving: 'Saving...',
                  }}
                  formStatus={formStatus}
                  onPress={(e) => onSubmit(e)}
                  themeRole="primary"
                />
                <OutlinedButton
                  text="No, don't leave the group"
                  onPress={() => onDiscardChanges()}
                  themeRole="primary"
                />
              </div>
            </div>
          }
          onClose={() => onDiscardChanges()}
        />
      </div>
    );
  }

  let groupVocab1 = subscriptionGroups.map((group) => ({
    value: group.subscriptionToken,
    display: group.groupName,
  }));
  let groupVocab2 = subscriptionGroups.map((group) => ({
    value: group.subscriptionToken,
    label: group.groupName,
  }));

  let selectedGroup = groupVocab2.filter((g) => g.value === userGroupToken)[0];

  const tryTypeahead = false;
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
            {!tryTypeahead ? (
              <SingleSelect
                name={tokenField}
                value={userGroupToken || ''}
                required={true}
                onChange={onPropertyChange(tokenField)}
                items={[{ value: '', display: '--' }].concat(groupVocab1)}
              />
            ) : (
              <Select
                isSearchable={true}
                name={tokenField}
                value={selectedGroup}
                required={true}
                onChange={(option) =>
                  onPropertyChange(tokenField)(
                    option == null ? '' : option.value
                  )
                }
                items={[{ value: '', label: '--' }].concat(groupVocab2)}
              />
            )}
            {saveButton}
          </form>
        </p>
      </div>
    </fieldset>
  );
};

export default UserSubscriptionManagement;
