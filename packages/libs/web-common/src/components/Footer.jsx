import React from 'react';
import { connect } from 'react-redux';
import NewWindowLink from './NewWindowLink';
import { formatReleaseDate } from '../util/formatters';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/coreui';

import '../components/homepage/ProjectLink.scss';

const projectLinkCx = makeClassNameHelper('ebrc-ProjectLink');

const projects = [
  'VEuPathDB',
  'AmoebaDB',
  'CryptoDB',
  'FungiDB',
  'GiardiaDB',
  'MicrosporidiaDB',
  'PiroplasmaDB',
  'PlasmoDB',
  'ToxoDB',
  'TrichDB',
  'TriTrypDB',
  'VectorBase',
  'OrthoMCL',
  'ClinEpiDB',
  'MicrobiomeDB',
];

const enhance = connect((state) => state.globalData, null);
/** Application footer */
export default enhance(function Footer(props) {
  const {
    siteAck,
    siteConfig: { webAppUrl },
    config: { buildNumber, displayName, releaseDate } = {},
  } = props;

  return (
    <div className="Footer">
      <div>
        <div>
          <a href={`//${location.hostname}`}>{displayName}</a>
          <span>&nbsp;Release {buildNumber}</span>
          <span style={{ whiteSpace: 'nowrap' }}>
            {' '}
            &nbsp;&nbsp; {releaseDate && formatReleaseDate(releaseDate)}
          </span>
        </div>
        <div className="copyright">
          ©{new Date().getFullYear()} The VEuPathDB Project Team
        </div>
      </div>

      <div>
        <ul className="site-icons">
          {projects.map((project) => (
            <React.Fragment key={project}>
              <Tooltip title={`${project}.org`}>
                <li className={projectLinkCx()}>
                  <a
                    href={`https://${project.toLowerCase()}.org`}
                    className={project}
                  >
                    https://{project.toLowerCase()}.org
                  </a>
                </li>
              </Tooltip>
              {project === 'VectorBase' && <li className="divider"></li>}
            </React.Fragment>
          ))}
        </ul>
      </div>

      <div>
        <div className="contact-us">
          Please{' '}
          <NewWindowLink href={webAppUrl + '/app/contact-us'}>
            Contact Us
          </NewWindowLink>{' '}
          with any questions or comments
        </div>
      </div>

      {siteAck != null && (
        <div className="siteAck">
          <a href={siteAck.linkTo}>
            <img width="120" src={siteAck.imageLocation} />
          </a>
        </div>
      )}
    </div>
  );
});
