import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

// Wrapping WDKClient AnswerController for specific rendering on primary_key column for user datasets
function UDAnswerController(props) {
  const renderCellContent = useMemo(() => makeRenderCellContent(), []);

  return (
    <props.DefaultComponent {...props} renderCellContent={renderCellContent} />
  );
}

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
*/

const makeRenderCellContent = () => (props) => {
  // Override primary_key column to link to user dataset detail page
  if (props.attribute.name === 'primary_key') {
    return (
      <Link to={`/workspace/analyses/${props.record.id[0].value}/new`}>
        {safeHtml(props.record.attributes.primary_key)}
      </Link>
    );
  }

  return <props.CellContent {...props} />;
};

export default UDAnswerController;
