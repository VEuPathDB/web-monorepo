import React, { useState, useEffect, useMemo, JSX, FormEvent } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { IconAlt as Icon } from '../../Components';
import { wrappable } from '../../Utils/ComponentUtils';
import { SubscriptionGroup } from '../../Service/Mixins/OauthService';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import {
  OutlinedButton,
  SaveButton,
} from '@veupathdb/coreui/lib/components/buttons';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import { Dialog } from '../../Components';
import { success, warning } from '@veupathdb/coreui/lib/definitions/colors';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { User } from '../../Utils/WdkUser';

interface UserSubscriptionManagementProps {
  user: User;
  subscriptionGroups: SubscriptionGroup[];
  onPropertyChange: (
    field: string,
    submitAfterChange?: boolean
  ) => (value: any) => void;
  saveButton: JSX.Element;
  onSuccess: () => void;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
}

type Option = {
  value: string;
  label: string;
};

const UserSubscriptionManagement: React.FC<UserSubscriptionManagementProps> = ({
  user,
  subscriptionGroups,
  onPropertyChange,
  saveButton,
  onSuccess,
  formStatus,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localSelection, setLocalSelection] = useState<string>();

  // Reset local selection when database state changes (after successful save)
  useEffect(() => {
    if (formStatus === 'new') {
      setLocalSelection(undefined);
    }
  }, [formStatus]);

  const tokenField = 'subscriptionToken';
  const userGroupToken = user.properties[tokenField]; // from db-backed state

  const validGroup = useMemo(() => {
    if (!userGroupToken) return undefined;
    const validGroupList = subscriptionGroups.filter(
      (g) => g.subscriptionToken === userGroupToken
    );
    return validGroupList.length === 0 ? undefined : validGroupList[0];
  }, [userGroupToken, subscriptionGroups]);

  const groupVocab1 = useMemo(
    () =>
      [{ value: '', display: '--' }].concat(
        subscriptionGroups.map((group) => ({
          value: group.subscriptionToken,
          display: group.groupName,
        }))
      ),
    [subscriptionGroups]
  );

  const groupVocab2 = useMemo(
    () =>
      [{ value: '', label: '--' }].concat(
        subscriptionGroups.map((group) => ({
          value: group.subscriptionToken,
          label: group.groupName,
        }))
      ),
    [subscriptionGroups]
  );

  const selectedGroup = useMemo(() => {
    const effectiveToken = localSelection ?? userGroupToken;
    return groupVocab2.filter((g) => g.value === effectiveToken)[0];
  }, [groupVocab2, userGroupToken, localSelection]);

  const tryTypeahead = true;

  return (
    <div>
      {/* Show subscription status only when form is clean (saved state) */}
      {validGroup &&
        (formStatus === 'new' ||
          formStatus === 'modified' ||
          formStatus === 'pending') && (
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
            <form>
              <OutlinedButton
                text="Leave this group"
                onPress={() => setShowConfirmModal(true)}
                themeRole="primary"
              />
            </form>
          </fieldset>
        )}

      {/* Show group selection when no saved group OR when there are unsaved changes AND when the modal is not there */}
      {(!validGroup || formStatus !== 'new') && !showConfirmModal && (
        <fieldset>
          <legend>Subscription Management</legend>
          <div style={{ padding: '1em 0' }}>
            <p>
              Please choose your subscription group. If you do not see your
              group, please talk to your group lead about becoming a subscriber.
            </p>
            <p>
              <form>
                {!tryTypeahead ? (
                  <SingleSelect
                    name={tokenField}
                    value={localSelection ?? userGroupToken ?? ''}
                    required={true}
                    onChange={onPropertyChange(tokenField)}
                    items={groupVocab1}
                  />
                ) : (
                  <Select<Option, any>
                    isMulti={false}
                    isSearchable
                    options={groupVocab2}
                    value={selectedGroup}
                    onChange={(option: ValueType<Option, any>) => {
                      const value =
                        option == null || Array.isArray(option)
                          ? ''
                          : (option as Option).value;
                      setLocalSelection(value);
                      onPropertyChange(tokenField)(value);
                    }}
                    formatOptionLabel={(option) => option.label}
                    form="DO_NOT_SUBMIT_ON_ENTER"
                  />
                )}
                {saveButton}
              </form>
            </p>
          </div>
        </fieldset>
      )}

      {/* Confirmation modal overlay */}
      <Dialog
        open={showConfirmModal}
        modal={true}
        title="Confirmation"
        description={<div>Confirm you want to leave the group.</div>}
        onClose={() => setShowConfirmModal(false)}
      >
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
                saving: 'Leaving...',
                saved: 'Left the group',
              }}
              formStatus={formStatus === 'new' ? 'modified' : formStatus}
              onPress={() => onPropertyChange(tokenField, true)('')}
              themeRole="primary"
              onSuccess={() => {
                setShowConfirmModal(false);
                onSuccess();
              }}
              savedStateDuration={1000}
            />
            <OutlinedButton
              text="No, don't leave the group"
              onPress={() => setShowConfirmModal(false)}
              themeRole="primary"
              disabled={formStatus === 'pending' || formStatus === 'success'}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserSubscriptionManagement;
