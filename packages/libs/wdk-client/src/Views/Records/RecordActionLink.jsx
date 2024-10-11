import React from 'react';
import PropTypes from 'prop-types';
import Link from '../../Components/Link/Link';
import { wrappable } from '../../Utils/ComponentUtils';

let RecordActionLink = (props) => {
  const {
    onClick,
    href = '#',
    external = false,
    label = 'Record action',
    iconClassName = 'fa fa-bolt',
    showLabel = true,
  } = props;

  let className = 'wdk-RecordActionLink ' + (props.className || '');
  let LinkComponent = external ? 'a' : Link;
  let linkProps = {
    [external ? 'href' : 'to']: href,
    title: label,
    className: className,
    onClick: onClick,
  };
  return (
    <LinkComponent {...linkProps}>
      {showLabel ? label : ''} <i className={iconClassName} />
    </LinkComponent>
  );
};

RecordActionLink.propTypes = {
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default wrappable(RecordActionLink);
