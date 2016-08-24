import { Component, PropTypes } from 'react';
import { Link } from 'wdk-client/Components';
import NewWindowLink from './NewWindowLink';

/**
 * Small menu that appears in header
 */
export default class SmallMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visibleSubmenu: null
    };
    this.visibleSubmenuTimerId = null;
  }

  setVisibleSubmenu(visibleSubmenu) {
    window.clearTimeout(this.visibleSubmenuTimerId);
    this.visibleSubmenuTimerId = setTimeout(() => {
      this.setState({ visibleSubmenu });
    }, 300);
  }

  render() {
    let { projectConfig: { twitterId, facebookId, projectId, webAppUrl }, user, onLogin, onLogout } = this.props;
    let { visibleSubmenu } = this.state;

    return (
      <div id="nav-top-div">
        <ul id="nav-top">
          <li onMouseEnter={() => this.setVisibleSubmenu('about')} onMouseLeave={() => this.setVisibleSubmenu(null)}>
            About {projectId}
            <ul style={{display: visibleSubmenu === 'about' ? 'block' : 'none'}}>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About'}>What is {projectId}?</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.EuPathDBPubs'}>Publications on EuPathDB sites</a></li>
              <br/><span className="smallTitle">------ Data in {projectId}</span>

              <li><a href={webAppUrl + '/processQuestion.do?questionFullName=OrganismQuestions.GenomeDataTypes'}>Organisms</a></li>
              <li><a href={webAppUrl + '/processQuestion.do?questionFullName=OrganismQuestions.GeneMetrics'}>{projectId} Gene Metrics</a></li>
              <br/><span className="smallTitle">------ Submitting data to {projectId}</span>

              <li><a href={webAppUrl + '/dataSubmission.jsp'}>How to submit data to us</a></li>
              <li><a href={'/EuPathDB_datasubm_SOP.pdf'}>EuPathDB Data Submission &amp; Release Policies</a></li>

              <br/><span className="smallTitle">------ Usage and Citation</span>

              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About#citing'}>How to cite us</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About#citingproviders'}>Citing Data Providers</a></li>
              <li><a href={'http://scholar.google.com/scholar?as_q=&amp;num=10&amp;as_epq=&amp;as_oq=OrthoMCL+PlasmoDB+ToxoDB+CryptoDB+TrichDB+GiardiaDB+TriTrypDB+AmoebaDB+MicrosporidiaDB+%22FungiDB%22+PiroplasmaDB+ApiDB+EuPathDB&amp;as_eq=encrypt+cryptography+hymenoptera&amp;as_occt=any&amp;as_sauthors=&amp;as_publication=&amp;as_ylo=&amp;as_yhi=&amp;as_sdt=1.&amp;as_sdtp=on&amp;as_sdtf=&amp;as_sdts=39&amp;btnG=Search+Scholar&amp;hl=en'}>Publications that Use our Resources</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About#use'}>Data Access Policy</a></li>

              <br/><span className="smallTitle">------ Who are we?</span>

              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.AboutAll#swg'}>Scientific Working Group</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About#advisors'}>Scientific Advisory Team</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.AboutAll#acks'}>Acknowledgements</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.About#funding'}>Funding</a></li>
              <li><a href={'http://eupathdb.org/tutorials/eupathdbFlyer.pdf'}>EuPathDB Brochure</a></li>
              <li><a href={'http://eupathdb.org/tutorials/eupathdbFlyer_Chinese.pdf'}>EuPathDB Brochure in Chinese</a></li>

              <br/><span className="smallTitle">------ Technical</span>

              <li><a href={'/documents/EuPathDB_Section_508.pdf'}>Accessibility VPAT</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.Infrastructure'}>EuPathDB Infrastructure</a></li>
              <li><a href={'/awstats/awstats.pl'}>Website Usage Statistics</a></li>
            </ul>
          </li>
          <li onMouseEnter={() => this.setVisibleSubmenu('help')} onMouseLeave={() => this.setVisibleSubmenu(null)}>
            Help
            <ul style={{display: visibleSubmenu === 'help' ? 'block' : 'none'}}>
              <li><a href={webAppUrl + '/resetSession.jsp'} title="Login first to keep your work.">Reset {projectId} Session</a></li>
              <li><a href={'http://www.youtube.com/user/EuPathDB/videos?sort=dd&amp;flow=list&amp;view=1'}>YouTube Tutorials Channel</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.Tutorials'}>Web Tutorials</a></li>
              <li><a href={'http://workshop.eupathdb.org/current/'}>EuPathDB Workshop</a></li>
              <li><a href={'http://workshop.eupathdb.org/current/index.php?page=schedule'}>Exercises from Workshop</a></li>
              <li><a href={'http://www.genome.gov/Glossary/'}>NCBI's Glossary of Terms</a></li>
              <li><a href={webAppUrl + '/showXmlDataContent.do?name=XmlQuestions.Glossary'}>Our Glossary</a></li>
              <li className="empty-divider">
                <NewWindowLink href={webAppUrl + '/contact.do'}>Contact Us</NewWindowLink>
              </li>
            </ul>
          </li>
          <li style={{ whiteSpace: 'nowrap' }}>
            {user.isGuest
              ? <a href="#login" onClick={e => onLogin() && e.preventDefault()}>Login</a>
              : <Link to="user/profile">{`${user.firstName} ${user.lastName}`}'s Profile</Link>}
          </li>
          <li>
            {user.isGuest
              ? <a href={webAppUrl + '/showRegister.do'}>Register</a>
              : <a href="#logout" onClick={e => onLogout() && e.preventDefault()}>Logout</a>}
          </li>
          <li className="empty-divider">
            <NewWindowLink href={webAppUrl + '/contact.do'}>Contact Us</NewWindowLink>
          </li>
          <li className="socmedia-link no-divider">
            <a href={'http://twitter.com/' + twitterId} target="_blank">
              <span title="Follow us on Twitter!" className="twitter small"></span>
            </a>
          </li>
          <li className="socmedia-link no-divider">
            <a href={'http://facebook.com/' + facebookId} target="_blank">
              <span title="Follow us on Facebook!" className="facebook small"></span>
            </a>
          </li>
          <li className="socmedia-link no-divider">
            <a href="http://www.youtube.com/user/EuPathDB/videos?sort=dd&amp;flow=list&amp;view=1" target="_blank">
              <span title="Follow us on YouTube!" className="youtube small"></span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

}

SmallMenu.propTypes = {
  projectConfig: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};
