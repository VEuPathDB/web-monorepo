import { useRef } from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const cx = makeClassNameHelper('CreateVariables');

interface InlineNameProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name of the text input. */
  inputLabel: string;
  /** aria-label of the pencil button; also its title unless pencilTitle is given. */
  pencilLabel: string;
  pencilTitle?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** 'title' renders larger, as the editor's heading. */
  size?: 'normal' | 'title';
}

/**
 * An editable name that reads as text, with a pencil, and shows its box only
 * on hover or focus. Edits are reported as they are typed.
 */
export function InlineName({
  value,
  onChange,
  inputLabel,
  pencilLabel,
  pencilTitle = pencilLabel,
  placeholder,
  disabled,
  autoFocus,
  size = 'normal',
}: InlineNameProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <span className={cx('-InlineName', size === 'title' ? 'title' : '')}>
      <input
        ref={input}
        className={cx('-InlineNameInput')}
        type="text"
        aria-label={inputLabel}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        // Titles grow with their content.
        size={
          size === 'title'
            ? Math.max(value.length, placeholder?.length ?? 0, 12)
            : undefined
        }
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={cx('-InlineNamePencil')}
        aria-label={pencilLabel}
        title={pencilTitle}
        disabled={disabled}
        onClick={() => {
          input.current?.focus();
          input.current?.select();
        }}
      >
        <Icon fa="pencil" />
      </button>
    </span>
  );
}
