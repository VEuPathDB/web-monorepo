import React from 'react';
import {
  DARK_GRAY,
  DARK_ORANGE,
  LIGHT_GRAY,
  LIGHT_ORANGE,
  MEDIUM_GRAY,
} from '../../../constants/colors';

export type DataGridStyleSpec = {
  /** Styles for the table element. */
  table: {
    borderWidth?: React.CSSProperties['borderWidth'];
    borderStyle: React.CSSProperties['borderStyle'];
    borderColor?: React.CSSProperties['borderColor'];
    primaryRowColor: React.CSSProperties['color'];
    secondaryRowColor: React.CSSProperties['color'];
  };
  /** Styles for header cells. */
  headerCells: React.CSSProperties;
  /** Styles for data cells. */
  dataCells: React.CSSProperties;
  /** Color directives for icons. */
  icons: {
    inactiveColor: NonNullable<React.CSSProperties['color']>;
    activeColor: NonNullable<React.CSSProperties['color']>;
  };
};

const mesa: DataGridStyleSpec = {
  table: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgb(225, 225, 225)',
    primaryRowColor: 'white',
    secondaryRowColor: 'rgb(245, 245, 245)',
  },
  headerCells: {
    borderLeft: 'solid 1px',
    borderTop: 'solid 1px',
    borderRight: 'solid 1px',
    borderColor: 'rgb(225, 225, 225)',
    paddingLeft: 10,
    paddingRight: 30,
    paddingBottom: 10,
    paddingTop: 10,
    color: DARK_GRAY,
    display: 'flex',
    alignContent: 'center',
    backgroundColor: 'rgb(235, 235, 235)',
    fontSize: 13,
  },
  dataCells: {
    padding: '10px',
    borderLeft: 'solid 1px',
    borderRight: 'solid 1px',
    borderColor: 'rgb(225, 225, 225)',
    color: DARK_GRAY,
    fontSize: 12,
  },
  icons: {
    inactiveColor: MEDIUM_GRAY,
    activeColor: DARK_GRAY,
  },
};

const stylePresets: {
  [Property in 'default' | 'mesa']: DataGridStyleSpec;
} = {
  default: {
    table: {
      borderStyle: 'none',
      primaryRowColor: 'white',
      secondaryRowColor: LIGHT_GRAY,
    },
    headerCells: {
      border: 'none',
      paddingLeft: 10,
      paddingRight: 30,
      paddingBottom: 5,
      paddingTop: 5,
      color: DARK_GRAY,
      display: 'flex',
      alignContent: 'center',
    },
    dataCells: {
      padding: '10px',
      border: 'solid 2px',
      borderColor: MEDIUM_GRAY,
      color: DARK_GRAY,
    },
    icons: {
      inactiveColor: MEDIUM_GRAY,
      activeColor: DARK_GRAY,
    },
  },
  mesa,
};

export default stylePresets;
