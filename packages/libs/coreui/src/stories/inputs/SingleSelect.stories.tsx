import { Story, Meta } from '@storybook/react/types-6-0';
import { uniqueId } from 'lodash';
import { useState, useMemo } from 'react';

import SingleSelect, { SingleSelectProps } from '../../components/inputs/SingleSelect';

export default {
    title: 'Inputs/SingleSelect',
    component: SingleSelect
} as Meta;

export const WithDefaultSelection: Story<SingleSelectProps> = (args) => {
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

export const NoDefaultSelection: Story<SingleSelectProps> = (args) => {
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