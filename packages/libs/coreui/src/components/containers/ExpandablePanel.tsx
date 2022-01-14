import { merge } from 'lodash';
import { CSSProperties, ReactNode, useEffect, useMemo, useState } from 'react';

import { UITheme, useUITheme } from '../theming';

import { H6 } from '../headers';
import { blue, gray, green } from '../../definitions/colors';
import { ChevronRight } from '../icons';

type PanelStateStyleSpec = {
  border: {
    width: number;
    color: CSSProperties['borderColor'];
    style: CSSProperties['borderStyle'];
    radius: CSSProperties['borderRadius'];
  };
  title: {
    textColor: CSSProperties['color'];
    iconColor: CSSProperties['color'];
  };
};

type ExpandablePanelStyleSpec = {
  container: CSSProperties;
  closed: PanelStateStyleSpec;
  focused: PanelStateStyleSpec;
  open: PanelStateStyleSpec & {
    content: {
      maxHeight?: CSSProperties['maxHeight'];
      divider: {
        color: CSSProperties['color'];
        thickness: number;
      };
    };
  };
};

export type ExpandablePanelProps = {
  /** Title of the panel. */
  title: string;
  /** Content displayed when the panel is open. */
  children: ReactNode;
  /**
   * Optional. Current state of the component. You only need
   * to specify this if you want to control the component from
   * the outside.
   * */
  state?: 'closed' | 'open';
  /**
   * Optional. Callback to invoke when the user attempts to open/close
   * the panel. Callback must receive the new state of the component.
   * */
  onStateChange?: (newState: 'closed' | 'open') => void;
  /** Indicates which theme role to use for style augmentation. */
  themeRole?: keyof UITheme['palette'];
  /** Additional style specifications that will override defaults and theming. */
  styleOverrides?: Partial<ExpandablePanelStyleSpec>;
};

export default function ExpandablePanel({
  title,
  children,
  state,
  onStateChange,
  themeRole,
  styleOverrides,
}: ExpandablePanelProps) {
  const theme = useUITheme();

  const [hasFocus, setHasFocus] = useState(false);
  const [internalComponentState, setInternalComponentState] =
    useState<NonNullable<ExpandablePanelProps['state']>>('closed');

  useEffect(() => {
    state &&
      state !== internalComponentState &&
      setInternalComponentState(state);
  }, [state]);

  useEffect(
    () => onStateChange && onStateChange(internalComponentState),
    [internalComponentState]
  );

  const styleState = useMemo<'open' | 'focused' | 'closed'>(
    () =>
      internalComponentState === 'open'
        ? 'open'
        : hasFocus
        ? 'focused'
        : 'closed',
    [hasFocus, internalComponentState]
  );

  const componentStyle: ExpandablePanelStyleSpec = useMemo(() => {
    const defaultStyle: ExpandablePanelStyleSpec = {
      container: {},
      closed: {
        border: {
          width: 2,
          color: gray[300],
          style: 'solid',
          radius: 5,
        },
        title: {
          textColor: gray[500],
          iconColor: gray[500],
        },
      },
      focused: {
        border: {
          width: 2,
          color: gray[400],
          style: 'solid',
          radius: 5,
        },
        title: {
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
        title: {
          textColor: gray[700],
          iconColor: gray[700],
        },
        content: {
          divider: {
            color: blue[500],
            thickness: 5,
          },
          maxHeight: undefined,
        },
      },
    };

    const themeStyle: Partial<ExpandablePanelStyleSpec> =
      theme && themeRole
        ? {
            open: {
              border: {
                width: 2,
                color: gray[400],
                style: 'solid',
                radius: 5,
              },
              title: {
                textColor: gray[700],
                iconColor: gray[700],
              },
              content: {
                divider: {
                  color:
                    theme.palette[themeRole].hue[
                      theme.palette[themeRole].level
                    ],
                  thickness: 5,
                },
              },
            },
          }
        : {};

    return merge({}, defaultStyle, themeStyle, styleOverrides);
  }, [themeRole, styleOverrides, theme]);

  return (
    <div
      role='region'
      aria-label={title}
      css={{
        outlineWidth: componentStyle[styleState].border.width,
        outlineColor: componentStyle[styleState].border.color,
        outlineStyle: componentStyle[styleState].border.style,
        borderRadius: componentStyle[styleState].border.radius,
        // outlineOffset: -1 * componentStyle[internalComponentState].border.width,
        transition: 'all .25s ease',
        ...componentStyle.container,
      }}
    >
      <div
        role='button'
        tabIndex={0}
        css={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
        }}
        onClick={() =>
          internalComponentState !== 'closed'
            ? setInternalComponentState('closed')
            : setInternalComponentState('open')
        }
        onKeyDown={(event) => {
          if (['Space', 'Enter'].includes(event.code)) {
            console.log(internalComponentState);
            internalComponentState !== 'closed'
              ? setInternalComponentState('closed')
              : setInternalComponentState('open');
          }
        }}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        onMouseOver={() => setHasFocus(true)}
        onMouseOut={() => setHasFocus(false)}
      >
        <ChevronRight
          fontSize={24}
          css={{
            marginLeft: styleState === 'closed' ? 5 : 10,
            marginRight: styleState === 'open' ? 5 : 0,
            fill: componentStyle[styleState].title.iconColor,
            transition: 'all .25s ease',
            transform:
              internalComponentState === 'open'
                ? 'rotate(90deg)'
                : 'rotate(0deg)',
          }}
        />
        <H6
          text={title}
          additionalStyles={{ marginTop: 15, marginBottom: 15 }}
          color={componentStyle[styleState].title.textColor}
        />
      </div>
      <div
        css={{
          overflow: internalComponentState === 'open' ? 'initial' : 'hidden',
          height: internalComponentState === 'open' ? undefined : 0,
        }}
      >
        <div
          css={{
            backgroundColor: componentStyle['open'].content.divider.color,
            height: componentStyle['open'].content.divider.thickness,
          }}
        />
        <div
          css={{
            opacity: styleState === 'open' ? 1 : 0,
            transition: 'all .5s ease',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
