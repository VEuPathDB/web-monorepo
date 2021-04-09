import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';

import PopoverButton from '../../components/widgets/PopoverButton';

export default {
  title: 'Widgets/PopoverButton',
  component: PopoverButton,
} as Meta;

export const Basic = () => (
  <PopoverButton label={<em>Open for details</em>}>
    <div style={{ padding: '1em' }}>Some details that appear in a popover</div>
  </PopoverButton>
);

export const Selector = () => {
  const [option, setOption] = useState<string | null>(null);
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setOption(event.currentTarget.value);
  };
  const label = option ? `Option ${option} selected` : 'Choose an option';
  return (
    <PopoverButton label={label}>
      <div style={{ padding: '1em' }}>
        {['A', 'B', 'C', 'D', 'E'].map((value) => (
          <div key={value}>
            <label>
              <input
                type="radio"
                value={value}
                checked={option === value}
                onChange={handleChange}
              />{' '}
              Option {value}
            </label>
          </div>
        ))}
      </div>
    </PopoverButton>
  );
};
