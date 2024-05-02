import { orderBy } from 'lodash';
import React, { Suspense } from 'react';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';

import SiteSearchController from '@veupathdb/web-common/lib/controllers/SiteSearchController';

// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import { JBrowseController } from './components/controllers/JBrowseController';
import { PlasmoApController } from './components/controllers/PlasmoApController';

import { FeaturedTools } from '@veupathdb/web-common/lib/components/homepage/FeaturedTools';
import { WorkshopExercises } from '@veupathdb/web-common/lib/components/homepage/WorkshopExercises';
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
import { DatasetsSearchAndAnswer } from '@veupathdb/wdk-client/lib/Components/SearchAndAnswer/Datasets/DatasetsSearchAndAnswer';
import { Srt } from './components/Srt';

// Project id is not needed for these record classes.
// Matches urlSegment.
const RECORD_CLASSES_WITHOUT_PROJECT_ID = ['dataset', 'sample'];

// Used to hardcode a redirect to eda workspace from the datatsets table
const GAMBIAN_WGCNA_DATASET = 'DS_82dc5abc7f';

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
  {
    path: '/downloads',
    component: DownloadsRouteComponent,
  },

  {
    path: '/datasets',
    component: DatasetsSearchAndAnswer,
  },

  {
    path: '/record/organism/:id*',
    component: (props) => (
      <Redirect to={`/record/dataset/${props.match.params.id}`} />
    ),
  },

  // hardcodes a redirect from the datasets table to the EDA "study explorer"
  {
    path: `/record/dataset/${GAMBIAN_WGCNA_DATASET}`,
    exact: true,
    component: () => (
      <Redirect to={`/workspace/analyses/${GAMBIAN_WGCNA_DATASET}/new`} />
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
    path: '/',
    component: () => (
      <React.Fragment>
        <FeaturedTools />
        <hr />
        <WorkshopExercises />
      </React.Fragment>
    ),
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
