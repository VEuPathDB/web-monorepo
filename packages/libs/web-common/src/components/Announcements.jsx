import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { groupBy, noop } from 'lodash';

import { Link, IconAlt } from 'wdk-client/Components';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';

const stopIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i className="fa fa-circle fa-stack-2x" style={{color: 'darkred'}}/>
    <i className="fa fa-times fa-stack-1x" style={{color: 'white'}}/>
  </span>
);

const warningIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i className="fa fa-exclamation-triangle fa-stack-2x" style={{color: '#ffeb3b'}}/>
    <i className="fa fa-exclamation fa-stack-1x" style={{color: 'black', fontSize: '1.3em', top: 2}}/>
  </span>
);

const infoIcon = (
  <span className="fa-stack" style={{ fontSize: '1.2em' }}>
    <i className="fa fa-circle fa-stack-2x" style={{color: '#004aff'}}/>
    <i className="fa fa-info fa-stack-1x" style={{color: 'white'}}/>
  </span>
);

// Array of announcements to show. Each element of the array is an object which specifies
// a unique id for the announcement, and a function that takes props and returns a React Element.
// Use props as an opportunity to determine if the message should be displayed for the given context.
const siteAnnouncements = [
  // alpha
  {
    id: 'alpha',
    renderDisplay: props => {
      if (param('alpha', props.location) === 'true' || /^(alpha|a1|a2)/.test(window.location.hostname)) {
        return (
          <div key="alpha">
            This pre-release version of {props.projectId} is available for early community review.
            Your searches and strategies saved in this alpha release will not be available in the
            official release.
            Please explore the site and <Link to="/contact-us" target="_blank">contact us</Link> with your feedback.
            This site is under active development so there may be incomplete or
            inaccurate data and occasional site outages can be expected.
          </div>
        );
      }
    }
  },
/*
  { 
    id: 'live-beta',
    renderDisplay: props => {
      if ( isGenomicHomePage(props.projectId, props.location) ) {
        if (props.projectId == 'VectorBase' || props.projectId == 'OrthoMCL') return (
          <div key="live-beta">
            Welcome to {props.displayName} <i>beta</i> where you will find the newest versions of our interface, features, tools and data.  
            While we transition to making this beta site permanent, <a target="_blank" href={`https://legacy.${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>
            legacy.{props.projectId.toLowerCase()}.org</a> is still available. 
            Here is a <a target="_blank" href="https://upenn.co1.qualtrics.com/jfe/form/SV_9N2RTXq7ljpZnDv">form for sending your feedback</a> on the beta sites.
          </div>
        )
        else return (
          <div key="live-beta">
            Welcome to {props.displayName} <i>beta</i> where you will find the newest versions of our interface, features, tools and data.
            While we transition to making this beta site permanent, <a target="_blank" href={`https://legacy.${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>
            legacy.{props.projectId.toLowerCase()}.org</a> is still available (to be retired March 2nd).
            Here is a <a target="_blank" href="https://upenn.co1.qualtrics.com/jfe/form/SV_9N2RTXq7ljpZnDv">form for sending your feedback</a> on the beta sites.
          </div> 
        )
      }
    }
  },
*/
 // clinepi workshop
/*
  {
    id: 'clinepi-workshop',
    renderDisplay: (props) => {
    if (props.projectId == 'ClinEpiDB' || props.projectId == 'AllClinEpiDB' ) {
        return (
          <div>
            WEBINAR Dec 9, 10am EST: We present <span style={{fontWeight: 'bold'}}>Clinical and Epidemiologic Data Exploration for Genomic Researchers</span>. We will cover key features and studies in ClinEpiDB that may be of interest to biologists working on infectious diseases. <a target="_blank" href="https://attendee.gotowebinar.com/register/3656141554042311437">Register here.</a>
          </div>
        );
      }
      return null;
    }
  },
*/


  // beta
  //  /*isBetaSite() || */
/*
  {
    id: 'beta-genomics',
    renderDisplay: props => {
      // We want this on all genomic home pages running this code
      if ( isGenomicHomePage(props.projectId, props.location) ) return (
        <div key="beta">
          {props.displayName} <em>beta</em> is available for early community review!
          &nbsp;&nbsp;Please explore the site and <Link to="/contact-us" target="_blank">contact us</Link> with feedback.
          &nbsp;<a rel="noreferrer" href={`https://${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}?useBetaSite=0`}>Click here to return to the legacy site.</a>
        </div>
      );
    }
  },
*/

/*
  {
    id: 'strategies-beta',
    category: 'degraded',
    renderDisplay: props => {
      if ( isGenomicSite(props.projectId) && ( isStrategies(props.location) || isBasket(props.location) || isFavorites(props.location) ) ) return (
        <div key="strategies-beta">
          Strategies, baskets and favorites you save on this <i>beta</i> site are not permanent. 
          {
            props.projectId !== 'VectorBase' &&
            <React.Fragment>
              {' '}
              Use the <a rel="noreferrer" href={`https://${props.projectId.toLowerCase()}.${props.projectId === 'SchistoDB' ? 'net' : 'org'}`}>legacy site</a> to save them permanently.
            </React.Fragment>
          }
        </div>
      )
    }
  },
*/
/*
  { 
    id: 'apollo-galaxy-off',
    category: 'degraded',
    renderDisplay: props => {
      if ( isGalaxy(props.location) || isApollo(props.location) ) return (
        <div>
          Apollo and the Galaxy Data export to VEuPathDB are currently <b>unavailable</b>.  We are working on fixing this issue and hope to have the export service back ASAP.
        </div>
      )
    }
  },
*/

  // TriTryp gene page for Bodo saltans strain Lake Konstanz
  {
    id: 'geneFungi',
    renderDisplay: props => { 
      if ( (props.projectId == 'TriTrypDB') && 
           ( (props.location.pathname.indexOf("/record/gene/BS") > -1)    ||
             (props.location.pathname.indexOf("/record/gene/BSAL_") > -1)
           )  
         ) 
      {
        return (
          <div key="geneFungi">
            This <i>Bodo saltans</i> genome sequence and annotation represents a draft version. Please carefully consider gene models and genome structure before drawing conclusions.
          </div>
        );
      }
      return null;
    }
  },

  // OrthoMCL enzyme/compound
  {
    id: 'ortho-enzyme',
    renderDisplay: (props) => {
      if (props.projectId == 'OrthoMCL' && (/(enzyme|compound)/i).test(window.location.href)) {
        return (
          <div key="ortho-enzyme">
            Note: the Enzyme Commission (EC) numbers associated with proteins were
            obtained only from UniProt. In future releases we expect to include EC
            numbers from multiple sources including the annotation.
          </div>
        );
      }
      return null;
    }
  }

];

const fetchAnnouncementsData = async wdkService => {
  const [ config, announcements ] = await Promise.all([
    wdkService.getConfig(),
    wdkService.getSiteMessages()
  ]);

  return {
    config,
    announcements
  };
};

/**
 * Info boxes containing announcements.
 */
export default function Announcements({
  closedBanners = [],
  setClosedBanners = noop
}) {
  const location = useLocation();
  const data = useWdkService(fetchAnnouncementsData, []);

  const onCloseFactory = useCallback(id => () => {
    setClosedBanners([ ...closedBanners, id ]);
  }, [ closedBanners ]);

  if (data == null) return null;

  const { down = [], degraded = [], information = [] } = groupBy(data.announcements, 'category');

  return (
    <div>
      {
        [
          ...down,
          ...degraded,
          ...information,
          ...siteAnnouncements
        ].map(announcementData => {
          const category = announcementData.category || 'page-information';

          // Currently, only announcements of category "information" are dismissible
          const dismissible = category === 'information';
          const isOpen = dismissible ? !closedBanners.includes(`${announcementData.id}`) : true;
          const onClose = dismissible ? onCloseFactory(`${announcementData.id}`) : noop;

          const display = typeof announcementData.renderDisplay === 'function' 
            ? announcementData.renderDisplay({ ...data.config, location })
            : category !== 'information' || location.pathname === '/'
            ? toElement(announcementData)
            : null;

          return (
            <AnnouncementContainer
              key={announcementData.id}
              category={category}
              dismissible={dismissible}
              isOpen={isOpen}
              onClose={onClose}
              display={display}
            />
          );
        })}
    </div>
  );
}

/**
 * Container for a single announcement banner.
 */
function AnnouncementContainer(props) {
  const icon = props.category === 'down'
    ? stopIcon
    : props.category === 'degraded'
    ? warningIcon
    : infoIcon;

  return <AnnouncementBanner {...props} icon={icon} />;
}

/**
 * Banner for a single announcement.
 */
function AnnouncementBanner({ 
  isOpen, 
  onClose, 
  icon,
  display,
  dismissible
}) {
  if (display == null) {
    return null;
  }

  return (
    <div className="eupathdb-Announcement" style={{
      margin: '3px',
      padding: '.5em',
      borderRadius: '0.5em',
      borderWidth: '1px',
      borderColor: 'lightgrey',
      borderStyle: 'solid',
      background: '#E3F2FD',
      display: isOpen ? 'block' : 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        {icon}
        <div style={{
          marginLeft: '1em',
          display: 'inline-block',
          width: 'calc(100% - 5.5em)',
          padding: '8px',
          verticalAlign: 'middle',
          color: 'black',
          fontSize: '1.2em'
        }}>
          {display}
        </div>
        {
          dismissible &&
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={onClose} className="link" style={{
              color: '#7c7c7c',
              alignSelf: 'flex-start',
              fontSize: '0.8em'
            }}>
              <IconAlt fa="times" className="fa-2x" />
            </button>
          </div>
        }
      </div>
    </div>
  );
}

/**
 * Convert html string to a React Element
 *
 * @param {string} html
 * @return {React.Element}
 */
function toElement({ message }) {
  return safeHtml(message, { key: message }, 'div');
}

/**
 * Join elements with <hr/>
 *
 * @param {React.Element[]|null} previous
 * @param {React.Element} next
 * @return {React.Element[]}
 */
function injectHr(previous, next) {
  return previous == null ? [ next ] : previous.concat(<hr/>, next);
}

/**
 * Returns a function that takes another function and calls it with `args`.
 * @param {any[]} ...args
 * @return {(fn: Function) => any}
 */
function invokeWith(...args) {
  return fn => fn(...args);
}

/**
 * Find the value of the first param in the location object.
 *
 * @param {string} name The param name
 * @param {Location} location
 * @return {string?}
 */
function param(name, { search = '' }) {
  return search
    .slice(1)
    .split('&')
    .map(entry => entry.split('='))
    .filter(entry => entry[0] === name)
    .map(entry => entry[1])
    .map(decodeURIComponent)
    .find(() => true);
}

function isGenomicSite(projectId) {
  return !/ClinEpiDB|MicrobiomeDB/i.test(projectId);
}
function isBetaSite() {
  return param('beta', window.location) === 'true' || /^(beta|b1|b2)/.test(window.location.hostname);
}
function isGalaxy(routerLocation) {
  return routerLocation.pathname.startsWith('/galaxy-orientation');
}
function isApollo(routerLocation) {
  return routerLocation.pathname.startsWith('/static-content/apollo');
}
function isStrategies(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/strategies');
}
function isBasket(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/basket');
}
function isFavorites(routerLocation) {
  return routerLocation.pathname.startsWith('/workspace/favorites');
}
function isGenomicHomePage(projectId, routerLocation) {
  return isGenomicSite(projectId) && routerLocation.pathname === '/';
}
