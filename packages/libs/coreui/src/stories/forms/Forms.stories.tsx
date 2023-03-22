import { green, purple } from '@material-ui/core/colors';
import { Story, Meta } from '@storybook/react/types-6-0';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import FormField, { FormFieldProps } from '../../components/forms/FormField';
import MultilineTextField, {
  MultilineTextFieldProps,
} from '../../components/forms/MultilineTextField';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { mutedCyan } from '../../definitions/colors';
import { FloatingButton, FilledButton } from '../../components/buttons';
import { Download } from '../../components/icons';

export default {
  title: 'Forms/Example',
} as Meta;

export const Example: Story = (args) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<FormFieldProps['status']>(undefined);

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
      <div css={{ display: 'flex' }}>
        <FormField
          type='text'
          label='Username'
          instructions='Should be an email address'
          placeholder='Username'
          width='200px'
          value={value}
          onValueChange={(value) => {
            setValue(value);
            setStatus('syncing');
            debouncedOnValueChange(value);
          }}
          status={status}
        />
        <FormField
          type='password'
          label='Password'
          width='200px'
          value={value}
          onValueChange={(value) => {
            setValue(value);
            setStatus('syncing');
            debouncedOnValueChange(value);
          }}
          status={status}
          containerStyles={{ paddingLeft: 10 }}
        />
      </div>
      <MultilineTextField
        heading='Tell us about yourself'
        instructions='Blah blah blah'
        height='35vh'
        width='50vw'
        value={value}
        onValueChange={(value) => {
          setValue(value);
          setStatus('syncing');
          debouncedOnValueChange(value);
        }}
        status={status}
        containerStyles={{ marginTop: 5 }}
      />
    </UIThemeProvider>
  );
};
