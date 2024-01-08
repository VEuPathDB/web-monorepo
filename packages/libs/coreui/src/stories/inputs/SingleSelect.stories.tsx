import { Story, Meta } from '@storybook/react/types-6-0';
import React, { useState } from 'react';

import SingleSelect, {
  SingleSelectProps,
} from '../../components/inputs/SingleSelect';
import { chunk, range } from 'lodash';

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
  const options = chunk(range(1, 100), 4).map((group, index) => ({
    label: 'Group ' + index,
    items: group.map((num) => ({
      display: 'Number ' + num.toLocaleString(),
      value: num,
    })),
  }));
  const [selectedOption, setSelectedOption] = useState<number>();
  const buttonDisplayContent = selectedOption
    ? options
        .flatMap((option) => option.items)
        .find((option) => selectedOption === option.value)?.display
    : 'Select a number';

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
