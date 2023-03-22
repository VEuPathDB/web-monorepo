import { Story, Meta } from '@storybook/react/types-6-0';
import { useState } from 'react';

import SingleSelect, { SingleSelectProps } from '../../components/inputs/SingleSelect';

export default {
    title: 'Inputs/SingleSelect',
    component: SingleSelect
} as Meta;

export const WithDefaultSelection: Story<SingleSelectProps<unknown>> = () => {
    const options = [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ];
    const [ selectedOption, setSelectedOption ] = useState(options[0].value);
    const buttonDisplayContent = selectedOption.length ? options.find(option => selectedOption === option.value).display : 'Select a letter';

    return (
        <SingleSelect
            items={options}
            value={selectedOption}
            onSelect={setSelectedOption}
            buttonDisplayContent={buttonDisplayContent}
        />
    )
}

export const NoDefaultSelection: Story<SingleSelectProps<unknown>> = () => {
    const options = [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ];
    const [ selectedOption, setSelectedOption ] = useState('');
    const buttonDisplayContent = selectedOption.length ? options.find(option => selectedOption === option.value).display : 'Select a letter';

    return (
        <SingleSelect
            items={options}
            value={selectedOption}
            onSelect={setSelectedOption}
            buttonDisplayContent={buttonDisplayContent}
        />
    )
}

export const ToggleDisabledState: Story<SingleSelectProps<unknown>> = () => {
    const options = [
        {display: 'A for Alligator', value: 'A'},
        {display: 'B for Beluga', value: 'B'},
        {display: 'C for Cow', value: 'C'},
    ];
    const [ selectedOption, setSelectedOption ] = useState('');
    const buttonDisplayContent = selectedOption.length ? options.find(option => selectedOption === option.value).display : 'Select a letter';
    const [ isDisabled, setIsDisabled ] = useState<boolean>(false);

    return (
        <div>
            <label>
                <input type="checkbox" onChange={() => setIsDisabled(!isDisabled)} />
                Disable button
            </label>
            <br /><br />
            <SingleSelect
                items={options}
                value={selectedOption}
                onSelect={setSelectedOption}
                buttonDisplayContent={buttonDisplayContent}
                isDisabled={isDisabled}
            />
        </div>
    )
}