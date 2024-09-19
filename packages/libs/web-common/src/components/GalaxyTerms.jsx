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
    (state) => state.globalData.config && state.globalData.config.displayName
  );

  return (
    <GalaxyPageLayout>
      <div>
        {displayName != 'OrthoMCL' && (
          <div>
            <p>
              Owing to funding changes at VEuPathDB, the VEuPathDB Galaxy is not
              currently available.
              <br />
              <br />
              We are very sorry for the inconvenience.
              <br />
              <br />
              The VEuPathDB team
            </p>
          </div>
        )}
        {displayName == 'OrthoMCL' && (
          <div>
            <p>
              Owing to funding changes at VEuPathDB, this tool is not currently
              available.
              <br />
              <br />
              We are working on a replacement, expected before the end of
              September. Please check back soon.
              <br />
              <br />
              We are very sorry for the inconvenience.
              <br />
              <br />
              The VEuPathDB team
            </p>
          </div>
        )}
      </div>
    </GalaxyPageLayout>
  );
}

GalaxyTerms.propTypes = {
  user: PropTypes.object.isRequired,
  showLoginForm: PropTypes.func.isRequired,
};
