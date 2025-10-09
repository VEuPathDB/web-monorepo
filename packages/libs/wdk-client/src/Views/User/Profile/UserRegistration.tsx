import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserFormContainer, {
  getDescriptionBoxStyle,
} from '../../../Views/User/UserFormContainer';
import { UserProfileFormData } from '../../../StoreModules/UserProfileStoreModule';
import { GlobalData } from '../../../StoreModules/GlobalData';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { ALL_VEUPATHDB_PROJECTS } from '../../../Utils/ProjectConstants';
import { formatList } from '../../../Utils/FormatUtils';

// Props interface based on what UserRegistrationController actually passes
interface UserRegistrationProps {
  globalData: GlobalData;
  userFormData?: UserProfileFormData;
  previousUserFormData?: UserProfileFormData;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  userEvents: {
    updateProfileForm: (newState: UserProfileFormData) => void;
    submitRegistrationForm: (formData: UserProfileFormData) => void;
    conditionallyTransition: (
      condition: (user: any) => boolean,
      path: string
    ) => void;
    showLoginForm: (destination?: string) => void;
  };
  initialFormFields?: Record<string, string>;
}

const IntroText: React.FC = () => (
  <div style={{ margin: '2em 0em' }}>
    <Banner
      banner={{
        type: 'info',
        message: (
          <p style={{ margin: '0.5em 0em' }}>
            If you already registered in another site (
            <i>{formatList([...ALL_VEUPATHDB_PROJECTS], 'or')}</i>) you do NOT
            need to register again.
          </p>
        ),
        pinned: true,
      }}
    />
  </div>
);

const WhyRegister: React.FC = () => (
  <Banner
    banner={{
      type: 'normal',
      hideIcon: true,
      message: (
        <div
          style={{ marginLeft: '1em', marginRight: '1em', marginBottom: '1em' }}
        >
          <h4>Why register/subscribe?</h4>
          <div id="cirbulletlist">
            <ul>
              <li>Permanently save Search Strategies</li>
              <li>Use a Basket to make a set of IDs of interest</li>
              <li>Use Favorites to mark IDs of interest, for fast access</li>
              <li>Add a comment on Genes, Sequences and other record types</li>
              <li>Set site preferences</li>
            </ul>
          </div>
        </div>
      ),
      pinned: true,
    }}
  />
);

const PrivacyPolicy: React.FC = () => (
  <div style={getDescriptionBoxStyle()}>
    <h4>
      <a
        title="It will open in a new tab"
        target="_blank"
        href="/a/app/static-content/privacyPolicy.html"
      >
        VEuPathDB Websites Privacy Policy
      </a>
    </h4>
    <table>
      <tbody>
        <tr>
          <td width="40%">
            <p>
              <b>How we will use your email:</b>
            </p>
            <div id="cirbulletlist">
              <ul>
                <li>Confirm your subscription.</li>
                <li>If you subscribe to them, send infrequent email alerts.</li>
                <li>NOTHING ELSE. We will not release the email list.</li>
              </ul>
            </div>
          </td>
          <td>
            <p>
              <b>How we will use your name and institution:</b>
            </p>
            <div id="cirbulletlist">
              <ul>
                <li>
                  If you add a comment to a Gene or a Sequence, your name and
                  institution will be displayed with the comment.
                </li>
                <li>
                  If you make a search strategy public, your name and
                  institution will be displayed with it.
                </li>
                <li>
                  NOTHING ELSE. We will not release your name or institution.
                </li>
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

/**
 * React component for the user profile/account form
 */
const UserRegistration: React.FC<UserRegistrationProps> = (props) => (
  <div>
    <UserFormContainer
      globalData={props.globalData}
      userFormData={props.userFormData}
      previousUserFormData={props.previousUserFormData}
      formStatus={props.formStatus}
      errorMessage={props.errorMessage}
      userEvents={{
        ...props.userEvents,
        submitProfileForm: props.userEvents.submitRegistrationForm,
        deleteAccount: () => {}, // no-op function; no need to delete account on registration page
      }}
      shouldHideForm={!props.globalData.user?.isGuest}
      hiddenFormMessage="You must log out before registering a new user."
      titleText="Registration"
      introComponent={IntroText}
      singleFormMode={true}
      saveButtonText={{
        save: 'Register',
        saving: 'Registering...',
        saved: 'Registered',
      }}
    />
    {props.globalData.user?.isGuest && (
      <>
        {props.formStatus === 'success' && (
          <div style={{ marginTop: '2em', marginLeft: '24px' }}>
            <Banner
              banner={{
                type: 'success',
                message:
                  'You have registered successfully. Please check your email (inbox and spam folder) for a temporary password.',
                pinned: true,
                primaryActionButtonProps: {
                  text: 'Log in',
                  onPress: () => props.userEvents.showLoginForm('/'),
                },
              }}
            />
          </div>
        )}
        {props.formStatus === 'error' && props.errorMessage && (
          <div style={{ marginTop: '2em', marginLeft: '24px' }}>
            <Banner
              banner={{
                type: 'error',
                message: props.errorMessage,
                pinned: true,
              }}
            />
          </div>
        )}
        <div
          style={{
            marginTop: '2em',
            marginLeft: '24px',
            maxWidth: 'max-content',
          }}
        >
          <WhyRegister />
        </div>
      </>
    )}
  </div>
);

export default wrappable(UserRegistration);
