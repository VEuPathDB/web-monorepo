import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { UserProfileController } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkDependenciesEffect } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import React, { useRef } from 'react';

export function ProfileModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useWdkDependenciesEffect(async ({ wdkService }) => {
    const [projectConfig, user] = await Promise.all([
      wdkService.getConfig(),
      wdkService.getCurrentUser(),
    ]);

    if (user.isGuest) return;

    for (const profileProperty of projectConfig.userProfileProperties) {
      if (
        profileProperty.isRequired &&
        user.properties[profileProperty.name] == null
      ) {
        dialogRef.current?.showModal();
      }
    }
  }, []);
  return (
    <dialog ref={dialogRef}>
      <div
        style={{
          maxWidth: '70em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Banner
          banner={{
            type: 'warning',
            hideIcon: true,
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
    </dialog>
  );
}
