import { Image, Loading } from 'wdk-client/Components';

let GalaxyTerms = React.createClass({

  render() {
    if (this.willRedirectToGlobus()) {
      return <Loading/>;
    }
    return (
      <div id="eupathdb-GalaxyTerms">
        <h1>Analyze My Experiment</h1>
        <table id="eupathdb-GalaxyTerms-login">
          <tbody>
            <tr>
              <td width="60%">
                <p>It looks like this is the first time you are exploring this service.</p>
                <p>We have a little paperwork to get out of the way.</p>
                <p>The EuPathDB Galaxy service is hosted by Globus Genomics, an affiate of Globus.</p>
                <p>This first login screen will always appear:</p>
              </td>
              <td width="40%" align="right"><Image title="Globus Login Gateway" src="wdkCustomization/images/globus-01-log-in.jpg"/></td>
            </tr>
          </tbody>
        </table>
        <p>
          However <em>just for this first visit to Galaxy,</em> Globus will show you three screens. Here
          is a preview, so you know what to expect.
        </p>
        <table id="eupathdb-GalaxyTerms-initial">
          <tbody>
            <tr>
              <td><Image title="Option to link an existing Globus Account" src="wdkCustomization/images/globus-02-link-account.jpg"/></td>
              <td><Image title="Agree to Globus account terms" src="wdkCustomization/images/globus-03-account-terms.jpg"/></td>
              <td><Image title="Grant permission to access your Globus account" src="wdkCustomization/images/globus-04-oauth-perms.jpg"/></td>
            </tr>
            <tr>
              <td>
                (1) If you already have a Globus account, you can link it to
                your EuPathDB account. <strong>Your choice.</strong> If you
                don't have a prior Globus account, choose <strong>No Thanks</strong>.
              </td>
              <td>
                (2) Complete your account information and agree to Globus's
                Terms and Conditions. Please read, make your selections, and click <strong>Continue</strong>.
              </td>
              <td>
                (3) Grant permission to share your Globus identity and files
                with us. Please click <strong>Allow</strong>.
              </td>
            </tr>
          </tbody>
        </table>
        <div id="eupathdb-GalaxyTerms-submit">
          <input name="galaxySubmit" value="Go to Galaxy" title="Click to go to galaxy" type="submit" onClick={this.onSubmit} />
        </div>
      </div>
    );
  },

  willRedirectToGlobus() {
    if (!this.props.user.isGuest && this.props.preferences["show-galaxy-orientation-page"] == "false") {
      location.replace("https://eupathdb.globusgenomics.org");
      return true;
    }
    return false;
  },

  onSubmit() {
    if (this.props.user.isGuest) {
      return this.props.galaxyTermsActions.showLoginWarning("use Galaxy")
    }
    else {
      this.props.galaxyTermsActions.updateUserPreference("show-galaxy-orientation-page", "false");
    }
  }
});

export default GalaxyTerms;
