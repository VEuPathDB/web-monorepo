import { Story, Meta } from '@storybook/react/types-6-0';

import {
  H1 as H1Component,
  H2 as H2Component,
  H3 as H3Component,
  H4 as H4Component,
  H5 as H5Component,
  H6 as H6Component,
  HeaderVariantProps,
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

export const Default: Story<HeaderVariantProps> = (args) => {
  const validArgs = {
    text: args.text,
    additionalStyles: args.additionalStyles,
    useTheme: args.useTheme,
  };

  return (
    <div>
      <H1Component {...validArgs} text={`H1: ${validArgs.text}`} />
      <H2Component {...validArgs} text={`H2: ${validArgs.text}`} />
      <H3Component {...validArgs} text={`H3: ${validArgs.text}`} />
      <H4Component {...validArgs} text={`H4: ${validArgs.text}`} />
      <H5Component {...validArgs} text={`H5: ${validArgs.text}`} />
      <H6Component {...validArgs} text={`H6: ${validArgs.text}`} />
    </div>
  );
};
Default.args = {
  text: 'Header',

  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: false,
} as HeaderVariantProps;

export const FormattedText: Story<HeaderVariantProps> = (args) => {
  const validArgs = {
    children: args.children,
    additionalStyles: args.additionalStyles,
    useTheme: args.useTheme,
  };

  return (
    <div>
      <H1Component {...validArgs} />
      <H2Component {...validArgs} />
      <H3Component {...validArgs} />
      <H4Component {...validArgs} />
      <H5Component {...validArgs} />
      <H6Component {...validArgs} />
    </div>
  );
};
FormattedText.args = {
  children: (
    <span>
      <i>Formatted </i>Text
    </span>
  ),
  text: undefined,
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: false,
} as HeaderVariantProps;

export const UseTheme: Story<HeaderVariantProps> = (args) => {
  const validArgs = {
    text: args.text,
    additionalStyles: args.additionalStyles,
    useTheme: args.useTheme,
  };

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
        <H1Component {...validArgs} text={`H1: ${validArgs.text}`} />
        <H2Component {...validArgs} text={`H2: ${validArgs.text}`} />
        <H3Component {...validArgs} text={`H3: ${validArgs.text}`} />
        <H4Component {...validArgs} text={`H4: ${validArgs.text}`} />
        <H5Component {...validArgs} text={`H5: ${validArgs.text}`} />
        <H6Component {...validArgs} text={`H6: ${validArgs.text}`} />
      </div>
    </UIThemeProvider>
  );
};

UseTheme.args = {
  text: 'Hello Developer',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
  useTheme: true,
};
