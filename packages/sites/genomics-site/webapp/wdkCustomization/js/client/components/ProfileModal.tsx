import { Modal } from '@veupathdb/coreui';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { UserProfileController } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function ProfileModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const [user, projectConfig] = useSelector(
    (state: RootState) =>
      [state.globalData.user, state.globalData.config] as const
  );

  useEffect(() => {
    if (user == null || projectConfig == null || user.isGuest) return;

    const visible = projectConfig.userProfileProperties.some(
      (prop) => prop.isRequired && user.properties[prop.name] == null
    );

    setModalVisible(visible);
  }, [user, projectConfig]);

  return (
    <Modal toggleVisible={setModalVisible} visible={modalVisible}>
      <div
        style={{
          maxWidth: '75em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1em 2em',
        }}
      >
        <Banner
          banner={{
            type: 'warning',
            hideIcon: true,
            fontSize: '1.2em',
            message: (
              <div>
                As of October 2024, VEuPathDB is moving to a new funding model.
                Users must be logged in to use the platform, which helps us
                collect accurate usage data. Please register or update your
                registration details - you only need to do this once. We will
                never share your information and adhere to GDPR rules.
              </div>
            ),
          }}
        />
        <UserProfileController />
      </div>
    </Modal>
  );
}
