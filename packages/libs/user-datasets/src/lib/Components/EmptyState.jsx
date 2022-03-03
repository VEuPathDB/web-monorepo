import React from 'react';
import { IconAlt as Icon } from '@veupathdb/wdk-client/lib/Components';

class UserDatasetEmptyState extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { message } = this.props;
    return (
      <div className="UserDatasetList-EmptyState">
        <Icon fa="table" className="EmptyState-Icon" />
        {typeof message === 'string'
          ? <p>{message}</p>
          : message
        }
      </div>
    );
  }
};

export default UserDatasetEmptyState;
