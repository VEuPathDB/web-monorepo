import { Story, Meta } from '@storybook/react/types-6-0';
import { OptionsObject, SnackbarMessage } from 'notistack';

import { FilledButton } from '../../components/buttons';

import makeSnackbarProvider from '../../components/notifications/SnackbarProvider';
import useSnackbar from '../../components/notifications/useSnackbar';

const SnackbarProvider = makeSnackbarProvider();

export default {
  title: 'Notifications/Snackbars',
  component: SnackbarProvider
} as Meta;

interface SnackbarStoryArgs {
  message: SnackbarMessage;
  options?: OptionsObject;
}

const Template: Story<SnackbarStoryArgs> = (args) => {
  return (
    <SnackbarProvider styleProps={{}}>
      <SnackbarContainer {...args} />
    </SnackbarProvider>
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
  message: 'This is an "info" snackbar',
  options: undefined,
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
  message: 'This is a "warning" snackbar',
  options: {
    variant: 'warning',
  }
} as SnackbarStoryArgs;
