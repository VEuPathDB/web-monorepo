import React from 'react';
import PropTypes from 'prop-types';
import Link from '../../Components/Link/Link';
import { wrappable } from '../../Utils/ComponentUtils';

let idPartPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
});

function RecordLink(props) {
  let { recordClass, recordId } = props;
  let pkValues = recordId.map((p) => p.value).join('/');

  return (
    <Link to={`/record/${recordClass.urlSegment}/${pkValues}`}>
      {props.children}
    </Link>
  );
}

RecordLink.propTypes = {
  recordId: PropTypes.arrayOf(idPartPropType).isRequired,
  recordClass: PropTypes.object.isRequired,
};

export default wrappable(RecordLink);
