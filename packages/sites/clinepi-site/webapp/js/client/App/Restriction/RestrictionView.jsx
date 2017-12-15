import React from 'react';
import './Restriction.scss';
import { withStore } from 'ebrc-client/util/component';
import { IconAlt as Icon } from 'wdk-client/Components';
import { getRestriction } from './RestrictionUtils';

class RestrictionView extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    withStore(store => console.log({ store }));
    const { render } = this.props;
    const restriction = getRestriction();
    return !restriction
      ? render()
      : (
        <div className="RestrictionView">
          <div className="RestrictionView-Body">
            <Icon fa="ban RestrictionView-Icon" />
            <h1>Restricted</h1>
            <div className="RestrictionView-Message">
              {restriction}
            </div>
          </div>
        </div>
      );
  }
};

export default RestrictionView;
