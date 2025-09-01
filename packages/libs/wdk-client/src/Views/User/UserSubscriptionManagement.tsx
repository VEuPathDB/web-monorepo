import React, { useState, useEffect, useMemo, JSX, FormEvent } from 'react';
import { UserProfileFormData } from '../../StoreModules/UserProfileStoreModule';
import { IconAlt as Icon } from '../../Components';
import { wrappable } from '../../Utils/ComponentUtils';
import { SubscriptionGroup } from '../../Service/Mixins/OauthService';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { ValueType } from 'react-select/src/types';
import {
  OutlinedButton,
  SaveButton,
} from '@veupathdb/coreui/lib/components/buttons';
import SingleSelect from '../../Components/InputControls/SingleSelect';
import { Dialog } from '../../Components';
import colors, {
  success,
  warning,
} from '@veupathdb/coreui/lib/definitions/colors';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { User } from '../../Utils/WdkUser';
import NumberedHeader from '@veupathdb/coreui/lib/components/forms/NumberedHeader';
import { useTheme } from '@material-ui/core';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import './UserSubscriptionManagement.scss';

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

  const theme = useUITheme();

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

  return (
    <div>
      <fieldset>
        <legend>My Subscription Status</legend>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5em' }}>
          <h4>Status: </h4>
          <h4 style={{ fontWeight: 400 }}>
            {validGroup ? 'Subscribed' : 'Not subscribed'}
          </h4>
        </div>
        {/* Show subscription status only when form is clean (saved state) */}
        {validGroup &&
          (formStatus === 'new' ||
            formStatus === 'modified' ||
            formStatus === 'pending') && (
            <div>
              <h3>Group Subscription</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'max-content 1fr',
                  rowGap: '0.5em',
                  columnGap: '1em',
                  alignItems: 'baseline',
                  marginBottom: '1em',
                }}
              >
                <h4>Group name:</h4>
                <h4 style={{ fontWeight: 400 }}>{validGroup.groupName}</h4>
                <h4>PI(s) or Group lead(s):</h4>
                {validGroup.groupLeads.length > 0 ? (
                  <h4 style={{ fontWeight: 400 }}>
                    {validGroup.groupLeads
                      .map((lead) => `${lead.name} (${lead.organization})`)
                      .join(', ')}
                  </h4>
                ) : (
                  <h4 style={{ fontStyle: 'italic', fontWeight: 400 }}>
                    None provided
                  </h4>
                )}
              </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2em' }}>
            <Banner
              banner={{
                type: 'info',
                message: (
                  <div>
                    If you are a PI or group manager,{' '}
                    <Link to="/static-content/subscriptions.html">
                      create a subscription
                    </Link>
                    .
                  </div>
                ),
              }}
            />
            <NumberedHeader
              number={1}
              text="Find your group or lab"
              color={
                theme?.palette.primary.hue[theme?.palette.primary.level] ??
                'blue'
              }
            />
            <div
              style={{
                marginLeft: '1.5em',
                marginBottom: '1em',
                marginRight: '1em',
                display: 'flex',
                flexDirection: 'column',
                gap: '1em',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '1em',
                  marginRight: '0.5em',
                }}
              >
                <h4>Group name:</h4>
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
                  className="wdk-UserProfile-TypeAheadSelect"
                />
              </div>
              <span
                style={{
                  fontStyle: 'italic',
                  fontSize: '1.1em',
                  color: colors.gray[700],
                }}
              >
                Don't see your group listed? Ask your group lead or
                administrator to create a subscription.
              </span>
            </div>

            <NumberedHeader
              number={2}
              text="Associate your account with your group"
              color={
                theme?.palette.primary.hue[theme?.palette.primary.level] ??
                'blue'
              }
            />
            <div
              style={{
                marginLeft: '1.5em',
                display: 'flex',
                flexDirection: 'column',
                gap: '1em',
                marginRight: '1em',
              }}
            >
              <span style={{ fontSize: '1.2em' }}>
                Click the button to associate your VEuPathDB account with your
                group. There is no cost to join a group.
              </span>
              {saveButton}
            </div>
            <span style={{ marginTop: '3em', color: colors.gray[700] }}>
              Questions? <Link to="/contact-us">Contact us</Link> if you need
              help joining a subscription.
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
        <div style={{ padding: '1em', width: 550, display: 'grid' }}>
          <p
            style={{
              fontSize: '1.2em',
              fontWeight: 500,
              marginBottom: 0,
              justifySelf: 'center',
            }}
          >
            Are you sure you want to leave the group?
          </p>
          <p style={{ fontSize: '1.2em', justifySelf: 'center' }}>
            If your position or affiliation has changed, please additionally
            update the Account page.
          </p>
          <div
            style={{
              marginTop: '3em',
              display: 'flex',
              justifyContent: 'space-between',
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
              styleOverrides={{ container: { minWidth: 'max-content' } }}
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
