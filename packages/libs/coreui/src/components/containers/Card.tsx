import { CSSProperties, ReactNode, useEffect, useMemo } from 'react';
import { merge } from 'lodash';
import useDimensions from 'react-cool-dimensions';

// Components
import { H3, H4 } from '../typography/headers';

// Definitions
import { blue, gray } from '../../definitions/colors';
import { UITheme } from '../theming/types';

// Hooks
import useUITheme from '../theming/useUITheme';

type CardStyleSpec = {
  border: {
    color: CSSProperties['borderColor'];
    width: CSSProperties['borderWidth'];
    radius: CSSProperties['borderRadius'];
    style: CSSProperties['borderStyle'];
  };
  header: {
    primaryBackgroundColor: CSSProperties['backgroundColor'];
    secondaryBackgroundColor: CSSProperties['backgroundColor'];
  };
  content: {
    paddingTop: CSSProperties['paddingTop'];
    paddingRight: CSSProperties['paddingRight'];
    paddingBottom: CSSProperties['paddingBottom'];
    paddingLeft: CSSProperties['paddingLeft'];
    backgroundColor: CSSProperties['backgroundColor'];
  };
};

export type CardProps = {
  /** The title of the card. */
  title: string;
  /** Optional. Size control for the title text. */
  titleSize?: 'large' | 'small';
  /** The width of the card. */
  width: CSSProperties['width'];
  /** The height of the card. */
  height: CSSProperties['height'];
  /** The contents of the modal.  */
  children: ReactNode;
  /** Indicates which theme role to use for style augmentation. */
  themeRole?: keyof UITheme['palette'];
  /** Allows you to adjust the style of the modal. Applied *after* theming augmentation. */
  styleOverrides?: Partial<CardStyleSpec>;
};

export default function Card({
  title,
  titleSize = 'large',
  width,
  height,
  themeRole,
  styleOverrides = {},
  children,
}: CardProps) {
  const theme = useUITheme();
  const { observe, width: titleWidth, height: titleHeight } = useDimensions();

  const TitleComponent = titleSize === 'large' ? H3 : H4;

  const componentStyle: CardStyleSpec = useMemo(() => {
    const defaultStyle: CardStyleSpec = {
      border: {
        width: 2,
        style: 'solid',
        color: gray[400],
        radius: 5,
      },
      content: {
        paddingTop: 0,
        paddingRight: 35,
        paddingBottom: 25,
        paddingLeft: 25,
        backgroundColor: 'transparent',
      },
      header: {
        primaryBackgroundColor: blue[500],
        secondaryBackgroundColor: blue[600],
      },
    };

    const themeStyle: Partial<CardStyleSpec> =
      theme && themeRole
        ? {
            header: {
              primaryBackgroundColor:
                theme.palette[themeRole].hue[theme.palette.primary.level],
              secondaryBackgroundColor:
                theme.palette[themeRole].hue[theme.palette.primary.level + 100],
            },
          }
        : {};

    return merge({}, defaultStyle, themeStyle, styleOverrides);
  }, [themeRole, styleOverrides, theme]);

  useEffect(() => {
    console.log(titleHeight, titleWidth);
  }, [titleHeight, titleWidth]);

  const titleBarHeight = useMemo(() => titleHeight + 40, [titleHeight]);

  return (
    <div
      css={{
        width: width,
        height: height,
        borderRadius: componentStyle.border.radius,
        outlineColor: componentStyle.border.color,
        outlineWidth: componentStyle.border.width,
        outlineStyle: componentStyle.border.style,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          flexBasis: titleBarHeight,
          position: 'relative',
        }}
      >
        <div
          css={{
            flex: 1,
            backgroundColor: componentStyle.header.primaryBackgroundColor,
            borderTopLeftRadius: componentStyle.border.radius,
            borderTopRightRadius: componentStyle.border.radius,
          }}
        />
        <div
          css={{
            flexBasis: 15,
            backgroundColor: componentStyle.header.secondaryBackgroundColor,
          }}
        />
        <TitleComponent
          ref={observe}
          text={title}
          color='white'
          additionalStyles={{
            margin: 0,
            marginRight: 15,
            padding: 0,
            position: 'absolute',
            left: componentStyle.content.paddingLeft,
            top: titleBarHeight - titleHeight - (titleSize === 'large' ? 4 : 7),
          }}
          useTheme={false}
        />
      </div>
      <div
        css={{
          flex: 1,
          flexShrink: 1,
          paddingTop: componentStyle.content.paddingTop,
          paddingRight: componentStyle.content.paddingRight,
          paddingBottom: componentStyle.content.paddingBottom,
          paddingLeft: componentStyle.content.paddingLeft,
          backgroundColor: componentStyle.content.backgroundColor,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
