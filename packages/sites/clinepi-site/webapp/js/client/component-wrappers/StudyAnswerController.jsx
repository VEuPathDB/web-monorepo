import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';
import CategoryIcon from 'ebrc-client/App/Categories/CategoryIcon';
import StudySearchIconLinks from 'ebrc-client/App/Studies/StudySearches';

// wrapping WDKClient AnswerController for specific rendering on certain columns
function StudyAnswerController(props) {
  return (
    <React.Fragment>
      <props.DefaultComponent 
        {...props}
        renderCellContent={renderCellContent}
        deriveRowClassName={deriveRowClassName(props.projectId)}
      />
      
    </React.Fragment>
  );
}

// StudySearchCellContent wraps StudySearchIconLinks
// - accessing the store to get new props needed to render StudySearchIconLinks (aka StudySearches) 
// --- using connect(mapStateToProps,..): pattern also used in StudyRecordHeading
let StudySearchCellContent = connect(mapStateToProps, null)(StudySearchIconLinks);

/* prop types defined in WDKClient/../AnswerController.jsx
   and used in Answer.jsx
 
interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}
interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}
interface RowClassNameProps {
  record: RecordInstance;
  recordClass: RecordClass;
}
*/

// currying to use projectId
const deriveRowClassName = projectId => props => {
  if (props.record.attributes.project_availability.includes('"' + projectId + '"')) {
    return 'non-greyed-out';}
  return 'greyed-out';
};

const renderCellContent = props => {
  if (props.attribute.name === 'study_categories') {
    let studyCategories = JSON.parse(props.record.attributes.study_categories);
    return studyCategories.map(cat => (
              <CategoryIcon category={cat} key={cat} />
            ));
  }
  if (props.attribute.name === 'card_questions') { 
     return <StudySearchCellContent {...props}/> 
  }
  if (props.attribute.name === 'bulk_download_url') {
    return <DownloadLink studyId={props.record.id[0].value} studyUrl= {props.record.attributes.bulk_download_url.url}/>;
  }
  return <props.CellContent {...props}/>
};


// mapStateToProps()
// - input props: StudySearchCellContent, of type RenderCellProps  
//   will be converted into new props needed to render StudySearchIconLinks (defined in StudySearches.jsx)
// --- entries = [{question, recordClass}],
// --- webAppUrl
//
function mapStateToProps(state,props) {
  const { record } = props;
  const { globalData, studies } = state;
  const { questions, recordClasses } = globalData;

  if (questions == null || recordClasses == null || studies.loading) {
    return { loading: true };
  }

  const studyId = record.id
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
              .filter(recordClass => question.outputRecordClassName === recordClass.urlSegment)
              .map(recordClass => ({ question, recordClass }))
              .take(1)))
      .toArray();

  return { entries };
}



function mapStateToProps2(state) {
  const { projectId } = state.globalData.siteConfig;
  return { projectId };
}


export default connect(mapStateToProps2, null)(StudyAnswerController);
