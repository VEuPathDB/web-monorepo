import React from 'react';
import PropTypes from 'prop-types';
import { wrappable } from '../../Utils/ComponentUtils';

function AnswerTableHeader(props) {
  let {
    descriptor: { help, displayName },
  } = props;
  return <span title={help || ''}>{displayName}</span>;
}

AnswerTableHeader.propTypes = {
  descriptor: PropTypes.object.isRequired,
};

export default wrappable(AnswerTableHeader);
