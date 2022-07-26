import React, { ReactNode } from 'react';
import { css } from '@emotion/react';
import { CSSProperties } from '@emotion/serialize';
import { merge } from 'lodash';
import { useMemo } from 'react';
import { blue, gray, green } from '../../definitions/colors';
import { UITheme } from '../theming/types';
import useUITheme from '../theming/useUITheme';

export type CheckboxListStyleSpec = {
  container: {
    background: CSSProperties['background'],
    padding: CSSProperties['padding'],
    margin: CSSProperties['margin'],
  },
  options: {
    // selectedColor: CSSProperties['color'],
    color: CSSProperties['color'],
    fontSize: number,
    fontWeight: CSSProperties['fontWeight'],
    textTransform: CSSProperties['textTransform'],
    padding: CSSProperties['padding'],
    margin: CSSProperties['margin'],
  },
  links: {
    fontSize: number,
    background: CSSProperties['background'],
    border: CSSProperties['border'],
    color: CSSProperties['color'],
    textDecoration: CSSProperties['textDecoration'],
  },
  border: {
    width: CSSProperties['borderWidth'],
    color: CSSProperties['borderColor'],
    radius: CSSProperties['borderRadius'],
  },
};

enum LinksPosition {
  None,
  Top = 1 << 1,
  Bottom = 1 << 2,
  Both = Top | Bottom
}

type Item = {
  display: ReactNode
  value: string
}

export type CheckboxListProps = {
  /** Optional name attribute for the native input element */
  name?: string;

  /** The items available for selection in the checkbox list */
  items: Item[];

  /** An array of item values currently selected */
  value: string[];

  onChange: (value: string[]) => void;
  
  /**  Controls location of the "select all" and "clear all" buttons */
  linksPosition?: LinksPosition;

  themeRole?: keyof UITheme['palette'];
  styleOverrides?: Partial<CheckboxListStyleSpec>;
}

export default function CheckboxList({
    name,
    items,
    value,
    onChange,
    linksPosition = LinksPosition.Bottom,
    themeRole,
    styleOverrides
}: CheckboxListProps) {

  const defaultStyle: CheckboxListStyleSpec = {
    container: {
      background: 'none',
      padding: 0,
      margin: 0,
    },
    options: {
      color: 'black',
      fontSize: 13,
      fontWeight: 'normal',
      textTransform: 'none',
      padding: 0,
      margin: '0.25em 0.5em',
    },
    links: {
      fontSize: 12,
      background: 0,
      border: 0,
      color: '#069',
      textDecoration: 'default',
    },
    border: {
      width: 0,
      color: 'none',
      radius: '0',
    }
  };

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<CheckboxListStyleSpec>>(
    () =>
      theme && themeRole
        ? {
            // selectedColor:
              // theme.palette[themeRole].hue[theme.palette[themeRole].level],
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(
    () => merge({}, defaultStyle, themeStyle, styleOverrides),
    [themeStyle]
  );

  const linksHoverDecoration = css({
    textDecoration: 'underline',
    cursor: 'pointer',
  })

  const linksStyles = {
    fontSize: finalStyle.links.fontSize,
    background: finalStyle.links.background,
    border: finalStyle.links.border,
    color: finalStyle.links.color,
    textDecoration: finalStyle.links.textDecoration,
    '&:hover': linksHoverDecoration
  }

  const links = (
    <div>
      <button css={linksStyles} type="button" onClick={e => onSelectAll(e)}>select all</button>
      {' | '}
      <button css={linksStyles} type="button" onClick={e => onClearAll(e)}>clear all</button>
    </div>
  );

  const onChangehandler = (valueChanged: string) => {
    const availableSelections = items.map(item => item.value);
    onChange(
      value.indexOf(valueChanged) == -1 ?
      value.concat(valueChanged).sort((a,b) => availableSelections.indexOf(a) - availableSelections.indexOf(b)) :
      value.filter(elem => elem != valueChanged)
    );
}

const onSelectAll = (e: React.MouseEvent<HTMLButtonElement>) => {
  onChange(items.map(item => item.value));
  e.preventDefault();
};

const onClearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
  onChange([]);
  e.preventDefault();
};

  return (
    <div>
      {linksPosition & LinksPosition.Top ? links : null}
      <div>
        {items.map(item => {
          return (
            <div 
              key={item.value}
              css={{
                margin: finalStyle.options.margin,
                color: finalStyle.options.color,
                fontSize: finalStyle.options.fontSize,
              }}  
            >
              <label>
                <input
                  type="checkbox"
                  name={name}
                  value={item.value}
                  checked={value.includes(item.value)}
                  onChange={() => onChangehandler(item.value)}
                />
                {' '}{item.display}
              </label>
            </div>
          );
        })}
      </div>
      {linksPosition & LinksPosition.Bottom ? links : null}
    </div>
  );
}
