import PropTypes from 'prop-types';
import { safeHtml, wrappable } from 'wdk-client/Utils/ComponentUtils';

function RecordTableDescription(props) {
  return props.description ? <p>{safeHtml(props.description)}</p> : null;
}

RecordTableDescription.propTypes = {
  table: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired
};

export default wrappable(RecordTableDescription);
