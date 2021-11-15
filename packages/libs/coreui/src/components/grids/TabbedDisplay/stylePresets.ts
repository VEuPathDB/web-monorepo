import { css, SerializedStyles } from '@emotion/react';
import { CSSInterpolation } from '@emotion/serialize';

import { blue, gray } from '../../../definitions/colors';
import typography from '../../../styleDefinitions/typography';

export type TabbedDisplayStyleSpec = {
  inactive: SerializedStyles | CSSInterpolation;
  active: SerializedStyles | CSSInterpolation;
  hover: SerializedStyles | CSSInterpolation;
};

const stylePresets: {
  [Property in 'default']: TabbedDisplayStyleSpec;
} = {
  default: {
    active: css([
      typography.secondaryFont,
      {
        backgroundColor: gray[100],
        color: gray[500],
        padding: 15,
        borderBottomColor: blue[500],
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
      },
    ]),
    inactive: css([
      typography.secondaryFont,
      {
        backgroundColor: 'white',
        color: gray[400],
        padding: 15,
        borderBottomColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
      },
    ]),
    hover: css([
      typography.secondaryFont,
      {
        backgroundColor: 'rgb(245, 245, 245)',
        color: gray[400],
        padding: 15,
        borderBottomColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
      },
    ]),
  },
};

export default stylePresets;
