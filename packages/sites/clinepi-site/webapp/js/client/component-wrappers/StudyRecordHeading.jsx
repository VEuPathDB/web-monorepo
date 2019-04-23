import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Seq } from 'wdk-client/IterableUtils';
import { makeClassNameHelper } from 'wdk-client/ComponentUtils';
import StudySearches from 'ebrc-client/App/Studies/StudySearches';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';
import { attemptAction } from 'ebrc-client/App/DataRestriction/DataRestrictionActionCreators';

const cx = makeClassNameHelper('ce-StudyRecordHeadingSearchLinks');

function StudyRecordHeading({ entries, loading, webAppUrl, study, attemptAction, ...props }) {
  return (
    <React.Fragment>
      <props.DefaultComponent {...props}/>
      <div className={cx()}>
        <div className={cx('Label')}>Search the data</div>
        {loading ? null :
          <StudySearches
            entries={entries}
            webAppUrl={webAppUrl}
            renderNotFound={() => (
              <div>
                <em>No searches were found for this study.</em>
              </div>
            )}
          />
        }
      </div>
      <div className={cx()}>
        <div className={cx('Label')}>Download the data</div>
        <DownloadLink className="ce-StudySearchIconLinksItem" study={study} attemptAction={attemptAction}/>
      </div>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { globalData, record, studies } = state;
  const { questions, recordClasses, siteConfig } = globalData;
  const { webAppUrl } = siteConfig;

  if (questions == null || recordClasses == null || studies.loading) {
    return { loading: true };
  }

  const studyId = record.record.id
    .filter(part => part.name === 'dataset_id')
    .map(part => part.value)[0];

  const activeStudy = get(studies, 'entities', [])
    .find(study => study.id === studyId);

  // Find record class and searches from study id.
  // If none found, render nothing.
  // FIXME Start with questions!!
  const entries = activeStudy && Seq.from(activeStudy.searches)
      .map(search => search.name)
      .flatMap(questionName =>
        Seq.from(questions)
          .filter(question => question.fullName === questionName)
          .take(1)
          .flatMap(question =>
            Seq.from(recordClasses)
              .filter(recordClass => question.recordClassName === recordClass.fullName)
              .map(recordClass => ({ question, recordClass }))
              .take(1)))
      .toArray();

  return { entries, webAppUrl, study: activeStudy };
}

const mapDispatchToProps = {
  attemptAction
};

export default connect(mapStateToProps, mapDispatchToProps)(StudyRecordHeading);
