/**
 * Some basic color definitions that can be used to bring consistency to UI components.
 */
const white = '#FFFFFF';
const black = '#000000';

export type ColorHue = {
  [key: number]: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

export const gray: ColorHue = {
  100: '#F2F2F2',
  200: '#D9D9D9',
  300: '#BFBFBF',
  400: '#A6A6A6',
  500: '#808080',
  600: '#666666',
  700: '#4D4D4D',
  800: '#333333',
  900: '#262626',
};

export const tan: ColorHue = {
  100: '#F4F3F0',
  200: '#DEDAD3',
  300: '#C9C1B6',
  400: '#B3A898',
  500: '#93836C',
  600: '#756957',
  700: '#584E41',
  800: '#3B342B',
  900: '#2C2721',
};

export const blue: ColorHue = {
  100: '#E5F4FF',
  200: '#B2DFFF',
  300: '#80CAFF',
  400: '#4DB5FF',
  500: '#0095FF',
  600: '#0077CC',
  700: '#005999',
  800: '#003C66',
  900: '#002D4D',
};

export const mutedBlue: ColorHue = {
  100: '#ECF3F9',
  200: '#C6DCEC',
  300: '#9FC5DF',
  400: '#79ADD2',
  500: '#408ABF',
  600: '#336F99',
  700: '#265373',
  800: '#1A374D',
  900: '#132939',
};

export const cyan: ColorHue = {
  100: '#E5FBFF',
  200: '#B2F2FF',
  300: '#80EAFF',
  400: '#4DE1FF',
  500: '#00D4FF',
  600: '#00AACC',
  700: '#007F99',
  800: '#005566',
  900: '#00404D',
};

export const mutedCyan: ColorHue = {
  100: '#ECF7F9',
  200: '#C6E5EC',
  300: '#9FD4DF',
  400: '#79C3D2',
  500: '#40AABF',
  600: '#338899',
  700: '#266673',
  800: '#1A444D',
  900: '#133339',
};

export const teal: ColorHue = {
  100: '#E5FFFC',
  200: '#B2FFF5',
  300: '#80FFEE',
  400: '#4DFFE7',
  500: '#00FFDD',
  600: '#00CCB1',
  700: '#009985',
  800: '#006658',
  900: '#004D42',
};

export const mutedTeal: ColorHue = {
  100: '#ECF9F7',
  200: '#C6ECE7',
  300: '#9FDFD7',
  400: '#79D2C6',
  500: '#40BFAE',
  600: '#33998B',
  700: '#267369',
  800: '#1A4D46',
  900: '#133934',
};

export const green: ColorHue = {
  100: '#E5FFE5',
  200: '#B2FFB2',
  300: '#80FF80',
  400: '#4DFF4D',
  500: '#00FF00',
  600: '#00CC00',
  700: '#009900',
  800: '#006600',
  900: '#004D00',
};

export const mutedGreen: ColorHue = {
  100: '#ECF9EC',
  200: '#C6ECC6',
  300: '#9FDF9F',
  400: '#79D279',
  500: '#40BF40',
  600: '#339933',
  700: '#267326',
  800: '#1A4D1A',
  900: '#133913',
};

export const yellow: ColorHue = {
  100: '#FFFDE5',
  200: '#FFF9B2',
  300: '#FFF480',
  400: '#FFF04D',
  500: '#FFEA00',
  600: '#CCBB00',
  700: '#998C00',
  800: '#665E00',
  900: '#4D4600',
};

export const mutedYellow: ColorHue = {
  100: '#F9F8EC',
  200: '#ECE9C6',
  300: '#DFDA9F',
  400: '#D2CB79',
  500: '#BFB540',
  600: '#999133',
  700: '#736C26',
  800: '#4D481A',
  900: '#393613',
};

export const orange: ColorHue = {
  100: '#FFF2E5',
  200: '#FFD9B2',
  300: '#FFBF80',
  400: '#FFA64D',
  500: '#FF8000',
  600: '#CC6600',
  700: '#994D00',
  800: '#663300',
  900: '#4D2600',
};

export const mutedOrange: ColorHue = {
  100: '#F9F2EC',
  200: '#ECD9C6',
  300: '#DFBF9F',
  400: '#D2A679',
  500: '#BF8040',
  600: '#996633',
  700: '#734C26',
  800: '#4D331A',
  900: '#392613',
};

export const red: ColorHue = {
  100: '#FFE5E5',
  200: '#FFB2B2',
  300: '#FF8080',
  400: '#FF4D4D',
  500: '#FF0000',
  600: '#CC0000',
  700: '#990000',
  800: '#660000',
  900: '#4D0000',
};

export const mutedRed: ColorHue = {
  100: '#F9ECEC',
  200: '#ECC6C6',
  300: '#DF9F9F',
  400: '#D27979',
  500: '#BF4040',
  600: '#993333',
  700: '#732626',
  800: '#4D1A1A',
  900: '#4D0000',
};

export const magenta: ColorHue = {
  100: '#FFE5F7',
  200: '#FFB2E6',
  300: '#FF80D5',
  400: '#FF4DC4',
  500: '#FF00AA',
  600: '#CC0088',
  700: '#990066',
  800: '#660044',
  900: '#4D0033',
};

export const mutedMagenta: ColorHue = {
  100: '#F9ECF4',
  200: '#ECC6DF',
  300: '#DF9FCA',
  400: '#D279B5',
  500: '#BF4095',
  600: '#993377',
  700: '#732659',
  800: '#4D1A3C',
  900: '#39132D',
};

export const purple: ColorHue = {
  100: '#F7E5FF',
  200: '#E6B2FF',
  300: '#D580FF',
  400: '#C44DFF',
  500: '#AA00FF',
  600: '#8800CC',
  700: '#660099',
  800: '#440066',
  900: '#33004D',
};

export const mutedPurple: ColorHue = {
  100: '#F4ECF9',
  200: '#DFC6EC',
  300: '#CA9FDF',
  400: '#B579D2',
  500: '#9540BF',
  600: '#773399',
  700: '#592673',
  800: '#3C1A4D',
  900: '#2D1339',
};

// Alert colors
export const warning: ColorHue = {
  100: '#FDF7E7',
  200: '#F9E7B8',
  300: '#F5D78A',
  400: '#FFCC4D',
  500: '#ECAE13',
  600: '#BD8C0F',
  700: '#8E690B',
  800: '#5E4608',
  900: '#473406',
};

export const error: ColorHue = {
  100: '#FFE7E5',
  200: '#FFB8B2',
  300: '#FF8880',
  400: '#FF584D',
  500: '#FF1100',
  600: '#CC0E00',
  700: '#990A00',
  800: '#660700',
  900: '#4D0500',
};

export const success: ColorHue = {
  100: '#EBFAEB',
  200: '#C3EFC3',
  300: '#9BE49B',
  400: '#73D973',
  500: '#37C837',
  600: '#2CA02C',
  700: '#217821',
  800: '#165016',
  900: '#103C10',
};

export default {
  white,
  black,
  gray,
  tan,
  blue,
  mutedBlue,
  cyan,
  mutedCyan,
  teal,
  mutedTeal,
  green,
  mutedGreen,
  yellow,
  mutedYellow,
  orange,
  mutedOrange,
  red,
  mutedRed,
  magenta,
  mutedMagenta,
  purple,
  mutedPurple,
  warning,
  error,
  success
};
