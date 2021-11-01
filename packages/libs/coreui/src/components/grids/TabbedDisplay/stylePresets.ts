import { css, SerializedStyles } from '@emotion/react';

import {
  DARK_BLUE,
  DARK_GRAY,
  LIGHT_GRAY,
  MEDIUM_GRAY,
} from '../../../constants/colors';
import typography from '../../../styleDefinitions/typography';

export type TabbedDisplayStyleSpec = {
  inactive: SerializedStyles;
  active: SerializedStyles;
  hover: SerializedStyles;
};

const stylePresets: {
  [Property in 'default']: TabbedDisplayStyleSpec;
} = {
  default: {
    active: css([
      typography.secondaryFont,
      {
        backgroundColor: LIGHT_GRAY,
        color: DARK_GRAY,
        padding: 15,
        borderBottomColor: DARK_BLUE,
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
      },
    ]),
    inactive: css([
      typography.secondaryFont,
      {
        backgroundColor: 'white',
        color: MEDIUM_GRAY,
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
        color: MEDIUM_GRAY,
        padding: 15,
        borderBottomColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
      },
    ]),
  },
};

export default stylePresets;
