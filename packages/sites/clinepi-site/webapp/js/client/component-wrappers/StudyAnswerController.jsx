import React from 'react';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';

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

const renderCellContent = props => {
  if (props.attribute.name === 'bulk_download_url') {
    return <DownloadLink studyId={props.record.id[0].value} studyUrl= {props.record.attributes.bulk_download_url.url}/>;
  }
  return <props.CellContent {...props}/>
};

export default StudyAnswerController;
