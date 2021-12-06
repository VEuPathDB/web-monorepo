import { green, purple } from '@material-ui/core/colors';
import { Story, Meta } from '@storybook/react/types-6-0';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import TextField, { TextFieldProps } from '../../components/forms/TextField';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { mutedCyan } from '../../definitions/colors';

export default {
  title: 'Forms/TextField',
  component: TextField,
} as Meta;

const Template: Story<TextFieldProps> = (args) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<TextFieldProps['status']>(undefined);

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
      <TextField
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
  placeholder: 'Example Placeholder',
};
