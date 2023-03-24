import * as React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';

const iconClassNames = {
  warning: 'fa fa-warning',
  info: 'fa fa-info-circle',
  help: 'fa fa-question-circle',
  close: 'fa fa-close',
};

type Props = {
  type: keyof typeof iconClassNames;
  className?: string;
};

function Icon(props: Props) {
  return <i className={makeClassName(props.type, props.className)} />;
}

export default wrappable(Icon);

function makeClassName(type: Props['type'], className = 'wdk-Icon') {
  return `${iconClassNames[type]} ${className} ${className}__${type}`;
}
