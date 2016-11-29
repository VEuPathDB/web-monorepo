import NewWindowLink from './NewWindowLink';
import { formatReleaseDate } from '../util/modelSpecificUtil';
import { buildNumber, releaseDate, projectId, webAppUrl } from '../config';

/** Application footer */
export default function Footer() {
  return (
    <div className="wide-footer ui-helper-clearfix" id="fixed-footer">
      <div className="left">
        <div className="build-info">
          <span>
            <a href={'http://' + projectId.toLowerCase() + '.org'}>{projectId}</a>
            <span> {buildNumber} &nbsp;&nbsp; {formatReleaseDate(releaseDate)}</span>
          </span>
          <br/>
        </div>
        <div className="copyright">©{new Date().getFullYear()} The EuPathDB Project Team</div>
      </div>
      <div className="right">
        <ul className="attributions">
          <li>
            <a href="http://code.google.com/p/strategies-wdk/">
              <img width="120" src={webAppUrl + '/wdk/images/stratWDKlogo.png'} />
            </a>
          </li>
        </ul>
        <div className="contact">
          Please <NewWindowLink href={webAppUrl + '/contact.do'}>Contact Us</NewWindowLink> with any questions or comments
        </div>
      </div>
      <div className="bottom">
        <ul className="site-icons">
          <li title="EuPathDB.org">
            <a href="http://www.eupathdb.org">
              <img alt="Link to EuPathDB homepage" src={webAppUrl + '/images/eupathdblink.png'}/>
            </a>
          </li>
          <li title="AmoebaDB.org" className="short-space">
            <a href="http://amoebadb.org">
              <img src={webAppUrl + '/images/AmoebaDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="CryptoDB.org" className="short-space">
            <a href="http://cryptodb.org">
              <img src={webAppUrl + '/images/CryptoDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="FungiDB.org" className="short-space">
            <a href="http://fungidb.org">
              <img src={webAppUrl + '/images/FungiDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="GiardiaDB.org" className="short-space">
            <a href="http://giardiadb.org">
              <img src={webAppUrl + '/images/GiardiaDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="MicrosporidiaDB.org" className="long-space">
            <a href="http://microsporidiadb.org">
              <img src={webAppUrl + '/images/MicrosporidiaDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="PiroplasmaDB.org" className="short-space">
            <a href="http://piroplasmadb.org">
              <img src={webAppUrl + '/images/PiroplasmaDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="PlasmoDB.org" className="long-space">
            <a href="http://plasmodb.org">
              <img src={webAppUrl + '/images/PlasmoDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="ToxoDB.org" className="long-space">
            <a href="http://toxodb.org">
              <img src={webAppUrl + '/images/ToxoDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="TrichDB.org" className="short-space">
            <a href="http://trichdb.org">
              <img src={webAppUrl + '/images/TrichDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="TriTrypDB.org" className="short-space">
            <a href="http://tritrypdb.org">
              <img src={webAppUrl + '/images/TriTrypDB/footer-logo.png'}/>
            </a>
          </li>
          <li title="OrthoMCL.org" className="short-space">
            <a href="http://orthomcl.org">
              <img src={webAppUrl + '/images/OrthoMCL/footer-logo.png'}/>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
