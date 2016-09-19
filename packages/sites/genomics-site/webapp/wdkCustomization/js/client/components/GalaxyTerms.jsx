import { PropTypes } from 'react';
import { Link } from 'wdk-client/Components';
import { projectId } from '../config';

/**
 * Galaxy page component
 */
export default function GalaxyTerms(props) {
  let { user, showLoginForm } = props;
  return (
    <div id="eupathdb-GalaxyTerms">
      <h1>Analyze My Experiment</h1>

      <p className="eupathdb-GalaxyTermsLead">
        <em>Welcome to the free EuPathDB Galaxy Data Analysis Services.</em>
        This service uses a dedicated Galaxy site preloaded with EuPathDB genomes and
        workflows, and is hosted by <a href="https://www.globus.org/genomics">
        Globus Genomics</a>, an affiliate of <a href="https://www.globus.org">Globus</a>.
      </p>

      <div className="eupathdb-GalaxyWelcomeGrid">
        <div>
          <p>Use Galaxy to analyze RNA-seq, ChIP-seq, Variants, and many other data sets.</p>
          <p>Some analysis results will be available as tracks and searches in {projectId}.</p>
        </div>
        <div>
          <img src="/a/wdkCustomization/images/globus-01-welcome-page.png"/>
        </div>
      </div>

      <div className="eupathdb-GalaxyTermsContinueLink">
        {user.isGuest ? (
          <a href="#login" onClick={e => {
            e.preventDefault();
            showLoginForm('/a/app/galaxy-orientation/sign-up')
          }} className="eupathdb-BigButton">
            Continue with Galaxy Sign-up
          </a>
        ) : (
          <Link to="/galaxy-orientation/sign-up" className="eupathdb-BigButton">
            Continue with Galaxy Sign-up
          </Link>
        )}
      </div>
    </div>
  );
}

GalaxyTerms.propTypes = {
  user: PropTypes.object.isRequired,
  showLoginForm: PropTypes.func.isRequired
};
