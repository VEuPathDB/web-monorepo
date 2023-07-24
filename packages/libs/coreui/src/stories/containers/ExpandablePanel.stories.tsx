import { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import {
  gray,
  mutedGreen,
  mutedMagenta,
  orange,
} from '../../definitions/colors';

import ExpandablePanel, {
  ExpandablePanelProps,
} from '../../components/containers/ExpandablePanel';
import { FilledButton } from '../../components/buttons';
import typography, { secondaryFont } from '../../styleDefinitions/typography';
import { UIThemeProvider } from '../../components/theming';
import { purple } from '@material-ui/core/colors';
import { H6 } from '../../components/typography';

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
      text="Example Button"
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
export const DefaultPreset = Template.bind({});
DefaultPreset.args = {
  title: 'Expandable Panel w/ Default Style Preset',
  state: 'closed',
  stylePreset: 'default',
  children: <ModalContent />,
  styleOverrides: { container: { maxWidth: '70%' } },
} as ExpandablePanelProps;

export const SimpleSubtitle = Template.bind({});
SimpleSubtitle.args = {
  title: 'Expandable Panel w/ Simple Subtitle',
  subTitle: 'Here is a simple subtitle',
  state: 'closed',
  stylePreset: 'default',
  children: <ModalContent />,
  styleOverrides: { container: { maxWidth: '70%' } },
} as ExpandablePanelProps;

export const ComplexSubtitle = Template.bind({});
ComplexSubtitle.args = {
  title: 'Expandable Panel w/ Simple Subtitle',
  subTitle: {
    description: 'Updated file x to account for bug y.',
    date: '2021-11-01',
  },
  state: 'closed',
  stylePreset: 'default',
  children: <ModalContent />,
  styleOverrides: { container: { maxWidth: '70%' } },
} as ExpandablePanelProps;

export const ThemedDefaultPreset = Template.bind({});
ThemedDefaultPreset.args = {
  ...DefaultPreset.args,
  title: 'Themed Expandable Panel',
  themeRole: 'primary',
  children: <ModalContent themeRole="primary" />,
} as ExpandablePanelProps;

export const StyleOverrides: Story<ExpandablePanelProps> = (args) => {
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
      <ExpandablePanel {...args} state={panelState}></ExpandablePanel>
    </UIThemeProvider>
  );
};

StyleOverrides.args = {
  ...DefaultPreset.args,
  title: 'Supports Style Overrides',
  children: (
    <div css={{ padding: 15 }}>
      <H6
        text="You can change many aspects of the component's style:"
        additionalStyles={{ margin: 0 }}
        color={orange[100]}
      />
      <ul css={[typography.p, { color: orange[100], fontSize: 13 }]}>
        <li>
          General outer container attributes (generally used for positioning)
        </li>
        <li>Border attributes</li>
        <li>Background color</li>
        <li>Icon and text colors</li>
        <li>
          Most importantly, you can provide these overrides on a per state
          (closed, focused, open) basis.
        </li>
      </ul>
    </div>
  ),
  styleOverrides: {
    container: { maxWidth: '70%' },
    closed: {
      header: {
        backgroundColor: purple[100],
        iconColor: orange[600],
        textColor: orange[600],
      },
      border: {
        color: purple[200],
        radius: 5,
        width: 2,
      },
    },
    focused: {
      header: {
        backgroundColor: purple[600],
        iconColor: orange[300],
        textColor: orange[300],
      },
      border: {
        color: orange[300],
        radius: 5,
        width: 5,
      },
    },
    open: {
      header: {
        backgroundColor: purple[800],
        iconColor: orange[300],
        textColor: orange[300],
      },
      border: {
        color: orange[300],
        radius: 5,
        width: 5,
      },
      content: {
        backgroundColor: purple[600],
        divider: { color: orange[300], thickness: 5 },
      },
    },
  },
} as ExpandablePanelProps;

export const FloatingStylePreset = Template.bind({});
FloatingStylePreset.args = {
  ...DefaultPreset.args,
  title: 'Expandable Panel w/ Floating Style Preset',
  stylePreset: 'floating',
} as ExpandablePanelProps;
