import React from 'react';
import Link from '../../Components/Link/Link';
import { wrappable } from '../../Utils/ComponentUtils';
import { RecordClass, RecordInstance } from '../../Utils/WdkModel';

interface RecordActionLinkProps {
  record: RecordInstance;
  recordClass: RecordClass;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  href?: string;
  label?: string;
  showLabel?: boolean;
  external?: boolean;
}

const RecordActionLink: React.FC<RecordActionLinkProps> = (props) => {
  const className = 'wdk-RecordActionLink ' + (props.className || '');
  const LinkComponent = props.external ? 'a' : Link;
  const linkProps = {
    [props.external ? 'href' : 'to']: props.href,
    title: props.label,
    className: className,
    onClick: props.onClick,
  };

  return (
    <LinkComponent {...linkProps}>
      {props.showLabel ? props.label : ''} <i className={props.iconClassName} />
    </LinkComponent>
  );
};

RecordActionLink.defaultProps = {
  href: '#',
  external: false,
  className: '',
  label: 'Record action',
  iconClassName: 'fa fa-bolt',
  showLabel: true,
};

export default wrappable(RecordActionLink);
