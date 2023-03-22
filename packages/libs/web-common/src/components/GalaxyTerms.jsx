import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import GalaxyPageLayout from './GalaxyPageLayout';
import welcomeImage from '../../images/globus-01-welcome-page.png';

/**
 * Galaxy page component
 */
export default function GalaxyTerms(props) {
  let { user, showLoginForm } = props;
  const displayName = useSelector(
    state => state.globalData.config && state.globalData.config.displayName
  );

  return (
    <GalaxyPageLayout>
      <p className="eupathdb-GalaxyTermsLead">
        <em>Welcome to the free VEuPathDB Galaxy Data Analysis Service. </em>
        This service uses a dedicated Galaxy site preloaded with VEuPathDB genomes and
        workflows, and is hosted by <a href="https://www.globus.org/genomics">
        Globus Genomics</a>, an affiliate of <a href="https://www.globus.org">Globus</a>.
      </p>

      <div className="eupathdb-GalaxyWelcomeGrid">
        {displayName != 'OrthoMCL' && (<div>
          <p>Use Galaxy to analyze RNA-Seq, ChIP-Seq, Variants, and many other data sets.</p>
          <p>Some analysis results will be available as tracks and searches in {displayName}.</p>
        </div>)}
       {displayName == 'OrthoMCL' && (<div className="smaller-font">
	  <p>In VEuPathDB Galaxy, you can upload your set of proteins as a .fasta file and map the proteins to OrthoMCL Core and Residual groups.</p>
          <p>Any proteins that do not map to a defined group are subject to the OrthoMCL algorithm, allowing the formation of additional groups. If your set of proteins is from a single species, each additional group will consist of a set of paralogs.</p>
          <p>First log into OrthoMCL and then press the "Go to Galaxy" button.</p>
        </div>)}
        <div>
          <img src={welcomeImage}/>
        </div>
      </div>

      <div className="eupathdb-GalaxyTermsContinueLink">
        {user.isGuest ? (
          <a href="#login" onClick={e => {
            e.preventDefault();
            showLoginForm('/a/app/galaxy-orientation/sign-up')
          }} className="eupathdb-BigButton">
            Go to Galaxy
          </a>
        ) : (
          <Link to="/galaxy-orientation/sign-up" className="eupathdb-BigButton">
            Go to Galaxy
          </Link>
        )}
      </div>
    </GalaxyPageLayout>
  );
}

GalaxyTerms.propTypes = {
  user: PropTypes.object.isRequired,
  showLoginForm: PropTypes.func.isRequired
};
