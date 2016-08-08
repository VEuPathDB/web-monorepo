import {Image} from 'wdk-client/Components';

let GalaxyTerms = React.createClass({

  render() {
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
          Before heading to Galaxy, Globus will show you three screens, <em>just this first time</em>. Here
          is a preview, so you know what to expect.
        </p>
        <table id="eupathdb-GalaxyTerms-imageTable">
          <tbody>
          <tr>
            <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
            <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
            <td><Image title="Screenshot of Globus Page" src="wdkCustomization/images/globusGalaxy.png"/></td>
          </tr>
          <tr>
            <td>
              (1) Their Terms and Conditions.<br />
              <strong>Please read and click Agree</strong>
            </td>
            <td>
              (2) If you already have a Globus account, you can
              link it to your new EuPathDB account.
              <strong>Your choice.</strong> If you don't
              have a prior Globus account, choose <strong>No Thanks.</strong>
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
  onSubmit() {
    if(this.props.user.isGuest) {
      alert("Please log in first");
    }
    else {
      this.props.galaxyTermsActions.updateUserPreference("show-galaxy-orientation-page",false);
      location.href = "https://eupathdb.globusgenomics.org";
    }
  }
});

export default GalaxyTerms;