import 'spin.js/spin.css';
import './Spinnable.scss';
import { flow } from 'lodash';
import React from 'react';
import { Spinner, SpinnerOptions } from 'spin.js';
import { delay, wrappable } from '../../Utils/ComponentUtils';

type Props = {
  /** Additional class name to use for container element */
  className?: string;

  /** Additional styles to use for container element */
  style?: React.CSSProperties;

  /** spin.js options to use for container element */
  spinnerOptions?: SpinnerOptions;

  /** Whether or not the element is spinning */
  spinning: boolean;
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

  private updateSpinner(spinning: boolean, newSpinnerOptions?: SpinnerOptions) {
    if (!this.spinner || this.props.spinnerOptions !== newSpinnerOptions) {
      this.spinner = new Spinner(newSpinnerOptions);
    }

    if (spinning) {
      this.spinner.spin(this.containerRef.current || undefined);
    } else {
      this.spinner.stop();
    }
  }

  componentDidMount() {
    const { spinning, spinnerOptions } = this.props;
    this.updateSpinner(spinning, spinnerOptions);
  }

  componentWillReceiveProps({ spinning, spinnerOptions }: Props) {
    this.updateSpinner(spinning, spinnerOptions);
  }

  componentWillUnmount() {
    if (this.spinner) {
      this.spinner.stop();
    }
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
