import React from 'react';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';
import CategoryIcon from 'ebrc-client/App/Categories/CategoryIcon';
import { makeClassNameHelper } from 'wdk-client/ComponentUtils';

function StudyAnswerController(props) {
  return (
    <React.Fragment>
      <props.DefaultComponent 
        {...props}
        renderCellContent={renderCellContent}
        deriveRowClassName={deriveRowClassName}
      />
      
    </React.Fragment>
  );
}

/* defined in WDKClient/../AnswerController.jsx
interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
};
interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}
interface RowClassNameProps {
  record: RecordInstance;
  recordClass: RecordClass;
}
*/

const deriveRowClassName = props => {
  if (props.record.attributes.project_availability.includes('"ClinEpiDB"')) {
    return 'non-greyed-out';}
  return 'greyed-out';
};

const cx = makeClassNameHelper('ce-StudySearchIconLinks');

const renderCellContent = props => {
  if (props.attribute.name === 'study_categories') {
    let studyCategories = JSON.parse(props.record.attributes.study_categories);
    return studyCategories.map(cat => (
              <CategoryIcon category={cat} key={cat} />
            ));
  }
  if (props.attribute.name === 'card_questions') { 
    let cardQuestions = JSON.parse(props.record.attributes.card_questions);
    let iconNames = {"participants":"fa fa-male",
                     "observations":"fa fa-stethoscope",
                     "lighttraps":"fa fa-bug",
                     "households":"fa fa-home"
                   };
    return (
    <div className={cx()}>
      {Object.entries(cardQuestions).map(([key,value]) => {
        <div key={key} className={cx('Item')}>
            <a href={`ce/showQuestion.do?questionFullName=${value}`}>
              <i className={iconNames[key]}/>
            </a>
        </div>
        })
      }</div>
    );
  }
  if (props.attribute.name === 'bulk_download_url') {
    return <DownloadLink studyId={props.record.id[0].value} studyUrl= {props.record.attributes.bulk_download_url.url}/>;
  }
  return <props.CellContent {...props}/>
};

export default StudyAnswerController;
