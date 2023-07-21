import { useMemo } from 'react';
import Icon from '.';
import { gray } from '../../definitions/colors';
import { IconProps } from './types';

export default function CaretUpIcon(props: IconProps) {
  const finalProps = useMemo(() => {
    const defaultProps = {
      width: 12,
      height: 8,
      color: gray[400],
      extraCSS: {},
    };
    return { ...defaultProps, ...props };
  }, [props]);

  return (
    <Icon {...finalProps}>
      <g transform="matrix(1,0,0,1,-6,-8)">
        <path d="M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z" />
      </g>
    </Icon>
  );
}
