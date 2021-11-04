import { get } from 'lodash';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeEdaRoute } from 'ebrc-client/routes';
import StudySearches from 'ebrc-client/App/Studies/StudySearches';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';
import { attemptAction } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionActionCreators';
import { isPrereleaseStudy } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import './StudyRecordHeading.scss';
import { shouldOfferLinkToDashboard } from 'ebrc-client/StudyAccess/permission' 
import { Link } from '@veupathdb/wdk-client/lib/Components';

const cx = makeClassNameHelper('StudyRecordHeadingSearchLinks');

function StudyRecordHeading({
  showSearches = false,
  showDownload = false,
  showAnalyzeLink = false,
  entries,
  loading,
  study,
  attemptAction,
  permissions,
  ...props
}) {
  const user = useSelector(state => state.globalData.user);

  return (
    <React.Fragment>
      {showAnalyzeLink && (
        <div style={{
          padding: '1.8em 0',
          position: 'absolute',
          right: 0
        }}>
          <Link to={`${makeEdaRoute(props.record.id[0].value)}/latest`} className="btn" style={{
            fontSize: '1.8em',
            backgroundColor: '#1976d2',
            color: 'white',
          }}>
            Analyze this study
          </Link>
        </div>
      )}
      <props.DefaultComponent {...props}/>
      {study != null && permissions != null && shouldOfferLinkToDashboard(permissions) && (
        <div className={cx('DashboardLink')}><Link className={'btn ' + cx('DashboardLink')} to={`/study-access/${study.id}`}>Data Access Dashboard</Link></div>
      )}
      {study != null &&  showSearches && (!isPrereleaseStudy(study.access, study.id, user, permissions)) && (
        <div className={cx()}>
          <div className={cx('Label')}>Search the data</div>
          {loading ? null :
            <StudySearches
              study={study}
              renderNotFound={() => (
                <div>
                  <em>No searches were found for this study.</em>
                </div>
              )}
            />
          }
        </div>
      )}
      {study != null && isPrereleaseStudy(study.access, study.id, user, permissions) && (
        <div style={{backgroundColor:'lightblue',padding:'0.5em', fontSize:'1.8em',margin:'1.5em 0 0'}} className='record-page-banner'>
          This study has not yet been released. <span style={{fontSize:'80%'}}>
            For more information, please email {props.record.attributes.contact} at <a href={"mailto:" + study.email}>{study.email}</a>.</span>
        </div>
      )}
      {study != null && showDownload && (!isPrereleaseStudy(study.access, study.id, user, permissions)) && (
        <div className={cx()}>
          <div className={cx('Label')}>Download the data</div>
          { study && showDownload && <DownloadLink className="StudySearchIconLinksItem" studyId={study.id} studyUrl={study.downloadUrl.url} attemptAction={attemptAction}/> }
        </div>
      )}
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { record, studies } = state;

  if (studies.loading) {
    return { loading: true };
  }

  const studyId = record.record.id
    .filter(part => part.name === 'dataset_id')
    .map(part => part.value)[0];

  const study = get(studies, 'entities', [])
    .find(study => study.id === studyId);
  return { study };
}

const mapDispatchToProps = {
  attemptAction
};

export default connect(mapStateToProps, mapDispatchToProps)(StudyRecordHeading);
