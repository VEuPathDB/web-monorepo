import { green, purple } from '@material-ui/core/colors';
import { Story, Meta } from '@storybook/react/types-6-0';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import MultilineTextField, {
  MultilineTextFieldProps,
} from '../../components/forms/MultilineTextField';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { mutedCyan } from '../../definitions/colors';

export default {
  title: 'Forms/MultilineTextField',
  component: MultilineTextField,
} as Meta;

const Template: Story<MultilineTextFieldProps> = (args) => {
  const [value, setValue] = useState('');
  const [status, setStatus] =
    useState<MultilineTextFieldProps['status']>(undefined);

  const debouncedOnValueChange = useCallback(
    debounce((value: string) => {
      setStatus('synced');
    }, 500),
    []
  );

  return (
    <UIThemeProvider
      theme={{
        palette: {
          primary: { hue: mutedCyan, level: 600 },
          secondary: { hue: purple, level: 500 },
        },
      }}
    >
      <MultilineTextField
        {...args}
        value={value}
        onValueChange={(value) => {
          setValue(value);
          setStatus('syncing');
          debouncedOnValueChange(value);
        }}
        status={status}
      />
    </UIThemeProvider>
  );
};
export const Default = Template.bind({});
Default.args = {
  heading: 'Example Heading',
  instructions: 'These are example instructions. ',
  width: '50vw',
  height: '50vh',
  placeholder: 'Example Placeholder',
  characterLimit: 500,
};
export const NoLimit = Template.bind({});
NoLimit.args = {
  heading: 'Example Heading',
  instructions: 'These are example instructions. ',
  width: '50vw',
  height: '50vh',
  placeholder: 'Testing no character limit',
};
