import { useMemo } from 'react';
import Icon from '.';
import { gray } from '../../definitions/colors';
import { IconProps } from './types';

export default function DoubleArrow(props: IconProps) {
  const finalProps = useMemo(() => {
    const defaultProps = {
      width: 13,
      height: 12,
      color: gray[400],
      extraCSS: {},
    };
    return { ...defaultProps, ...props };
  }, [props]);

  return (
    <Icon {...finalProps}>
      <g transform="matrix(6.12323e-17,1,-1.75439,1.07425e-16,13.444,0)">
        <g transform="matrix(-1,-7.15676e-16,1.25557e-15,-0.57,18,11.97)">
          <path d="M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z" />
        </g>
        <g transform="matrix(-1,-7.15676e-16,1.25557e-15,-0.57,18.0056,9.28981)">
          <path d="M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z" />
        </g>
      </g>
    </Icon>
  );
}
