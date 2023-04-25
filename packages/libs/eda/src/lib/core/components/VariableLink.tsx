/*
 * Link to the page for a variable
 */
import { forwardRef, Ref } from 'react';
import { Link, LinkProps } from 'react-router-dom';

const disabledStyle: React.CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.5,
};

export type VariableValue = {
  entityId?: string;
  variableId?: string;
};

export type VariableLinkConfig =
  | {
      type: 'link';
      makeVariableLink: (value?: VariableValue) => string;
    }
  | {
      type: 'button';
      onClick: (value?: VariableValue) => void;
    };

export interface Props<S = unknown> extends Omit<LinkProps<S>, 'to'> {
  entityId?: string;
  variableId?: string;
  linkConfig: VariableLinkConfig;
  disabled?: boolean;
}

export const VariableLink = forwardRef(
  (props: Props, ref: Ref<HTMLAnchorElement>) => {
    const { entityId, disabled, variableId, linkConfig, style, ...rest } =
      props;
    const value = { entityId, variableId };
    const finalStyle = disabled ? { ...style, ...disabledStyle } : style;

    return linkConfig.type === 'link' ? (
      <Link
        ref={ref}
        aria-disabled={disabled}
        replace
        style={finalStyle}
        {...rest}
        to={{
          pathname: linkConfig.makeVariableLink(value),
          state: { scrollToTop: false },
        }}
        onClick={(event) => {
          if (disabled) {
            event.stopPropagation();
            event.preventDefault();
          } else {
            rest.onClick?.(event);
          }
        }}
      />
    ) : (
      // Typically, we would just use a <button> for this case,
      // but this needs to work in an SVG fragment, which does
      // not support <button>, so this is a compromise
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a
        ref={ref}
        aria-disabled={disabled}
        role="button"
        tabIndex={0}
        style={finalStyle}
        onKeyDown={(event) => {
          event.preventDefault();
          if (disabled) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            linkConfig.onClick(value);
          }
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          linkConfig.onClick(value);
        }}
        {...rest}
      />
    );
  }
);
