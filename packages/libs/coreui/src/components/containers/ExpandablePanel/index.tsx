import { ReactNode, useEffect, useMemo, useState } from 'react';

import { UITheme } from '../../theming';

import { H6 } from '../../typography';
import { ChevronRight } from '../../icons';

// Definitions
import {
  ExpandablePanelStyleSpec,
  EXPANDABLE_PANEL_PRESET_STYLES,
  useMergedStyle,
} from './stylePresets';
import typography from '../../../styleDefinitions/typography';
import { css } from '@emotion/react';

export type ExpandablePanelProps = {
  /** Title of the panel. */
  title: string;
  /** Optional. Subtitle. Can be either a string or an object. */
  subTitle: string | { [key: string]: string };
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
  /** Optional. Choose to apply a style preset to the component. */
  stylePreset?: keyof typeof EXPANDABLE_PANEL_PRESET_STYLES;
  /** Additional style specifications that will override defaults and theming. */
  styleOverrides?: Partial<ExpandablePanelStyleSpec>;
};

export default function ExpandablePanel({
  title,
  subTitle,
  children,
  state,
  onStateChange,
  themeRole,
  stylePreset = 'default',
  styleOverrides,
}: ExpandablePanelProps) {
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

  const componentStyle = useMergedStyle({
    stylePreset,
    themeRole,
    styleOverrides,
  });

  const renderSubtitle = () => {
    const subtitleStyle = css([
      {
        fontFamily: typography.primaryFont,
        fontSize: 12,
        margin: 0,
        marginLeft:
          styleState === 'closed' ? 29 : styleState === 'focused' ? 34 : 39,
        color: componentStyle[styleState].header.textColor,
        transition: 'all .25s ease',
        marginRight: 25,
      },
    ]);

    switch (typeof subTitle) {
      case 'string':
        return <p css={subtitleStyle}>{subTitle}</p>;

      case 'object':
        return Object.entries(subTitle).map((entry, index) => (
          <p css={subtitleStyle} key={`SubtitleItem-${index}`}>
            <span css={{ fontWeight: 600 }}>{entry[0]}: </span>
            {entry[1]}
          </p>
        ));

      default:
        return null;
    }
  };

  return (
    <div
      role="region"
      aria-label={title}
      css={{
        outlineWidth: componentStyle[styleState].border?.width,
        outlineColor: componentStyle[styleState].border?.color,
        outlineStyle: componentStyle[styleState].border?.style,
        borderRadius: componentStyle[styleState].border?.radius,
        transition: 'all .25s ease',
        ...componentStyle.container,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        css={{
          cursor: 'pointer',
          backgroundColor: componentStyle[styleState].header.backgroundColor,
          transition: 'all .25s ease',
          paddingTop: 15,
          paddingBottom: 15,
          outline: 'none',
        }}
        onClick={() =>
          internalComponentState !== 'closed'
            ? setInternalComponentState('closed')
            : setInternalComponentState('open')
        }
        onKeyDown={(event) => {
          if (['Space', 'Enter'].includes(event.code)) {
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
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <ChevronRight
            fontSize={24}
            css={{
              marginLeft: styleState === 'closed' ? 5 : 10,
              marginRight: styleState === 'open' ? 5 : 0,
              fill: componentStyle[styleState].header.iconColor,
              transition: 'all .25s ease',
              transform:
                internalComponentState === 'open'
                  ? 'rotate(90deg)'
                  : 'rotate(0deg)',
            }}
          />
          <H6
            text={title}
            additionalStyles={{ marginTop: 0, marginBottom: 0 }}
            color={componentStyle[styleState].header.textColor}
          />
        </div>
        {renderSubtitle()}
      </div>
      <div
        key="content"
        css={{
          overflow: internalComponentState === 'open' ? 'initial' : 'hidden',
          height: internalComponentState === 'open' ? undefined : 0,
          backgroundColor: componentStyle['open'].content.backgroundColor,
          transition: 'all .25s ease',
        }}
      >
        {componentStyle['open'].content.divider && (
          <div
            css={{
              backgroundColor: componentStyle['open'].content.divider.color,
              height: componentStyle['open'].content.divider.thickness,
            }}
          />
        )}
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
