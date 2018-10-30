import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Seq } from 'wdk-client/IterableUtils';
import { makeClassNameHelper } from 'wdk-client/ComponentUtils';
import StudySearches from 'ebrc-client/App/Studies/StudySearches';

const cx = makeClassNameHelper('ce-StudyRecordHeadingSearchLinks');

const enhance = connect((state) => {
  const { globalData, record, studies } = state;
  const { questions, recordClasses, siteConfig } = globalData;
  const { webAppUrl } = siteConfig;

  const studyId = record.record.id
    .filter(part => part.name === 'dataset_id')
    .map(part => part.value)[0];

  const activeStudy = get(studies, 'entities', [])
    .find(study => study.id === studyId);

  // Find record class and searches from study id.
  // If none found, render nothing.
  // FIXME Start with questions!!
  const entries = Seq.from(Object.values(activeStudy.searches))
    .flatMap(questionName =>
      Seq.from(questions)
        .filter(question => question.name === questionName)
        .take(1)
        .flatMap(question =>
          Seq.from(recordClasses)
            .filter(recordClass => question.recordClassName === recordClass.name)
            .map(recordClass => ({ question, recordClass }))
            .take(1)))
    .toArray();

  return { entries, webAppUrl };
}, null);


const ConnectedStudySearches = enhance(StudySearches);

export default function StudyRecordHeading(props) {
  return (
    <React.Fragment>
      <props.DefaultComponent {...props}/>
      <div className={cx()}>
        <div className={cx('Label')}>Search the data</div>
        <ConnectedStudySearches/>
      </div>
    </React.Fragment>
  );
}
