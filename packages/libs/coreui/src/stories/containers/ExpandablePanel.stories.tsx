import { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import { gray, mutedGreen, mutedMagenta } from '../../definitions/colors';

import ExpandablePanel, {
  ExpandablePanelProps,
} from '../../components/containers/ExpandablePanel';
import { FilledButton } from '../../components/buttons';
import { secondaryFont } from '../../styleDefinitions/typography';
import { UIThemeProvider } from '../../components/theming';

const ModalContent = ({
  themeRole,
}: {
  themeRole?: 'primary' | 'secondary';
}) => (
  <div
    css={{
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 15,
      paddingTop: 5,
    }}
  >
    <div>
      <p css={[{ color: gray[600], fontWeight: 'bold' }, secondaryFont]}>
        Component Features
      </p>

      <ul>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Distinct UI for closed, focused, and open.
        </li>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Subtle animation effects to highlight state changes.
        </li>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Keyboard (Tab, Space/Enter) and Mouse/Touch Navigation
        </li>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Accessibility Support
        </li>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Can control open/closed state programmatically.
        </li>
        <li css={[{ color: gray[600] }, secondaryFont]}>
          Can override many styling aspects for special cases.
        </li>
      </ul>
    </div>
    <FilledButton
      text='Example Button'
      onPress={() => null}
      themeRole={themeRole}
    />
  </div>
);

export default {
  title: 'Containers/ExpandablePanel',
  component: ExpandablePanel,
} as Meta;

const Template: Story<ExpandablePanelProps> = (args) => {
  const [panelState, setPanelState] = useState<ExpandablePanelProps['state']>(
    args.state
  );

  useEffect(() => {
    setPanelState(args.state);
  }, [args.state]);

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedGreen, level: 500 },
          secondary: { hue: mutedMagenta, level: 500 },
        },
      }}
    >
      <ExpandablePanel {...args} state={panelState}>
        <ModalContent themeRole={args.themeRole} />
      </ExpandablePanel>
    </UIThemeProvider>
  );
};
export const Basic = Template.bind({});
Basic.args = {
  title: 'Expandable Panel',
  state: 'closed',
  children: <ModalContent />,
  styleOverrides: { container: { maxWidth: '70%' } },
} as ExpandablePanelProps;

export const UseTheme = Template.bind({});
UseTheme.args = {
  title: 'Themed Expandable Panel',
  state: 'closed',
  themeRole: 'primary',
  children: <ModalContent themeRole='primary' />,
} as ExpandablePanelProps;
