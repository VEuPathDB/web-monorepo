import React, { useState, useEffect, useMemo, JSX } from 'react';
import { IconAlt as Icon } from '../../Components';
import { SubscriptionGroup } from '../../Service/Mixins/OauthService';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { ValueType } from 'react-select/src/types';
import {
  OutlinedButton,
  SaveButton,
} from '@veupathdb/coreui/lib/components/buttons';
import { Dialog } from '../../Components';
import colors, {
  success,
  warning,
} from '@veupathdb/coreui/lib/definitions/colors';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { User } from '../../Utils/WdkUser';
import NumberedHeader from '@veupathdb/coreui/lib/components/forms/NumberedHeader';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import './UserSubscriptionManagement.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../Core/State/Types';
import { deburr } from 'lodash';
import { userIsClassParticipant } from '../../Utils/Subscriptions';
import { useSubscriptionGroupsByLead } from '../../Hooks/SubscriptionGroups';

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
  showSubscriptionProds?: boolean;
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
  showSubscriptionProds,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localSelection, setLocalSelection] = useState<string>();
  const projectId = useSelector<RootState>(
    (state) => state.globalData.siteConfig.projectId
  );
  const theme = useUITheme();

  // Reset local selection when database state changes (after successful save)
  useEffect(() => {
    if (formStatus === 'new') {
      setLocalSelection(undefined);
    }
  }, [formStatus]);

  const tokenField = 'subscriptionToken';
  const userGroupToken = user.properties[tokenField]; // from db-backed state

  const findValidGroup = (
    token: string,
    subscriptionGroups: SubscriptionGroup[]
  ) => {
    if (!token) return undefined;
    const validGroupList = subscriptionGroups.filter(
      (g) => g.subscriptionToken === token
    );
    return validGroupList.length === 0 ? undefined : validGroupList[0];
  };

  const validGroup = useMemo(
    () => findValidGroup(userGroupToken, subscriptionGroups),
    [userGroupToken, subscriptionGroups]
  );

  const groupVocab = useMemo(
    () =>
      [{ value: '', label: '--' }].concat(
        subscriptionGroups.map((group) => ({
          value: group.subscriptionToken,
          label: group.groupName,
        }))
      ),
    [subscriptionGroups]
  );

  const isMultiGroupSubscription = useMemo(() => {
    if (validGroup?.subscriberName == null) return false;

    let count = 0;
    return subscriptionGroups.some(
      (group) =>
        group.subscriberName === validGroup.subscriberName && ++count === 2
    );
  }, [subscriptionGroups, validGroup]);

  const deburredGroups = useMemo(
    () =>
      subscriptionGroups.map((group) => ({
        ...group,
        deburredGroupName: deburr(group.groupName.toLowerCase()),
        deburredSubscriberName: deburr(group.subscriberName?.toLowerCase()),
        deburredLeads: group.groupLeads.map((lead) => ({
          ...lead,
          deburredName: deburr(lead.name.toLowerCase()),
          deburredOrganization: deburr(lead.organization.toLowerCase()),
        })),
      })),
    [subscriptionGroups]
  );

  const selectedGroup = useMemo(() => {
    const effectiveToken = localSelection ?? userGroupToken;
    const group = findValidGroup(effectiveToken, subscriptionGroups);
    const groupValue = group ? group.subscriptionToken : '';
    return groupVocab.filter((g) => g.value === groupValue)[0]; // should always find it!
  }, [subscriptionGroups, groupVocab, userGroupToken, localSelection]);

  const isClassParticipant = userIsClassParticipant(user);

  let managedGroups = useSubscriptionGroupsByLead();

  return (
    <div className="wdk-UserProfile-profileForm">
      <h2>Subscription</h2>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5em' }}>
        <h4>Status: </h4>
        {validGroup ? (
          <>
            <Icon
              fa="check-circle"
              className="wdk-UserProfile-StatusIcon--success"
              style={{ color: success[600], fontSize: '1.2em' }}
            />
            <h4 style={{ fontWeight: 400 }}>Subscribed</h4>
          </>
        ) : isClassParticipant ? (
          <>
            <Icon
              fa="mortar-board"
              className="wdk-UserProfile-StatusIcon--student"
              style={{ color: 'black', fontSize: '1.2em' }}
            />
            <h4 style={{ fontWeight: 400 }}>
              Class participant <em>(subscription not required)</em>
            </h4>
          </>
        ) : (
          <>
            {showSubscriptionProds && (
              <Icon
                fa="exclamation-triangle"
                className="wdk-UserProfile-StatusIcon--warning"
                style={{ color: warning[600], fontSize: '1.2em' }}
              />
            )}
            <h4 style={{ fontWeight: 400 }}>Not subscribed</h4>
          </>
        )}
      </div>
      {/* Show subscription status only when form is clean (saved state) */}
      {validGroup &&
        (formStatus === 'new' ||
          formStatus === 'modified' ||
          formStatus === 'pending') && (
          <div>
            <h3>Group subscription</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'max-content 1fr',
                rowGap: '0.5em',
                columnGap: '1em',
                alignItems: 'baseline',
                marginBottom: '1em',
                minWidth: 800, // accommodate the really long names.
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
              {validGroup.subscriberName && (
                <>
                  <h4>
                    {isMultiGroupSubscription ? (
                      <>Multi-group subscriber:</>
                    ) : (
                      <>
                        Subscriber:
                        <br />
                        (where different from subscribed group)
                      </>
                    )}
                  </h4>
                  <h4 style={{ fontWeight: 400 }}>
                    {validGroup.subscriberName}
                  </h4>
                </>
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

      {/* Show any groups this user manages (if they manage more than zero) */}
      {managedGroups && managedGroups.length > 0 && (
        <div>
          <h3>Groups I Manage</h3>
          {managedGroups.map((group) => (
            <div>
              <h4>{group.groupName}</h4>
              <div style={{ margin: '0 30px' }}>
                <h4>Leads</h4>
                <ul>
                  {group.groupLeads.map((u) => (
                    <li>
                      {u.name} ({u.organization})
                    </li>
                  ))}
                </ul>
                <h4>Members</h4>
                <ul>
                  {group.members.map((u) => (
                    <li>
                      {u.name} ({u.organization})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show group selection when no saved group OR when there are unsaved changes AND when the modal is not there */}
      {(!validGroup || formStatus !== 'new') && !showConfirmModal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2em' }}>
          <Banner
            banner={{
              type: 'info',
              message: showSubscriptionProds ? (
                <div>
                  If you are a PI or group manager,{' '}
                  <Link to="/static-content/subscriptions.html">
                    create a subscription
                  </Link>
                  .
                </div>
              ) : (
                `Please note, subscriptions are not required for ${projectId}.`
              ),
            }}
          />
          <NumberedHeader
            number={1}
            text="Find your group or lab"
            color={
              theme?.palette.primary.hue[theme?.palette.primary.level] ?? 'blue'
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
              <Select<Option, false>
                isMulti={false}
                isSearchable
                options={groupVocab}
                value={selectedGroup}
                onChange={(option) => {
                  const value = option?.value ?? '';
                  setLocalSelection(value);
                  onPropertyChange(tokenField)(value);
                }}
                formatOptionLabel={(option) => option.label}
                filterOption={(option, inputValue) => {
                  const group = deburredGroups.find(
                    (g) => g.subscriptionToken === option.value
                  );
                  if (!group) return false;

                  const searchText = deburr(inputValue.toLowerCase().trim());
                  return (
                    group.deburredGroupName.includes(searchText) ||
                    group.deburredSubscriberName.includes(searchText) ||
                    group.deburredLeads.some(
                      (lead) =>
                        lead.deburredName.includes(searchText) ||
                        lead.deburredOrganization.includes(searchText)
                    )
                  );
                }}
                form="DO_NOT_SUBMIT_ON_ENTER"
                className="wdk-UserProfile-TypeAheadSelect"
                styles={{
                  valueContainer: (provided) => ({
                    ...provided,
                    cursor: 'text',
                  }),
                  indicatorsContainer: (provided) => ({
                    ...provided,
                    cursor: 'pointer', // Keep dropdown arrow as pointer
                  }),
                }}
                theme={(selectTheme) => ({
                  ...selectTheme,
                  colors: {
                    ...selectTheme.colors,
                    primary25:
                      theme?.palette.primary.hue[200] ??
                      selectTheme.colors.primary25,
                    primary:
                      theme?.palette.primary.hue[theme.palette.primary.level] ??
                      selectTheme.colors.primary,
                  },
                })}
              />
            </div>
            <span
              style={{
                fontStyle: 'italic',
                fontSize: '1.1em',
                color: colors.gray[700],
              }}
            >
              Don't see your group listed? Ask your group lead or administrator
              to{' '}
              <Link to="/static-content/subscriptions.html">
                create a subscription
              </Link>
              .
            </span>
          </div>

          <NumberedHeader
            number={2}
            text="Associate your account with your group"
            color={
              localSelection
                ? theme?.palette.primary.hue[theme?.palette.primary.level] ??
                  'blue'
                : colors.gray[500]
            }
          />
          <div
            style={{
              marginLeft: '1.5em',
              display: 'flex',
              flexDirection: 'column',
              gap: '1em',
              marginRight: '1em',
              color: localSelection ? colors.gray[900] : colors.gray[500],
              fontSize: '1.2em',
            }}
          >
            <span>
              Click the Save button to associate your VEuPathDB account with the
              group:
            </span>
            {selectedGroup.label && selectedGroup.label !== '--' ? (
              <span style={{ fontWeight: 600 }}>{selectedGroup.label}</span>
            ) : (
              <span style={{ fontStyle: 'italic' }}>No group selected</span>
            )}
          </div>
          {saveButton}
          <span style={{ marginTop: '2em', color: colors.gray[700] }}>
            Questions? <Link to="/contact-us">Contact us</Link> if you need help
            joining a subscription.
          </span>
        </div>
      )}
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
              marginBottom: '1em',
              justifySelf: 'center',
            }}
          >
            Are you sure you want to leave the group?
          </p>
          <p
            style={{
              fontSize: '1.2em',
              justifySelf: 'center',
              textAlign: 'center',
              width: 400,
            }}
          >
            If your position or affiliation has changed, please additionally
            update the Profile tab.
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
