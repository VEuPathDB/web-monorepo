import { Modal } from '@veupathdb/coreui';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { UserProfileController } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { clearAuthCookie } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * If a user has missing required profile fields, show a modal with the user profile form.
 * Once the required fields are updated, close the modal.
 *
 * Also handles edge case where user deleted their account on a sister site but still has
 * an auth cookie on this site - detects deleted user and clears cookie + redirects.
 */
export function ProfileModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [user, projectConfig] = useSelector(
    (state: RootState) =>
      [state.globalData.user, state.globalData.config] as const
  );

  useEffect(() => {
    if (user == null || projectConfig == null || user.isGuest) return;

    // Check if this is a deleted user from a sister site
    const firstName = user.properties['firstName'];
    const lastName = user.properties['lastName'];
    const isDeletedUser =
      firstName === 'deleted-user' &&
      !isNaN(parseInt(lastName)) &&
      user.email === `${firstName}.${lastName}@veupathdb.org`;

    if (isDeletedUser) {
      // User deleted their account on another site, clean up and redirect
      clearAuthCookie();
      window.location.assign('/a/app/user/message/account-deleted');
      return;
    }

    const visible = projectConfig.userProfileProperties.some(
      (prop) => prop.isRequired && !user.properties[prop.name]
    );

    setModalVisible(visible);
  }, [user, projectConfig]);

  return (
    <Modal
      closeOnEsc={false}
      toggleVisible={setModalVisible}
      visible={modalVisible}
    >
      <div
        style={{
          maxWidth: '75em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1em 2em',
        }}
      >
        <UserProfileController
          introComponent={NewProfilePropertiesBanner}
          singleFormMode={true}
          highlightMissingFields={true}
          showSubscriptionProds={false}
        />
      </div>
    </Modal>
  );
}

function NewProfilePropertiesBanner() {
  return (
    <Banner
      banner={{
        type: 'warning',
        hideIcon: true,
        fontSize: '1.2em',
        message: (
          <>
            Please complete the newly required fields below, and take a moment
            to review your profile. This will help us understand how our
            platform contributes to your research and in making future
            improvements. We value your privacy and comply with{' '}
            <a target="_blank" rel="noreferrer" href="https://gdpr-info.eu/">
              GDPR
            </a>{' '}
            regulations. Your information is safe with us. Thanks for being part
            of our community!
          </>
        ),
      }}
    />
  );
}
