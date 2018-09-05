import PropTypes from 'prop-types';
import { renderAttributeValue, wrappable } from '../../../Utils/ComponentUtils';

/** Attribute value */
function RecordAttribute(props) {
  let { record, attribute } = props;
  return renderAttributeValue(record.attributes[attribute.name], null, 'div');
}

RecordAttribute.propTypes = {
  attribute: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired
};

export default wrappable(RecordAttribute);
