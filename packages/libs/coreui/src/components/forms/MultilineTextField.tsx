import { CSSProperties, useEffect, useRef, useState } from 'react';

// Components
import { H6 } from '../headers';

// Definitions
import { gray, green } from '../../definitions/colors';
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
  /** Optional. Additional CSS styles to apply to the outermost div. */
  containerStyles?: CSSProperties;
};

/**
 * A multiline text field component with optional dynamic resizing,
 * optional character limit, and status indicator.
 * */
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
  containerStyles = {},
}: MultilineTextFieldProps) {
  const [hasFocus, setHasFocus] = useState(false);
  const [scrollBarVisible, setScrollBarVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const virtualHeight = textareaRef.current?.scrollHeight ?? 0;
    const actualHeight = textareaRef.current?.clientHeight ?? 0;
    setScrollBarVisible(virtualHeight > actualHeight);
  }, [textareaRef.current?.scrollHeight, textareaRef.current?.clientHeight]);

  const {
    observe,
    height: currentHeight,
    width: currentWidth,
  } = useDimensions();
  const { observe: headingRef, height: nonInputHeight } = useDimensions({
    useBorderBoxSize: true,
  });

  return (
    <div ref={observe} css={{ width, height, ...containerStyles }}>
      <div ref={headingRef} css={{ marginBottom: 5 }}>
        <H6 text={heading} additionalStyles={{ margin: 0 }} />
        {instructions && (
          <label css={[typography.label, { color: gray[500] }]}>
            {instructions}
          </label>
        )}
      </div>
      <div
        css={{
          position: 'relative',
          outlineColor: 'rgb(170, 170, 170)',
          outlineWidth: hasFocus ? 2 : 1,
          outlineStyle: 'solid',
          color: gray['500'],
          borderRadius: 5,
        }}
      >
        <textarea
          ref={textareaRef}
          maxLength={characterLimit}
          css={[
            typography.p,
            {
              boxSizing: 'border-box',
              borderStyle: 'none',
              outlineStyle: 'none',
              padding: 15,
              paddingBottom: 40,
              resize: 'none',
              width,
              height: currentHeight - nonInputHeight,
              color: gray['400'],
              ':focus': {
                color: gray['500'],
              },
            },
          ]}
          placeholder={placeholder}
          value={value}
          onChange={(event: any) => {
            onValueChange(event.target.value);
          }}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
        />
        <div
          css={{
            boxSizing: 'border-box',
            position: 'absolute',
            bottom: 0,
            width: scrollBarVisible ? currentWidth - 15 : currentWidth,
            height: 30,
            borderRadius: 5,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 15,
            paddingRight: 10,
          }}
        >
          {characterLimit && currentHeight && (
            <p css={[typography.metaData]}>
              {`${value.length} / ${characterLimit}`}
            </p>
          )}
          <div css={{ paddingTop: 3 }}>
            {status === 'syncing' && (
              <Loading
                fontSize={20}
                fill={gray[400]}
                css={{
                  animation: `${spin} 2s ease infinite, ${fadeIn} 1s linear`,
                }}
              />
            )}
            {status === 'synced' && (
              <CheckCircle
                fontSize={20}
                fill={green[500]}
                css={{ animation: `${fadeIn} 1s linear` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
