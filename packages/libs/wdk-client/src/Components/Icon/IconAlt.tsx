import React from 'react';

type Props = {
  fa: string;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
};

export default function Icon(props: Props) {
  let { className, fa, onClick, title, style } = props;
  className = `fa fa-${fa} ${className || ''} wdk-Icon`;
  let clickHandler = onClick
    ? onClick
    : (e: React.MouseEvent<HTMLElement>) => {};
  return (
    <i className={className} onClick={onClick} title={title} style={style}>
      {' '}
    </i>
  );
}
