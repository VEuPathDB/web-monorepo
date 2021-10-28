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
  /** Optional. Placeholder text to display in the field if there is no value.*/
  placeholder?: string;
  /** The current value of the text field. */
  value: string;
  /** A callback to invoke when the value of the input field changes. */
  onValueChange: (value: string) => void;
  /** The desired width of the component. */
  width: string | number;
  /** The desired height of the component. */
  height: string | number;
  /** Optional. A character limit. */
  characterLimit?: number;
  /** Optional. Indicates the status of data syncing. */
  status?: 'syncing' | 'synced';
};

export default function MultilineTextField({
  heading,
  instructions,
  placeholder,
  width,
  height,
  characterLimit,
  value,
  onValueChange,
  status,
}: MultilineTextFieldProps) {
  const { observe, height: currentHeight } = useDimensions();
  const { observe: headingRef, height: nonInputHeight } = useDimensions();

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
            onValueChange(event.target.value);
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
          {status === 'syncing' && (
            <Loading
              fontSize={20}
              fill={MEDIUM_GRAY}
              css={{
                animation: `${spin} 2s ease infinite, ${fadeIn} 1s linear`,
              }}
            />
          )}
          {status === 'synced' && (
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
