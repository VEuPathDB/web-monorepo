import { Story, Meta } from '@storybook/react/types-6-0';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import MultilineTextField, {
  MultilineTextFieldProps,
} from '../components/forms/MultilineTextField';

export default {
  title: 'Forms/MultilineTextField',
  component: MultilineTextField,
} as Meta;

const Template: Story<MultilineTextFieldProps> = (args) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<MultilineTextFieldProps['status']>(
    undefined
  );

  const debouncedOnValueChange = useCallback(
    debounce((value: string) => {
      setStatus('synced');
    }, 500),
    []
  );

  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
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
    </div>
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
