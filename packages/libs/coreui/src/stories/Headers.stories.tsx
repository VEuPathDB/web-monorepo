import { Story, Meta } from '@storybook/react/types-6-0';
import { HeaderProps } from '../components/headers/Header';

import { useCoreUIFonts } from '../hooks';

import {
  H1 as H1Component,
  H2 as H2Component,
  H3 as H3Component,
  H4 as H4Component,
  H5 as H5Component,
} from '../components/headers';

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

export const Headers: Story<Omit<HeaderProps, 'size'>> = (args) => {
  useCoreUIFonts();

  return (
    <div>
      <H1Component {...args} text={`H1: ${args.text}`} />
      <H2Component {...args} text={`H2: ${args.text}`} />
      <H3Component {...args} text={`H3: ${args.text}`} />
      <H4Component {...args} text={`H4: ${args.text}`} />
      <H5Component {...args} text={`H5: ${args.text}`} />
    </div>
  );
};
// Headers.storyName = '';
Headers.args = {
  text: 'Hello Developer',
  additionalStyles: { marginBottom: 0, marginTop: 15 },
};
