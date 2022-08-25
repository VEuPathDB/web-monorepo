import { Story, Meta } from '@storybook/react/types-6-0';

import Select, { SelectProps } from '../../components/inputs/Select';

export default {
    title: 'Inputs/Select',
    component: Select
} as Meta;

const Template: Story<SelectProps> = (args) => {
    return (
        <Select {...args} />
    )
}

export const Standard = Template.bind({});
Standard.args = {
    items: [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ],
    value: '',
    onChange: (value: string) => null,
    defaultButtonDisplayContent: 'Select a letter'
} as SelectProps;