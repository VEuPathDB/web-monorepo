// TODO: Redefine Loading in terms of this more general component
import 'spin.js/spin.css';
import './Spinnable.scss';
import { flow } from 'lodash';
import React from 'react';
import { Spinner, SpinnerOptions } from 'spin.js';
import { delay, wrappable } from '../../../../Utils/ComponentUtils';

type Props = {
  /** Additional class name to use for container element */
  className?: string;

  /** Additional styles to use for container element */
  style?: React.CSSProperties;

  /** spin.js options to use for container element */
  spinnerOptions?: SpinnerOptions;
}


/**
 * See http://fgnass.github.io/spin.js/
 */
class Spinnable extends React.Component<Props> {

  static defaultProps = {
    className: '',
    spinnerOptions: {},
    style: {}
  };

  private spinner?: Spinner;
  private containerRef: React.RefObject<HTMLDivElement> = React.createRef();

  componentDidMount() {
    const { spinnerOptions } = this.props;

    this.spinner = new Spinner(spinnerOptions).spin(this.containerRef.current || undefined);
  }

  componentWillUnmount() {
    if (this.spinner) this.spinner.stop();
  }

  render() {
    const { children, className, style } = this.props;
    return (
      <div ref={this.containerRef} className={className} style={style}>
        {children}
      </div>
    );
  }

}

const enhance = flow(delay<Props>(200), wrappable);

export default enhance(Spinnable);
