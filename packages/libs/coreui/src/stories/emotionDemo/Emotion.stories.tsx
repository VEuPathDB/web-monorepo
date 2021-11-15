import { Story, Meta } from '@storybook/react/types-6-0';
import { ThemeProvider } from '@emotion/react';

import TypographyDemo from './TypographyDemo';
import ThemingDemo from './ThemingDemo';
import { blue, red, tan } from '../../definitions/colors';
import React from 'react';

export default {
  title: 'Emotion',
  // component: TypographyDemo,
} as Meta;

export const BasicTypography: Story = (args) => {
  return <TypographyDemo />;
};

export const Theming: Story<{
  primaryColor: React.CSSProperties['color'];
  secondaryColor: React.CSSProperties['color'];
  borderRadius: number;
  containerPadding: number;
}> = (args) => {
  return (
    <ThemeProvider
      theme={{
        primaryColor: args.primaryColor,
        secondaryColor: args.secondaryColor,
        borderRadius: args.borderRadius,
        containerPadding: args.containerPadding,
      }}
    >
      <ThemingDemo />
    </ThemeProvider>
  );
};

Theming.args = {
  primaryColor: blue[400],
  secondaryColor: tan[400],
  borderRadius: 5,
  containerPadding: 20,
};
