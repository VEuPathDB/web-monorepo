import React from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

type StateProps = {};

type DispatchProps = {};

type OwnProps = {
  targetType: string,
  targetId: string
};

type Props = StateProps & DispatchProps & OwnProps;

class UserCommentShowController extends PageController<Props> {
  renderView() {
    return <div>User Comment Show</div>;
  }
}

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps, 
  mapDispatchToProps
)(
  wrappable(UserCommentShowController)
);
