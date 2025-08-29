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
import NumberedHeader from '@veupathdb/coreui/lib/components/forms/NumberedHeader';

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
      <fieldset>
        <legend>My Subscription Status</legend>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5em' }}>
          <h4>Status: </h4>
          <span>{validGroup ? 'Subscribed' : 'Not subscribed'}</span>
        </div>
        {/* Show subscription status only when form is clean (saved state) */}
        {validGroup &&
          (formStatus === 'new' ||
            formStatus === 'modified' ||
            formStatus === 'pending') && (
            <div>
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
            </div>
          )}

        {/* Show group selection when no saved group OR when there are unsaved changes AND when the modal is not there */}
        {(!validGroup || formStatus !== 'new') && !showConfirmModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
            <Banner
              banner={{
                type: 'info',
                message:
                  'If you are a PI or group manager, create a subscription.',
              }}
            />
            <NumberedHeader
              number={1}
              text="Find your group or lab"
              color="blue"
              // color={theme.palette.primary.hue[theme.palette.primary.level]}
            />
            <div style={{ marginLeft: '1.5em' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5em',
                }}
              >
                <h5>Group name:</h5>
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
              </div>
              <span>
                Don\'t see your group listed? Ask your group lead or
                administrator to create a subscription.
              </span>
            </div>

            <NumberedHeader
              number={2}
              text="Associate your account with your group"
              color="blue"
              // color={theme.palette.primary.hue[theme.palette.primary.level]}
            />
            <span>
              Click the button to associate your VEuPathDB account with your
              group. There is no cost to join a group.
            </span>
            {saveButton}
            <span style={{ marginTop: '3em' }}>
              Questions? Contact us if you need help joining a subscription.
            </span>
          </div>
        )}
      </fieldset>
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
