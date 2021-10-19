import { Story, Meta } from '@storybook/react/types-6-0';

import MultilineTextField, {
  MultilineTextFieldProps,
} from '../components/forms/MultilineTextField';

export default {
  title: 'Forms/MultilineTextField',
  component: MultilineTextField,
} as Meta;

const Template: Story<MultilineTextFieldProps> = (args) => (
  <MultilineTextField {...args} />
);
export const Default = Template.bind({});
Default.args = {
  heading: 'Example Heading',
  instructions: 'These are example instructions. ',
  width: '50vw',
  height: '50vh',
  placeholder: 'Example Placeholder',
  characterLimit: 500,
  onValueChange: (value) => console.log(value),
};
