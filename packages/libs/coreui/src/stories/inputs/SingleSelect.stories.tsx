import { Story, Meta } from '@storybook/react/types-6-0';

import SingleSelect, { SingleSelectProps } from '../../components/inputs/SingleSelect';

export default {
    title: 'Inputs/SingleSelect',
    component: SingleSelect
} as Meta;

const Template: Story<SingleSelectProps> = (args) => {
    return (
        <SingleSelect {...args} />
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
} as SingleSelectProps;