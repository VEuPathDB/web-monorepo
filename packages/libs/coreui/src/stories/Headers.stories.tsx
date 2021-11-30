import { Story, Meta } from '@storybook/react/types-6-0';
import { HeaderProps } from '../components/headers/Header';

import { useCoreUIFonts } from '../hooks';

import {
  H1 as H1Component,
  H2 as H2Component,
  H3 as H3Component,
  H4 as H4Component,
  H5 as H5Component,
  H6 as H6Component,
} from '../components/headers';
import UIThemeProvider from '../components/theming/UIThemeProvider';
import { green, mutedBlue, purple } from '../definitions/colors';

export default {
  title: 'Typography/Headers',
  component: H1Component,
  argTypes: {
    color: {
      control: {
        type: 'color',
      },
    },
  },
} as Meta;

export const Default: Story<Omit<HeaderProps, 'size'>> = (args) => {
  useCoreUIFonts();

  return (
    <div>
      <H1Component {...args} text={`H1: ${args.text}`} />
      <H2Component {...args} text={`H2: ${args.text}`} />
      <H3Component {...args} text={`H3: ${args.text}`} />
      <H4Component {...args} text={`H4: ${args.text}`} />
      <H5Component {...args} text={`H5: ${args.text}`} />
      <H6Component {...args} text={`H6: ${args.text}`} />
    </div>
  );
};
Default.args = {
  text: 'Hello Developer',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: false,
};

export const UseTheme: Story<Omit<HeaderProps, 'size'>> = (args) => {
  useCoreUIFonts();

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: green, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
        typography: {
          headers: {
            color: mutedBlue[500],
            h1: {
              fontSize: '3.25rem',
              fontWeight: 700,
            },
            h2: {
              fontSize: '2.75rem',
              fontWeight: 600,
            },
            h3: {
              fontSize: '2.25rem',
              fontWeight: 500,
            },
            h4: {
              fontSize: '1.75rem',
              fontWeight: 500,
            },
            h5: {
              fontSize: '1.25rem',
              fontWeight: 500,
            },
            h6: {
              fontSize: '1rem',
              fontWeight: 400,
            },
          },
        },
      }}
    >
      <div>
        <H1Component {...args} text={`H1: ${args.text}`} />
        <H2Component {...args} text={`H2: ${args.text}`} />
        <H3Component {...args} text={`H3: ${args.text}`} />
        <H4Component {...args} text={`H4: ${args.text}`} />
        <H5Component {...args} text={`H5: ${args.text}`} />
        <H6Component {...args} text={`H6: ${args.text}`} />
      </div>
    </UIThemeProvider>
  );
};
// Headers.storyName = '';
UseTheme.args = {
  text: 'Hello Developer',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: true,
};
