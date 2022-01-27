import { merge } from 'lodash';
import { CSSProperties, useMemo } from 'react';
import { blue, gray } from '../../../definitions/colors';
import { UITheme, useUITheme } from '../../theming';

export type PanelStateStyleSpec = {
  border?: {
    width: number;
    color: CSSProperties['borderColor'];
    style: CSSProperties['borderStyle'];
    radius: CSSProperties['borderRadius'];
  };
  header: {
    textColor: CSSProperties['color'];
    iconColor: CSSProperties['color'];
    backgroundColor: CSSProperties['backgroundColor'];
  };
};

export type ExpandablePanelStyleSpec = {
  container: CSSProperties;
  closed: PanelStateStyleSpec;
  focused: PanelStateStyleSpec;
  open: PanelStateStyleSpec & {
    content: {
      maxHeight?: CSSProperties['maxHeight'];
      divider?: {
        color: CSSProperties['color'];
        thickness: number;
      };
      backgroundColor: CSSProperties['backgroundColor'];
    };
  };
};

export const EXPANDABLE_PANEL_PRESET_STYLES: Record<
  'default' | 'floating',
  ExpandablePanelStyleSpec
> = {
  default: {
    container: {},
    closed: {
      border: {
        width: 2,
        color: gray[300],
        style: 'solid',
        radius: 5,
      },
      header: {
        textColor: gray[500],
        iconColor: gray[500],
        backgroundColor: 'white',
      },
    },
    focused: {
      border: {
        width: 2,
        color: gray[400],
        style: 'solid',
        radius: 5,
      },
      header: {
        backgroundColor: 'white',
        textColor: gray[600],
        iconColor: gray[600],
      },
    },
    open: {
      border: {
        width: 2,
        color: gray[400],
        style: 'solid',
        radius: 5,
      },
      header: {
        textColor: gray[700],
        iconColor: gray[700],
        backgroundColor: 'white',
      },
      content: {
        divider: {
          color: blue[500],
          thickness: 5,
        },
        maxHeight: undefined,
        backgroundColor: 'white',
      },
    },
  },
  floating: {
    container: {},
    closed: {
      header: {
        backgroundColor: 'white',
        iconColor: blue[600],
        textColor: blue[600],
      },
      border: {
        width: 2,
        color: 'white',
        style: 'solid',
        radius: 5,
      },
    },
    focused: {
      header: {
        backgroundColor: blue[100],
        iconColor: blue[700],
        textColor: blue[700],
      },
      border: {
        width: 2,
        color: 'white',
        style: 'solid',
        radius: 5,
      },
    },
    open: {
      header: {
        backgroundColor: blue[200],
        iconColor: blue[800],
        textColor: blue[800],
      },
      border: {
        width: 2,
        color: 'white',
        style: 'solid',
        radius: 5,
      },
      content: {
        backgroundColor: blue[100],
      },
    },
  },
};

export const useMergedStyle = ({
  stylePreset,
  themeRole,
  styleOverrides,
}: {
  stylePreset: keyof typeof EXPANDABLE_PANEL_PRESET_STYLES;
  themeRole?: keyof UITheme['palette'];
  styleOverrides?: Partial<ExpandablePanelStyleSpec>;
}): ExpandablePanelStyleSpec => {
  const theme = useUITheme();

  return useMemo<ExpandablePanelStyleSpec>(() => {
    // Step 1: Grab the style for the provided preset.
    const presetStyle = EXPANDABLE_PANEL_PRESET_STYLES[stylePreset];

    /**
     * Step 2: Apply any theme modifications.
     *
     * NOTE: Each stylePreset will apply the theme differently,
     * so this can be a little complex.
     *
     * NOTE: Currently... we only rely on the hue specified in the
     * hue, not the level... I'm wondering if we should even
     * specify the level the further I get into this or if it is just better
     * to just let the user specify the hue and then have each component determine
     * it's own levels... not sure if it is worth it to do all the color "math"
     * for the library at this stage.
     * */
    let themeStyle: Partial<ExpandablePanelStyleSpec>;
    if (!theme || !themeRole) {
      themeStyle = {};
    } else {
      switch (stylePreset) {
        case 'default':
          themeStyle = {
            open: {
              border: {
                width: 2,
                color: gray[400],
                style: 'solid',
                radius: 5,
              },
              header: {
                textColor: gray[700],
                iconColor: gray[700],
                backgroundColor: 'white',
              },
              content: {
                divider: {
                  color:
                    theme.palette[themeRole].hue[
                      theme.palette[themeRole].level
                    ],
                  thickness: 5,
                },
                backgroundColor: 'white',
              },
            },
          };
          break;

        case 'floating':
          themeStyle = {
            closed: {
              header: {
                backgroundColor: 'transparent',
                iconColor: theme.palette[themeRole].hue[600],
                textColor: theme.palette[themeRole].hue[600],
              },
            },
            focused: {
              header: {
                backgroundColor: theme.palette[themeRole].hue[100],
                iconColor: theme.palette[themeRole].hue[700],
                textColor: theme.palette[themeRole].hue[700],
              },
            },
            open: {
              header: {
                backgroundColor: theme.palette[themeRole].hue[200],
                iconColor: theme.palette[themeRole].hue[800],
                textColor: theme.palette[themeRole].hue[800],
              },
              content: {
                backgroundColor: theme.palette[themeRole].hue[100],
              },
            },
          };
          break;

        default:
          themeStyle = {};
          break;
      }
    }

    return merge({}, presetStyle, themeStyle, styleOverrides);
  }, [themeRole, styleOverrides, theme, stylePreset]);
};
