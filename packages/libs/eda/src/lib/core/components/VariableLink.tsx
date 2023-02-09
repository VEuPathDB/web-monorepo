/*
 * Link to the page for a variable
 */
import { forwardRef, Ref } from 'react';
import { Link, LinkProps } from 'react-router-dom';

type VariableValue = {
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
}

export const VariableLink = forwardRef(
  (props: Props, ref: Ref<HTMLAnchorElement>) => {
    const { entityId, variableId, linkConfig, ...rest } = props;
    const value = { entityId, variableId };

    return linkConfig.type === 'link' ? (
      <Link
        replace
        {...rest}
        to={{
          pathname: linkConfig.makeVariableLink(value),
          state: { scrollToTop: false },
        }}
      />
    ) : (
      // Typically, we would just use a <button> for this case,
      // but this needs to work in an SVG fragment, which does
      // not support <button>, so this is a compromise
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a
        ref={ref}
        role="button"
        aria-pressed="false"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            linkConfig.onClick(value);
          }
        }}
        onClick={(event) => {
          event.preventDefault();
          linkConfig.onClick(value);
        }}
        {...rest}
      />
    );
  }
);
