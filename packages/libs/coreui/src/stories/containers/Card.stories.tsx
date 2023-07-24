import { Story, Meta } from '@storybook/react/types-6-0';

import { blue, gray, mutedGreen, mutedMagenta } from '../../definitions/colors';

import Card, { CardProps } from '../../components/containers/Card';
import { FilledButton } from '../../components/buttons';
import { UIThemeProvider } from '../../components/theming';
import Paragraph from '../../components/typography/Paragraph';

const ModalContent = ({
  themeRole,
}: {
  themeRole: 'primary' | 'secondary';
}) => (
  <div
    css={{
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div>
      <Paragraph color={gray[600]}>
        This is an example full-screen modal.
      </Paragraph>
      <Paragraph color={gray[600]}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Mi quis hendrerit
        dolor magna eget est.
      </Paragraph>
    </div>
    <FilledButton
      text="Example Button"
      onPress={() => null}
      themeRole={themeRole}
    />
  </div>
);

export default {
  title: 'Containers/Card',
  component: Card,
} as Meta;

const Template: Story<CardProps> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedGreen, level: 500 },
          secondary: { hue: mutedMagenta, level: 500 },
        },
      }}
    >
      <Card {...args}>
        <ModalContent themeRole={args.themeRole} />
      </Card>
    </UIThemeProvider>
  );
};
export const Basic = Template.bind({});
Basic.args = {
  title: 'Example Card',
  titleSize: 'large',
  height: 450,
  width: 350,
} as CardProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  title: 'Example Card',
  titleSize: 'large',
  height: 450,
  width: 350,
  themeRole: 'primary',
} as CardProps;

export const SmallTitle = Template.bind({});
SmallTitle.args = {
  title: 'Example Card',
  titleSize: 'small',
  height: 450,
  width: 350,
  themeRole: 'primary',
} as CardProps;

export const ThinMargins = Template.bind({});
ThinMargins.args = {
  title: 'Example Card',
  titleSize: 'large',
  height: 450,
  width: 350,
  themeRole: 'primary',
  styleOverrides: { content: { paddingLeft: 15 } },
} as CardProps;

export const MinimumTitleBarHeight = Template.bind({});
MinimumTitleBarHeight.args = {
  title: 'Example Card',
  titleSize: 'large',
  height: 450,
  width: 350,
  themeRole: 'primary',
  styleOverrides: { header: { minimumHeight: 150 } },
} as CardProps;

export const StyleOverrides = Template.bind({});
StyleOverrides.args = {
  title: 'Example Card',
  titleSize: 'large',
  height: 450,
  width: 350,
  styleOverrides: {
    border: { style: 'solid', radius: 10, color: blue[600], width: 2 },
    content: { paddingLeft: 15, backgroundColor: blue[100] },
  },
} as CardProps;
