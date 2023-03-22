import React from 'react';
import { gray } from '../../../definitions/colors';
import { PaginationControlsStyleSpec } from './PaginationControls';

export type DataGridStyleSpec = {
  /** Styles for the table element. */
  table: {
    borderWidth?: React.CSSProperties['borderWidth'];
    borderStyle: React.CSSProperties['borderStyle'];
    borderColor?: React.CSSProperties['borderColor'];
    primaryRowColor: React.CSSProperties['color'];
    secondaryRowColor: React.CSSProperties['color'];
    width?: React.CSSProperties['width'];
    height?: React.CSSProperties['height'];
    overflow?: React.CSSProperties['overflow'];
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
  size?: {
    width?: React.CSSProperties['width'];
    height?: React.CSSProperties['height'];
  };
  paginationControls?: {
    top?: PaginationControlsStyleSpec;
    bottom?: PaginationControlsStyleSpec;
  }
};

const mesa: DataGridStyleSpec = {
  table: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: gray[200],
    primaryRowColor: 'white',
    secondaryRowColor: 'rgb(245, 245, 245)',
  },
  headerCells: {
    borderLeft: 'solid 1px',
    borderTop: 'solid 1px',
    borderRight: 'solid 1px',
    borderColor: gray[200],
    paddingLeft: 10,
    paddingRight: 30,
    paddingBottom: 10,
    paddingTop: 10,
    color: gray[800],
    alignContent: 'center',
    backgroundColor: gray[100],
    fontSize: 13,
  },
  dataCells: {
    padding: '10px',
    borderLeft: 'solid 1px',
    borderRight: 'solid 1px',
    borderColor: gray[200],
    color: gray[800],
    fontSize: 12,
  },
  icons: {
    inactiveColor: gray[300],
    activeColor: gray[400],
  },
};

const stylePresets: {
  [Property in 'default' | 'mesa']: DataGridStyleSpec;
} = {
  default: {
    table: {
      borderStyle: 'none',
      primaryRowColor: 'white',
      secondaryRowColor: gray[100],
    },
    headerCells: {
      border: 'none',
      paddingLeft: 10,
      paddingRight: 30,
      paddingBottom: 5,
      paddingTop: 5,
      color: gray[500],
      alignContent: 'center',
      textTransform: 'capitalize',
    },
    dataCells: {
      padding: '10px',
      border: 'solid 2px',
      borderColor: gray[300],
      color: gray[400],
    },
    icons: {
      inactiveColor: gray[200],
      activeColor: gray[400],
    },
    size: {
      width: 'auto',
      height: 'auto',
    }
  },
  mesa,
};

export default stylePresets;
