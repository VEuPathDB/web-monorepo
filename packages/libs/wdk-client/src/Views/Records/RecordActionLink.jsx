import React from 'react';
import PropTypes from 'prop-types';
import Link from 'wdk-client/Components/Link/Link';
import {wrappable} from 'wdk-client/Utils/ComponentUtils';

let RecordActionLink = props => {
  let className = 'wdk-RecordActionLink ' + props.className;
  let LinkComponent = props.external ? 'a' : Link;
  let linkProps = {
    [props.external ? 'href' : 'to']: props.href,
    title: props.label,
    className: className,
    onClick: props.onClick
  };
  return (
    <LinkComponent {...linkProps}>
      {props.showLabel ? props.label : ''} <i className={props.iconClassName}/>
    </LinkComponent>
  );
}

RecordActionLink.propTypes = {
  record: PropTypes.object.isRequired,
  recordClass: PropTypes.object.isRequired,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string,
  label: PropTypes.string,
  showLabel: PropTypes.bool
}

RecordActionLink.defaultProps = {
  href: '#',
  external: false,
  className: '',
  label: 'Record action',
  iconClassName: 'fa fa-bolt',
  showLabel: true
}

export default wrappable(RecordActionLink);
