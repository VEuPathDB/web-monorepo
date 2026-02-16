import { orderBy } from 'lodash';
import React, { Suspense } from 'react';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';

import SiteSearchController from '@veupathdb/web-common/lib/controllers/SiteSearchController';

// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import { JBrowseController } from './components/controllers/JBrowseController';
import { PlasmoApController } from './components/controllers/PlasmoApController';

import { useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import {
  usePreferredOrganismsState,
  usePreferredOrganismsEnabledState,
  useAvailableOrganisms,
} from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import { useReferenceStrains } from '@veupathdb/preferred-organisms/lib/hooks/referenceStrains';

import { PageLoading } from './components/common/PageLoading';
import SampleForm from './components/samples/SampleForm';

import { projectId, webAppUrl } from './config';

import { blastRoutes } from './blastRoutes';
import { preferredOrganismsRoutes } from './preferredOrganismRoutes';
import { userCommentRoutes } from './userCommentRoutes';
import { userDatasetRoutes } from './userDatasetRoutes';
import Downloads from './components/Downloads';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { makeAnswerControllerRouteComponent } from '@veupathdb/wdk-client/lib/Core/routes';
import { Srt } from './components/Srt';

import RecordController from '@veupathdb/wdk-client/lib/Controllers/RecordController';

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = ['dataset', 'sample'];
const projectRegExp = new RegExp('/' + projectId + '$');

/**
 * Adds projectId primary key record to primaryKey of props for pages referencing
 * a single record.  If recordclass of that record does not include the
 * projectId as a PK value, props are returned unchanged.
 */
function addProjectIdPkValue(props) {
  let { primaryKey, recordClass } = props.match.params;

  // These record classes do not need the project id as a part of the primary key
  // so we just render with the url params as-is.
  if (RECORD_CLASSES_WITHOUT_PROJECT_ID.includes(recordClass)) {
    return props;
  }

  // Append project id to request
  let params = Object.assign({}, props.match.params, {
    primaryKey: `${primaryKey}/${projectId}`,
  });

  // Create new match object with updated primaryKey segment
  let match = Object.assign({}, props.match, { params });

  // reassign props to modified props object
  return Object.assign({}, props, { match });
}

/**
 * ViewController mixin that adds the primary key to the url if omitted.
 */
function addProjectIdPkValueWrapper(Route) {
  return class ProjectIdFixer extends React.Component {
    componentDidMount() {
      this.removeProjectId();
    }
    componentDidUpdate() {
      this.removeProjectId();
    }
    hasProjectId() {
      return projectRegExp.test(this.props.location.pathname);
    }
    removeProjectId() {
      if (this.hasProjectId()) {
        // Remove projectId from the url. This is like a redirect.
        this.props.history.replace(
          this.props.location.pathname.replace(projectRegExp, '')
        );
      }
    }
    render() {
      if (this.hasProjectId()) return null;
      // Add projectId back to props and call super's loadData
      return <Route {...addProjectIdPkValue(this.props)} />;
    }
  };
}

function SiteSearchRouteComponent() {
  const [preferredOrganisms] = usePreferredOrganismsState();
  const availableOrganisms = useAvailableOrganisms();
  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();
  const referenceStrains = useReferenceStrains();

  /**
   * if user's preferred organisms is less than all available organisms, we can assume the user has
   * set their preferred organisms
   */
  const hasUserSetPreferredOrganisms =
    preferredOrganisms.length < Array.from(availableOrganisms).length;

  return (
    <SiteSearchController
      hasUserSetPreferredOrganisms={hasUserSetPreferredOrganisms}
      preferredOrganisms={preferredOrganisms}
      preferredOrganismsEnabled={preferredOrganismsEnabled}
      referenceStrains={referenceStrains}
    />
  );
}

function DownloadsRouteComponent() {
  const config = useWdkService((wdkService) => wdkService.getConfig(), []);
  const { path } = useRouteMatch();
  const history = useHistory();
  const localHref = history.createHref({ pathname: path });
  const remoteHrefSuffix = localHref.replace(webAppUrl, '');
  if (!config) return <Loading />;
  /**
   * not needed; but we dont have EuPathDB project anymore, it is UniDB now
   */
  return projectId === 'EuPathDB' ? (
    <div className="Downloads">
      <h1>Download Data Files</h1>
      <p className="Downloads-Instructions portal">
        Please go to a specific organism site in order to download files:
      </p>
      <ul>
        {orderBy(
          Object.entries(config.projectUrls),
          ([project]) => project
        ).map(([project, url]) => (
          <li key={project}>
            <a
              target="_blank"
              href={url.replace(/\/$/, '') + remoteHrefSuffix}
              rel="noreferrer"
            >
              {project}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <Downloads />
  );
}

/**
 * Wrap Ebrc Routes
 */
export const wrapRoutes = (ebrcRoutes) => [

  // Allow guests to access dataset record pages for SEO and public visibility                                                                                             
  {                                                                                                                                                                        
    path: '/record/dataset/:primaryKey+',                                                                                                                                  
    requiresLogin: false,                                                                                                                                                  
    component: (props) => (                                                                                                                                                
      <RecordController recordClass="dataset" primaryKey={props.match.params.primaryKey} />
    ),                                                                                                                                                                     
  },      

  // Allow guests to access All Datasets and All Organisms for SEO and public visibility
  {
    path: '/search/dataset/AllDatasets/result',
    requiresLogin: false,
    component: makeAnswerControllerRouteComponent({
      recordClass: 'dataset',
      question: 'AllDatasets',
    }),
  },
  {
    path: '/search/organism/GenomeDataTypes/result',
    requiresLogin: false,
    component: makeAnswerControllerRouteComponent({
      recordClass: 'organism',
      question: 'GenomeDataTypes',
    }),
  },

  {
    path: '/downloads',
    component: DownloadsRouteComponent,
  },

  {
    path: '/record/organism/:id*',
    requiresLogin: false,
    component: (props) => (
      <Redirect to={`/record/dataset/${props.match.params.id}`} />
    ),
  },

  {
    path: '/fasta-tool',
    exact: false,
    component: () =>
      projectId === 'EuPathDB' ? <Srt /> : <FastaConfigController />,
  },

  {
    path: '/query-grid',
    component: () => <QueryGridController />,
  },

  {
    path: '/sample-form',
    component: () => <SampleForm />,
  },

  {
    path: '/jbrowse',
    component: JBrowseController,
    rootClassNameModifier: 'jbrowse',
  },

  {
    path: '/search',
    component: () => (
      <Suspense fallback={<PageLoading />}>
        <SiteSearchRouteComponent />
      </Suspense>
    ),
  },

  {
    path: '/plasmoap',
    component: PlasmoApController,
  },

  ...blastRoutes,

  ...preferredOrganismsRoutes,

  ...userCommentRoutes,

  ...(useUserDatasetsWorkspace ? userDatasetRoutes : []),

  ...ebrcRoutes.map((route) =>
    route.path.includes(':primaryKey+')
      ? { ...route, component: addProjectIdPkValueWrapper(route.component) }
      : route
  ),
];
