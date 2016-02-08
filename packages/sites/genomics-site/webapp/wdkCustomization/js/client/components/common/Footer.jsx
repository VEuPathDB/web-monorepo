import * as Wdk from 'wdk-client';

let { Image } = Wdk.Components;

export default function Footer() {
  let siteName = wdk.MODEL_NAME;
  let buildNumber = wdk.VERSION;
  let today = new Date;
  let releaseDate = today.toDateString();
  let copyrightYear = today.getFullYear();

  return (
    <div id="fixed-footer">
      <div className="left">
        <div className="build-info">
          <a href={location.origin}>{siteName}</a> {buildNumber}
          <span className="release"> {releaseDate}</span><br/>
        </div>
        <div className="copyright">&copy;{copyrightYear} The EuPathDB Project Team</div>
      </div>

      <div className="right">
        <ul className="attributions">
          <li>
            <a href="http://code.google.com/p/strategies-wdk/">
              <Image border="0" src="wdk/images/stratWDKlogo.png" width="120"/>
            </a>
          </li>
        </ul>
      </div>

      <div className="bottom">
        <ul className="site-icons">
          <li title="EuPathDB.org">
            <a href="http://www.eupathdb.org">
              <Image src="images/eupathdblink.png" alt="Link to EuPathDB homepage"/>
            </a>
          </li>
          <li className="short-space" title="AmoebaDB.org">
            <a href="http://amoebadb.org">
              <Image src="images/AmoebaDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="CryptoDB.org">
            <a href="http://cryptodb.org">
              <Image src="images/CryptoDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="FungiDB.org">
            <a href="http://fungidb.org">
              <Image src="images/FungiDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="GiardiaDB.org">
            <a href="http://giardiadb.org">
              <Image src="images/GiardiaDB/footer-logo.png"/>
            </a>
          </li>
          <li className="long-space" title="MicrosporidiaDB.org">
            <a href="http://microsporidiadb.org">
              <Image src="images/MicrosporidiaDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="PiroplasmaDB.org">
            <a href="http://piroplasmadb.org">
              <Image src="images/PiroplasmaDB/footer-logo.png"/>
            </a>
          </li>
          <li className="long-space" title="PlasmoDB.org">
            <a href="http://plasmodb.org">
              <Image src="images/PlasmoDB/footer-logo.png"/>
            </a>
          </li>
          <li className="long-space" title="ToxoDB.org">
            <a href="http://toxodb.org">
              <Image src="images/ToxoDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="TrichDB.org">
            <a href="http://trichdb.org">
              <Image src="images/TrichDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="TriTrypDB.org">
            <a href="http://tritrypdb.org">
              <Image src="images/TriTrypDB/footer-logo.png"/>
            </a>
          </li>
          <li className="short-space" title="OrthoMCL.org">
            <a href="http://orthomcl.org">
              <Image src="images/OrthoMCL/footer-logo.png"/>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
