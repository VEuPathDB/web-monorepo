import { Story, Meta } from '@storybook/react/types-6-0';
import Paragraph, {
  ParagraphProps,
} from '../../components/typography/Paragraph';

import { useCoreUIFonts } from '../../hooks';

import UIThemeProvider from '../../components/theming/UIThemeProvider';
import {
  blue,
  gray,
  green,
  mutedBlue,
  mutedRed,
  purple,
} from '../../definitions/colors';

export default {
  title: 'Typography/Paragraph',
  component: Paragraph,
  argTypes: {
    color: {
      control: {
        type: 'color',
      },
    },
  },
} as Meta;

export const Default: Story<ParagraphProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        typography: {
          paragraphs: {
            color: blue[600],
            fontFamily: 'Inter',
            variants: {
              small: { fontSize: 12, fontWeight: 400 },
              medium: { fontSize: 14, fontWeight: 300 },
              large: { fontSize: 16, fontWeight: 200 },
            },
          },
        },
      }}
    >
      <Paragraph {...args} />
    </UIThemeProvider>
  );
};
Default.args = {
  children: 'This is an example paragraph.',
  textSize: 'medium',
  color: gray[700],
  useTheme: false,
  styleOverrides: {},
} as ParagraphProps;

export const UseTheme = Default.bind({});
UseTheme.args = {
  ...Default.args,
  children: 'This is an example paragraph deriving styles from the theme.',
  useTheme: true,
  styleOverrides: {},
} as ParagraphProps;

export const StyleOverrides = Default.bind({});
StyleOverrides.args = {
  ...Default.args,
  children:
    'This is an example paragraph that manually overrides styles. Please see the `styleOverrides` prop for an example of all overridable properties.',
  useTheme: true,
  textSize: undefined,
  styleOverrides: {
    color: mutedRed[400],
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 500,
    margin: 0,
    padding: 0,
  },
} as ParagraphProps;
