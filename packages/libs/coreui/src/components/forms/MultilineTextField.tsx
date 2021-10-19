// Components
import { H6 } from '../headers';

// Definitions
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import typography from '../../styleDefinitions/typography';
import useDimensions from 'react-cool-dimensions';
import { useState } from 'react';

export type MultilineTextFieldProps = {
  heading: string;
  instructions?: string;
  placeholder?: string;
  width: string | number;
  height: string | number;
  characterLimit?: number;
  onValueChange: (value: string) => void;
};

export default function MultilineTextField({
  heading,
  instructions,
  placeholder,
  width,
  height,
  characterLimit,
}: MultilineTextFieldProps) {
  const [value, setValue] = useState('');

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  const {
    observe,
    width: currentWidth,
    height: currentHeight,
  } = useDimensions();

  return (
    <div>
      <div css={{ marginBottom: 5 }}>
        <H6 text={heading} additionalStyles={{ marginBottom: 0 }} />
        {instructions && (
          <label css={[typography.label, { color: DARK_GRAY }]}>
            {instructions}
          </label>
        )}
      </div>
      <div css={{ position: 'relative' }}>
        <textarea
          ref={observe}
          maxLength={characterLimit}
          css={[
            typography.p,
            {
              boxSizing: 'border-box',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'rgb(170, 170, 170)',
              borderRadius: 5,
              padding: 15,
              paddingBottom: 35,
              resize: 'none',
              width,
              height,
              color: MEDIUM_GRAY,
              ':focus': {
                outlineColor: 'rgb(170, 170, 170)',
                outlineWidth: 1,
                outlineStyle: 'solid',
                color: DARK_GRAY,
              },
            },
          ]}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        {characterLimit && currentHeight && (
          <p
            css={[
              typography.metaData,
              { position: 'absolute', top: currentHeight + 20, left: 15 },
            ]}
          >
            {`${value.length} / ${characterLimit}`}
          </p>
        )}
      </div>
    </div>
  );
}
