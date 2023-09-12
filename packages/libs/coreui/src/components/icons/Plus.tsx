import { SVGProps } from 'react';
import { Add } from '@material-ui/icons';

const Plus = (props: SVGProps<SVGSVGElement>) => {
  const { height = '1em', width = '1em' } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-16 176 352 224"
      height={height}
      width={width}
      {...props}
    >
      <Add />
    </svg>
  );
};

export default Plus;
