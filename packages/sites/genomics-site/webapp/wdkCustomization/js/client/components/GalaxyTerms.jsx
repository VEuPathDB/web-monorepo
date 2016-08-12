import { Image, Loading } from 'wdk-client/Components';

let GalaxyTerms = React.createClass({

  render() {
    if (this.willRedirectToGlobus()) {
      return <Loading/>;
    }
    return (
      <div id="eupathdb-GalaxyTerms">
        <h1>Analyze My Experiment</h1>
        <div>
          <p className="eupath-bigItalic">Welcome to the EuPathDB Data Analysis Services</p>
          <p>EuPathDB provides a free data analysis service.  Use it to analyze your experimental data. 
             The service uses Galaxy and is provided as a collaboration between EuPathDB and 
             <a href="https://www.globus.org/genomics"> Globus Genomics</a>, an affiliate of &nbsp;
             <a href="https://www.globus.org">Globus</a>.
          </p>
          <p>The easy-to-use services offered are:
            <ul>
            <li> RNA Sequencing </li>
            <li> SNP Calling    </li>
            </ul>
          </p>
        </div>
        <br />
        <div>
          <p> Before heading to Galaxy for the first time, Globus will show you three screens.  
              Here is a preview, so you know what to expect.
          </p>
          <div id="eupathdb-GalaxyTerms-initial">
          <span className="column-left" >
            <Image title="Option to link an existing Globus Account" src="wdkCustomization/images/globus-02-link-account.jpg"/>
              <p>
                (1) If you already have a Globus account, you can link it to
                your EuPathDB account. <strong>Your choice.</strong> If you
                don't have a prior Globus account, choose <strong>No Thanks</strong>.
              </p>
          </span>
          <span className="column-center">
            <Image title="Agree to Globus account terms" src="wdkCustomization/images/globus-03-account-terms.jpg"/>
            <p>
                (2) Complete your account information and agree to Globus's
                Terms and Conditions. Please read, make your selections, and click <strong>Continue</strong>.
            </p>
          </span>
          <span className="column-right">
            <Image title="Grant permission to access your Globus account" src="wdkCustomization/images/globus-04-oauth-perms.jpg"/>
            <p>
                (3) Grant permission to share your Globus identity and files
                with us. Please click <strong>Allow</strong>.
            </p>
          </span>
          </div>
        </div>
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
