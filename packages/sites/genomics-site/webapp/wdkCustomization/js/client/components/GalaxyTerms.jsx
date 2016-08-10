import { Image, Loading } from 'wdk-client/Components';

let GalaxyTerms = React.createClass({

  render() {
    if (this.willRedirectToGlobus()) {
      return <Loading/>;
    }
    return (
      <div id="eupathdb-GalaxyTerms">
        <h1>Analyze My Experiment</h1>
        <p>
          It looks like this is the first time you are exploring this service.
        </p>
        <p>
          We have a little paperwork to get out of the way.
        </p>
        <p>
          The EuPathDB Galaxy service is hosted by Globus Genomics, an affiate of Globus.
        </p>
        <p>
          The following login screen will always appear.
        </p>
        <table id="eupathdb-GalaxyTerms-login">
          <tbody>
            <tr><td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td></tr>
          </tbody>
        </table>
        <p>
          However <em>just for this first visit to Galaxy,</em> Globus will show you three screens. Here
          is a preview, so you know what to expect.
        </p>
        <table id="eupathdb-GalaxyTerms-initial">
          <tbody>
            <tr>
              <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
              <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
              <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
            </tr>
            <tr>
              <td>
                (1) If you already have a Globus account, you can
                link it to your new EuPathDB account.
                <strong>Your choice.</strong> If you don't
                have a prior Globus account, choose <strong>No Thanks.</strong>
              </td>
              <td>
                (2) Their Terms and Conditions.<br />
                <strong>Please read and click Agree</strong>
              </td>
              <td>
                (3) Permission to share identity with us.<br />
                <strong>Please click Allow.</strong>
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