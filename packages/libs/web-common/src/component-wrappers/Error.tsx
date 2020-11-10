import { capitalize, groupBy, uniq } from 'lodash';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'wdk-client/Components';
import { Props } from 'wdk-client/Components/PageStatus/Error';
import { UnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';
import { RootState } from 'wdk-client/Core/State/Types';

const borderStyle = '1px solid #00000029';

const style: React.CSSProperties = {
  fontSize: '1.25em',
  padding: '1em 0',
  margin: '2em 0',
  borderTop: borderStyle,
  borderBottom: borderStyle
}

export function Error(DefaultComponent: React.ComponentType<Props>) {
  return function VEuPathError(props: Props) {
    const errors = useSelector((state: RootState) => state.unhandledErrors.errors)
    const errorTypes = uniq(errors.map(e => e.type));
    const groupedErrors = groupBy(errors, 'type');

    const contactUsMessage = errorTypes.map(errorType => {
      const typedErrors: UnhandledError[] | undefined = groupedErrors[errorType];
      if (typedErrors == null) return '';
      return '# ' + capitalize(errorType) +' errors: ' + typedErrors.map(te => te.id).join(', ');
    }).join('\n')

    const contactUsLink = <Link to={`/contact-us?ctx=${encodeURIComponent(contactUsMessage)}`} target="_blank">contact us</Link>;

    return (
      <DefaultComponent message={props.message}>
        {
          props.children || (<>
            <div style={style}>
              <p>Try <a href="" title="Reload the current page.">reloading the page</a>. This frequently resolves the problem.</p>
              <p>If the problem persists, {contactUsLink}.</p>
            </div>
            <div>{props.message}</div>
          </>)
        }
      </DefaultComponent>
    );
  }
};
