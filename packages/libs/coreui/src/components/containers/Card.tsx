import { CSSProperties, ReactNode, useMemo } from 'react';
import { merge } from 'lodash';
import useDimensions from 'react-cool-dimensions';

// Components
import { H3, H4, H5 } from '../typography/headers';

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
    minimumHeight?: CSSProperties['minHeight'];
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
  titleSize?: 'small' | 'medium' | 'large';
  /** The width of the card. */
  width: CSSProperties['width'];
  /** The height of the card. */
  height: CSSProperties['height'];
  /** The contents of the modal.  */
  children: ReactNode;
  /** Indicates which theme role to use for style augmentation. */
  themeRole?: keyof UITheme['palette'];
  /**
   * Allows you to customize the style of the card.
   * Applied *after* theming augmentation.
   * */
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
  const { observe, height: titleHeight } = useDimensions();

  const TitleComponent =
    titleSize === 'large' ? H3 : titleSize === 'medium' ? H4 : H5;

  // Determine the height of the title bar.
  const titleBarHeight = useMemo(() => {
    if (
      styleOverrides.header?.minimumHeight &&
      styleOverrides.header.minimumHeight > titleHeight + 35
    )
      return styleOverrides.header.minimumHeight;

    return titleHeight + 35;
  }, [titleHeight, titleSize, styleOverrides]);

  const titleTopOffset = useMemo(
    () => (titleSize === 'large' ? 10 : titleSize === 'medium' ? 7 : 5),
    [titleSize]
  );

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
        overflow: 'hidden',
      }}
    >
      <div
        key='titleBar'
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            backgroundColor: componentStyle.header.primaryBackgroundColor,
          }}
        >
          <TitleComponent
            ref={observe}
            text={title}
            color='white'
            additionalStyles={{
              margin: 0,
              marginRight: 15,
              padding: 0,
              position: 'relative',
              backgroundColor: 'transparent',
              marginLeft: componentStyle.content.paddingLeft,
              top: titleTopOffset,
            }}
            useTheme={false}
          />
        </div>
      </div>
      <div
        css={{
          height: 15,
          backgroundColor: componentStyle.header.secondaryBackgroundColor,
        }}
      />
      <div
        css={{
          flex: 1,
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
