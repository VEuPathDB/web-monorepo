import { Story, Meta } from '@storybook/react/types-6-0';

import { gray, mutedGreen, mutedMagenta } from '../../definitions/colors';

import Card, { CardProps } from '../../components/containers/Card';
import { FilledButton } from '../../components/buttons';
import { secondaryFont } from '../../styleDefinitions/typography';
import { UIThemeProvider } from '../../components/theming';

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
      <p css={[{ color: gray[500] }, secondaryFont]}>
        This is an example full-screen modal.
      </p>
      <p css={[{ color: gray[500] }, secondaryFont]}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Mi quis hendrerit
        dolor magna eget est.
      </p>
    </div>
    <FilledButton
      text='Example Button'
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
  height: 450,
  width: 350,
} as CardProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  title: 'Example Card',
  height: 450,
  width: 350,
  themeRole: 'primary',
} as CardProps;

export const ThinMargins = Template.bind({});
ThinMargins.args = {
  title: 'Example Card',
  height: 450,
  width: 350,
  themeRole: 'primary',
  styleOverrides: { content: { paddingLeft: 15 } },
} as CardProps;
