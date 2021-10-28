import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

// Components
import { H6 } from '../headers';

// Definitions
import { DARK_GRAY, LIGHT_GREEN, MEDIUM_GRAY } from '../../constants/colors';
import typography from '../../styleDefinitions/typography';
import useDimensions from 'react-cool-dimensions';
import { CheckCircle, Loading } from '../icons';
import { fadeIn, spin } from '../../definitions/animations';

export type MultilineTextFieldProps = {
  /** A heading for the component. */
  heading: string;
  /** Optional. Additional instructions to be displayed below the heading. */
  instructions?: string;
  /** Optional. Placeholder text to display in the field. */
  placeholder?: string;
  /** The desired width of the component. */
  width: string | number;
  /** The desired height of the component. */
  height: string | number;
  /** Optional. A character limit. */
  characterLimit?: number;
  /**
   * A callback to invoke when the value of the input field changes.
   * Note that internally, calls to this function are debounced to
   * avoid spamming upstream components and potentially APIs.
   */
  onValueChange: (value: string) => void;
};

export default function MultilineTextField({
  heading,
  instructions,
  placeholder,
  width,
  height,
  characterLimit,
  onValueChange,
}: MultilineTextFieldProps) {
  const [value, setValue] = useState('');
  const [syncPending, setSyncPending] = useState(false);

  const debouncedOnValueChange = useCallback(
    debounce((value: string) => {
      onValueChange(value);
      setSyncPending(false);
    }, 500),
    []
  );

  useEffect(() => {
    setSyncPending(true);
    debouncedOnValueChange(value);
  }, [value]);

  const {
    observe,
    width: currentWidth,
    height: currentHeight,
  } = useDimensions();

  const {
    observe: headingRef,
    width: nonInputWidth,
    height: nonInputHeight,
  } = useDimensions();

  return (
    <div ref={observe} css={{ width, height }}>
      <div ref={headingRef} css={{ marginBottom: 5 }}>
        <H6 text={heading} additionalStyles={{ marginBottom: 0 }} />
        {instructions && (
          <label css={[typography.label, { color: DARK_GRAY }]}>
            {instructions}
          </label>
        )}
      </div>
      <div css={{ position: 'relative' }}>
        <textarea
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
              height: currentHeight - nonInputHeight,
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
          onChange={(event: any) => {
            setValue(event.target.value);
          }}
        />
        {characterLimit && currentHeight && (
          <p
            css={[
              typography.metaData,
              {
                position: 'absolute',
                top: currentHeight - nonInputHeight - 35,
                left: 15,
              },
            ]}
          >
            {`${value.length} / ${characterLimit}`}
          </p>
        )}
        <div
          css={{
            position: 'absolute',
            top: currentHeight - nonInputHeight - 30,
            right: 10,
          }}
        >
          {syncPending ? (
            <Loading
              fontSize={20}
              fill={MEDIUM_GRAY}
              css={{
                animation: `${spin} 2s ease infinite, ${fadeIn} 1s linear`,
              }}
            />
          ) : (
            <CheckCircle
              fontSize={20}
              fill={LIGHT_GREEN}
              css={{ animation: `${fadeIn} 1s linear` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
