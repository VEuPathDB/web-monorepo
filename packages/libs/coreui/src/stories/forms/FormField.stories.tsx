import { Story, Meta } from '@storybook/react/types-6-0';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import FormField, { FormFieldProps } from '../../components/forms/FormField';
import UIThemeProvider from '../../components/theming/UIThemeProvider';
import { mutedCyan, purple } from '../../definitions/colors';

export default {
  title: 'Forms/FormField',
  component: FormField,
} as Meta;

const Template: Story<FormFieldProps> = (args) => {
  const [value, setValue] = useState(args.value);
  const [status, setStatus] = useState<FormFieldProps['status']>(args.status);

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
      <FormField
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
export const TextField = Template.bind({});
TextField.args = {
  type: 'text',
  label: 'Example TextField',
  instructions: 'These are example instructions. ',
  width: '50vw',
  placeholder: 'Example Placeholder',
};

export const PasswordField = Template.bind({});
PasswordField.args = {
  ...TextField.args,
  type: 'password',
  label: 'Example Password Field',
  instructions: 'Passwords must contain one MILLION characters.',
};

export const InputDisabled = Template.bind({});
InputDisabled.args = {
  type: 'text',
  width: '50vw',
  value: 'www.exampleurl.com',
  disabled: true,
  label: 'Public Analysis URL',
};
