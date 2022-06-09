import { Story, Meta } from '@storybook/react/types-6-0';
import { OptionsObject, SnackbarMessage } from 'notistack';

import { FilledButton } from '../../components/buttons';
import { UIThemeProvider } from '../../components/theming';
import makeSnackbarProvider, { SnackbarStyleProps } from '../../components/notifications/SnackbarProvider';
import useSnackbar from '../../components/notifications/useSnackbar';
import { mutedCyan, purple } from '../../definitions/colors';

const SnackbarProvider = makeSnackbarProvider({
  anchorOriginBottomLeft: ({ nudge }: SnackbarStyleProps<{ nudge?: boolean }>) =>
    nudge
      ? {
          transform: 'translateX(100px)'
        }
      : undefined
});

export default {
  title: 'Notifications/Snackbars',
  component: SnackbarProvider
} as Meta;

interface SnackbarStoryArgs {
  message: SnackbarMessage;
  options?: OptionsObject;
  nudge?: boolean
}

const Template: Story<SnackbarStoryArgs> = (args) => {
  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedCyan, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <SnackbarProvider styleProps={{ nudge: args.nudge }}>
        <SnackbarContainer {...args} />
      </SnackbarProvider>
    </UIThemeProvider>
  );
}

function SnackbarContainer(props: SnackbarStoryArgs) {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <FilledButton
      text="Open Snackbar"
      onPress={() => {
        enqueueSnackbar(
          props.message,
          props.options
        );
      }}
    />
  );
}

export const Success = Template.bind({});
Success.args = {
  message: 'This is a persisted "success" snackbar',
  options: {
    variant: 'success',
    persist: true,
  }
} as SnackbarStoryArgs;

export const Info = Template.bind({});
Info.args = {
  message: 'This is an "info" snackbar. Its styling is derived from the CoreUI theme.',
  options: undefined
} as SnackbarStoryArgs;

export const Error = Template.bind({});
Error.args = {
  message: 'This is an "error" snackbar',
  options: {
    variant: 'error',
  }
} as SnackbarStoryArgs;

export const Warning = Template.bind({});
Warning.args = {
  message: 'This is a "warning" snackbar. Becase a styleProp of "nudge: true" was passed, its position was slightly adjusted.',
  options: {
    variant: 'warning',
  },
  nudge: true
} as SnackbarStoryArgs;
