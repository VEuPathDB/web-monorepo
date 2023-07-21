import { useMemo } from 'react';
import Icon from '.';
import { gray } from '../../definitions/colors';
import { IconProps } from './types';
import CancelIcon from '@material-ui/icons/Cancel';

export default function Cancel(props: IconProps) {
  const finalProps = useMemo(() => {
    const defaultProps = {
      width: 13,
      height: 13,
      color: gray[400],
      extraCSS: {},
    };
    return { ...defaultProps, ...props };
  }, [props]);

  return (
    <Icon {...finalProps}>
      <CancelIcon htmlColor={finalProps.color} />
    </Icon>
  );
}
