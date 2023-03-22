import { gray } from '@veupathdb/coreui/dist/definitions/colors';

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

export const DARKEST_GRAY = gray[900];
export const DARK_GRAY = gray[600];
export const MEDIUM_DARK_GRAY = gray[400];
export const MEDIUM_GRAY = gray[300]; // gray used in disabled state
export const LIGHT_GRAY = gray[100];
