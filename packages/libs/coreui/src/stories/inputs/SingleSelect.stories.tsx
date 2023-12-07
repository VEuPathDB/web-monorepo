import { Story, Meta } from '@storybook/react/types-6-0';
import React, { useState } from 'react';

import SingleSelect, {
  SingleSelectProps,
} from '../../components/inputs/SingleSelect';

export default {
  title: 'Inputs/SingleSelect',
  component: SingleSelect,
} as Meta;

export const WithDefaultSelection: Story<SingleSelectProps<unknown>> = () => {
  const options = [
    { display: 'A for Alligator', value: 'A' },
    { display: 'B for Beluga', value: 'B' },
    { display: 'C for Cow', value: 'C' },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0].value);
  const buttonDisplayContent = selectedOption.length
    ? options.find((option) => selectedOption === option.value).display
    : 'Select a letter';

  return (
    <SingleSelect
      items={options}
      value={selectedOption}
      onSelect={setSelectedOption}
      buttonDisplayContent={buttonDisplayContent}
    />
  );
};

export const NoDefaultSelection: Story<SingleSelectProps<unknown>> = () => {
  const options = [
    { display: 'A for Alligator', value: 'A' },
    { display: 'B for Beluga', value: 'B' },
    { display: 'C for Cow', value: 'C' },
  ];
  const [selectedOption, setSelectedOption] = useState('');
  const buttonDisplayContent = selectedOption.length
    ? options.find((option) => selectedOption === option.value).display
    : 'Select a letter';

  return (
    <SingleSelect
      items={options}
      value={selectedOption}
      onSelect={setSelectedOption}
      buttonDisplayContent={buttonDisplayContent}
    />
  );
};

export const ToggleDisabledState: Story<SingleSelectProps<unknown>> = () => {
  const options = [
    { display: 'A for Alligator', value: 'A' },
    { display: 'B for Beluga', value: 'B' },
    { display: 'C for Cow', value: 'C' },
  ];
  const [selectedOption, setSelectedOption] = useState('');
  const buttonDisplayContent = selectedOption.length
    ? options.find((option) => selectedOption === option.value).display
    : 'Select a letter';
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  return (
    <div>
      <label>
        <input type="checkbox" onChange={() => setIsDisabled(!isDisabled)} />
        Disable button
      </label>
      <br />
      <br />
      <SingleSelect
        items={options}
        value={selectedOption}
        onSelect={setSelectedOption}
        buttonDisplayContent={buttonDisplayContent}
        isDisabled={isDisabled}
      />
    </div>
  );
};

export const SingleSelectWithGroups: Story<SingleSelectProps<unknown>> = () => {
  const options = [
    {
      label: 'Group 1',
      items: [
        { display: 'A for Alligator', value: 'A' },
        { display: 'B for Beluga', value: 'B' },
        { display: 'C for Cow', value: 'C' },
      ],
    },
    {
      label: 'Group 2',
      items: [
        { display: 'D is for Dog', value: 'D' },
        { display: 'E is for Elephant', value: 'E' },
        { display: 'F is for Fox', value: 'F' },
      ],
    },
  ];
  const [selectedOption, setSelectedOption] = useState('');
  const buttonDisplayContent = selectedOption.length
    ? options
        .flatMap((option) => option.items)
        .find((option) => selectedOption === option.value).display
    : 'Select a letter';

  return (
    <div>
      <SingleSelect
        items={options}
        value={selectedOption}
        onSelect={setSelectedOption}
        buttonDisplayContent={buttonDisplayContent}
      />
    </div>
  );
};
