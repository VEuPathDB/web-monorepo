import { grey } from '@material-ui/core/colors';
import './Profile/UserProfile.scss';
import { UserAccountFormProps } from './UserAccountForm';
import Grid from '@material-ui/core/Grid/Grid';
import { OutlinedButton } from '@veupathdb/coreui';

/**
 * React component that renders the Security tab of the Account page.
 */
export const UserSecurityForm = (
  props: Pick<UserAccountFormProps, 'wdkConfig' | 'user'>
) => {
  const { wdkConfig, user } = props;

  let url = '';
  if (
    wdkConfig.changePasswordUrl != null &&
    wdkConfig.changePasswordUrl != ''
  ) {
    // Use prop URL and add optional query params to help it out
    // Expect something like: changePassword.html?returnUrl={{returnUrl}}&suggestedUsername={{suggestedUsername}}
    url = wdkConfig.changePasswordUrl
      .replace('{{returnUrl}}', encodeURIComponent(window.location.href))
      .replace('{{suggestedUsername}}', encodeURIComponent(user.email));
  } else {
    url = `/user/profile/password`;
  }

  return (
    <>
      <h2>Security</h2>
      <h3 style={{ paddingTop: 0 }}>Authentication</h3>
      <Grid
        container
        spacing={1}
        alignItems="center"
        justifyContent="flex-start"
      >
        <Grid item xs={6}>
          <h4>Password:</h4>
        </Grid>
        <Grid item xs={6}>
          <OutlinedButton
            text="Change your password"
            onPress={() => (window.location.href = url)}
            themeRole="primary"
          />
        </Grid>
        <Grid item xs={12}>
          <p style={{ color: grey[700], fontSize: '0.9em', marginTop: 0 }}>
            You will be redirected to an affiliated page where you can change
            your password.
          </p>
        </Grid>
      </Grid>
    </>
  );
};
