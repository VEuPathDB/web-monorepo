import React from 'react';
import Icon from '../../Components/Icon/IconAlt';

type Props = {
  on: boolean;
};

export default function Toggle(props: Props) {
  return (
    <Icon
      className={props.on ? 'blue-text' : 'mediumgray-text fa-flip-horizontal'}
      fa="toggle-on"
    />
  );
}
