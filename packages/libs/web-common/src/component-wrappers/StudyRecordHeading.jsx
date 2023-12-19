import { get } from 'lodash';
import React, { useMemo } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { parsePath } from 'history';

import { makeEdaRoute } from '../routes';
import StudySearches from '../App/Studies/StudySearches';
import DownloadLink from '../App/Studies/DownloadLink';

import { attemptAction } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionActionCreators';
import { isPrereleaseStudy } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import { isUserFullyApprovedForStudy } from '@veupathdb/study-data-access/lib/study-access/permission';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import './StudyRecordHeading.scss';

const cx = makeClassNameHelper('StudyRecordHeadingSearchLinks');

function StudyRecordHeading({
  showSearches = false,
  showDownload = false,
  showAnalyzeLink = false,
  entries,
  loading,
  attemptAction,
  permissions,
  ...props
}) {
  const study = useMemo(
    () => ({
      id: props.record.attributes.dataset_id,
      downloadUrl: props.record.attributes.bulk_download_url,
      access: props.record.attributes.study_access?.toLowerCase(),
      searches: JSON.parse(props.record.attributes.card_questions ?? '[]'),
    }),
    [
      props.record.attributes.dataset_id,
      props.record.attributes.download_url,
      props.record.attributes.study_access,
      props.record.attributes.card_questions,
    ]
  );

  const user = useSelector((state) => state.globalData.user);
  const location = useLocation();
  const requestAccessPath = `/request-access/${
    study.id
  }?redirectUrl=${encodeURIComponent(window.location.href + '/new')}`;

  return (
    <React.Fragment>
      {showAnalyzeLink && (
        <div
          style={{
            padding: '1.8em 0',
            position: 'absolute',
            right: 0,
          }}
        >
          <Link
            to={`${makeEdaRoute(props.record.id[0].value)}/new`}
            className="btn"
            style={{
              fontSize: '1.8em',
              backgroundColor: '#1976d2',
              color: 'white',
            }}
          >
            Analyze this study
          </Link>
        </div>
      )}
      <props.DefaultComponent {...props} />
      {study != null &&
        showSearches &&
        !isPrereleaseStudy(study.access, study.id, permissions) && (
          <div className={cx()}>
            <div className={cx('Label')}>Search the data</div>
            {loading ? null : (
              <StudySearches
                study={study}
                renderNotFound={() => (
                  <div>
                    <em>No searches were found for this study.</em>
                  </div>
                )}
              />
            )}
          </div>
        )}
      {study != null && isPrereleaseStudy(study.access, study.id, permissions) && (
        <div
          style={{
            backgroundColor: 'lightblue',
            padding: '0.5em',
            fontSize: '1.8em',
            margin: '1.5em 0 0',
          }}
          className="record-page-banner"
        >
          This study has not yet been released.{' '}
          <span style={{ fontSize: '80%' }}>
            For more information, please email {props.record.attributes.contact}{' '}
            at{' '}
            <a href={'mailto:' + props.record.attributes.email}>
              {props.record.attributes.email}
            </a>
            .
          </span>
        </div>
      )}
      {study != null && isPrivateStudy(study.access, study.id, permissions) && (
        <div
          style={{
            backgroundColor: 'lightblue',
            padding: '0.5em',
            fontSize: '1.8em',
            margin: '1.5em 0 0',
          }}
          className="record-page-banner"
        >
          This study has data access restrictions.{' '}
          <span style={{ fontSize: '80%' }}>
            Please{' '}
            <UserLink to={location.pathname + '/new'} user={user}>
              login
            </UserLink>{' '}
            or{' '}
            <UserLink user={user} to={requestAccessPath}>
              acquire research approval
            </UserLink>{' '}
            in order to search the data. The data from this study requires
            approval to download and use in research projects.
          </span>
        </div>
      )}
      {study != null &&
        showDownload &&
        !isPrereleaseStudy(study.access, study.id, permissions) && (
          <div className={cx()}>
            <div className={cx('Label')}>Download the data</div>
            {study && showDownload && (
              <DownloadLink
                className="StudySearchIconLinksItem"
                studyId={study.id}
                studyUrl={study.downloadUrl.url}
                attemptAction={attemptAction}
              />
            )}
          </div>
        )}
    </React.Fragment>
  );
}

const mapDispatchToProps = {
  attemptAction,
};

export default connect(null, mapDispatchToProps)(StudyRecordHeading);

function isPrivateStudy(access, studyId, permissions) {
  return (
    access === 'private' && !isUserFullyApprovedForStudy(permissions, studyId)
  );
}

function UserLink({ to, user, children }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const dest = to
    ? window.location.origin + history.createHref(parsePath(to))
    : window.location.href;
  if (user.isGuest) {
    return (
      <button
        type="button"
        className="link"
        onClick={() => dispatch(showLoginForm(dest))}
      >
        {children}
      </button>
    );
  }
  return <Link to={to}>{children}</Link>;
}
