/**
 * Some basic color definitions that can be used to bring consistency to UI components.
 */
export const LIGHT_RED = '#CC3030';
export const LIGHT_ORANGE = '#DD6E36';
export const LIGHT_YELLOW = '#F8CC1B';
export const LIGHT_GREEN = '#40A853';
export const LIGHT_BLUE = '#5586BE';
export const LIGHT_PURPLE = '#6B6AA9';

export const DARK_RED = '#B12929';
export const DARK_ORANGE = '#C8612E';
export const DARK_YELLOW = '#E3B70A';
export const DARK_GREEN = '#338541';
export const DARK_BLUE = '#3C6A9E';
export const DARK_PURPLE = '#5B5A9D';

export const LIGHT_COLORS = [
  LIGHT_RED,
  LIGHT_ORANGE,
  LIGHT_YELLOW,
  LIGHT_GREEN,
  LIGHT_BLUE,
  LIGHT_PURPLE,
];
export const LIGHT_COLORS_REVERSED = [...LIGHT_COLORS].reverse();

export const DARK_COLORS = [
  DARK_RED,
  DARK_ORANGE,
  DARK_YELLOW,
  DARK_GREEN,
  DARK_BLUE,
  DARK_PURPLE,
];

export const PAIRED_COLORS = [
  LIGHT_RED,
  DARK_RED,
  LIGHT_ORANGE,
  DARK_ORANGE,
  LIGHT_YELLOW,
  DARK_YELLOW,
  LIGHT_GREEN,
  DARK_GREEN,
  LIGHT_BLUE,
  DARK_BLUE,
  LIGHT_PURPLE,
  DARK_PURPLE,
];

// export const MEDIUM_GRAY = 'rgb(150, 150, 150)';
// export const LIGHT_GRAY = 'rgb(240, 240, 240)';

type ColorHue = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
};

export const GRAY: ColorHue = {
  100: '#E6E6E6',
  200: '#CCCCCC',
  300: '#A6A6A6',
  400: '#808080',
  500: '#595959',
  600: '#333333',
};

export const FADED_BLUE: ColorHue = {
  100: '#D9E8F2',
  200: '#B3D0E6',
  300: '#79ADD2',
  400: '#4689B9',
  500: '#2D6186',
  600: '#1A374D',
};

export const BLUE: ColorHue = {
  100: '#CFE2FC',
  200: '#9EC4FA',
  300: '#5598F6',
  400: '#0D6CF2',
  500: '#004AB3',
  600: '#082C5E',
};

export const RED: ColorHue = {
  100: '#FFCCCC',
  200: '#F5A3A3',
  300: '#F65555',
  400: '#E51919',
  500: '#A11212',
  600: '#610505',
};

export const ORANGE: ColorHue = {
  100: '#FFE6CC',
  200: '#FFCC99',
  300: '#FFA64D',
  400: '#E58019',
  500: '#B25900',
  600: '#613305',
};

export default {
  GRAY,
  BLUE,
  FADED_BLUE,
  RED,
  ORANGE,
};
