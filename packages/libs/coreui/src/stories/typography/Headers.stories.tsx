import { Story, Meta } from '@storybook/react/types-6-0';
import { HeaderProps } from '../../components/typography/headers/Header';

import {
  H1 as H1Component,
  H2 as H2Component,
  H3 as H3Component,
  H4 as H4Component,
  H5 as H5Component,
  H6 as H6Component,
} from '../../components/typography';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { green, mutedBlue, purple } from '../../definitions/colors';

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
  text: 'Header',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: false,
};

export const FormattedText: Story<Omit<HeaderProps, 'size'>> = (args) => {
  return (
    <div>
      <H1Component {...args} />
      <H2Component {...args} />
      <H3Component {...args} />
      <H4Component {...args} />
      <H5Component {...args} />
      <H6Component {...args} />
    </div>
  );
};
FormattedText.args = {
  text: (
    <span>
      <i>Formatted </i>Text
    </span>
  ),
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: false,
} as HeaderProps;

export const UseTheme: Story<Omit<HeaderProps, 'size'>> = (args) => {
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
            variants: {
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

UseTheme.args = {
  text: 'Hello Developer',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: true,
};
