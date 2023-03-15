import { Story, Meta } from '@storybook/react/types-6-0';
import { useState } from 'react';

import SelectList, { SelectListProps } from '../../components/inputs/SelectList';

export default {
    title: 'Inputs/SelectList',
    component: SelectList
} as Meta;

const Template: Story<SelectListProps<unknown>> = (args) => {
    return (
        <SelectList {...args} />
    )
}

export const Standard = Template.bind({});
Standard.args = {
    items: [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ],
    value: [],
    onChange: (value: string[]) => null,
    defaultButtonDisplayContent: 'Select a letter'
} as SelectListProps<unknown>;

export const ToggleDisabledState: Story<SelectListProps<unknown>> = () => {
    const [ isDisabled, setIsDisabled ] = useState<boolean>(false);

    return (
        <div>
            <label>
                <input type="checkbox" onChange={() => setIsDisabled(!isDisabled)} />
                Disable button
            </label>
            <br /><br />
            <SelectList
                {...Standard.args}
                isDisabled={isDisabled}
            />
        </div>
    )
}