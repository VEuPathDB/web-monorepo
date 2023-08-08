import { useMemo } from 'react';
import Icon from '.';
import { gray } from '../../definitions/colors';
import { IconProps } from './types';

export default function CaretDownIcon(props: IconProps) {
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
      <g transform="matrix(-1,-1.22465e-16,1.22465e-16,-1,18,15.41)">
        <path d="M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z" />
      </g>
    </Icon>
  );
}
