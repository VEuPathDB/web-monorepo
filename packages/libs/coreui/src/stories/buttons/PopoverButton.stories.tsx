import { Story, Meta } from '@storybook/react/types-6-0';
import { useState } from 'react';
import { FilledButton } from '../../components/buttons';
import PopoverButton, {
  PopoverButtonProps,
} from '../../components/buttons/PopoverButton/PopoverButton';
import { gray } from '../../definitions/colors';

export default {
  title: 'Controls/Buttons/PopoverButton',
  component: PopoverButton,
} as Meta;

export const Default: Story<PopoverButtonProps> = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  return (
    <>
      <h4>
        This story simply demos the look of the PopoverButton, not the dropdown
        functionality.
      </h4>
      <div style={{ marginTop: 15, marginBottom: 15 }}>
        <input
          type={'checkbox'}
          onChange={() => setIsDisabled(!isDisabled)}
          checked={isDisabled}
        />
        <span>Disable button</span>
      </div>
      <PopoverButton buttonDisplayContent="Click me" isDisabled={isDisabled}>
        <></>
      </PopoverButton>
    </>
  );
};

export const NextToOtherButton: Story<PopoverButtonProps> = () => {
  return (
    <>
      <h4>Demos PopoverButton inline w/ another CoreUI button</h4>
      <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
        <PopoverButton buttonDisplayContent="Popover Button">
          <></>
        </PopoverButton>
        <FilledButton
          text="Filled Button"
          onPress={() => null}
          textTransform="none"
        />
      </div>
    </>
  );
};

export const LikeMesaOrLikeMUI: Story<PopoverButtonProps> = () => {
  return (
    <>
      <h4>Testing PopoverButton&apos;s CoreUI makeover</h4>
      <div style={{ marginTop: 15, display: 'flex', gap: 30 }}>
        <PopoverButton
          buttonDisplayContent="Styled like CoreUI Mesa Button"
          styleOverrides={{
            default: {
              dropShadow: {
                color: gray[500],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '3px',
              },
            },
            hover: {
              dropShadow: {
                color: gray[700],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
              },
            },
            pressed: {
              color: gray[400],
              dropShadow: {
                color: gray[700],
                blurRadius: '0px',
                offsetX: '0px',
                offsetY: '4px',
              },
            },
          }}
        >
          <></>
        </PopoverButton>
        <PopoverButton buttonDisplayContent="Styled like Existing MUI">
          <></>
        </PopoverButton>
      </div>
    </>
  );
};
