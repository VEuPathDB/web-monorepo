import React from 'react';
import {Link} from 'react-router-dom';
import {RootState} from 'wdk-client/Core/State/Types';
import {User} from 'wdk-client/Utils/WdkUser';
import {connect} from 'react-redux';

interface OwnProps {
  children?: React.ReactChild
}

interface MappedProps {
  user?: User;
}

type Props = OwnProps & MappedProps;

const style: React.CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.35em',
  height: '100%',
  maxHeight: '500px'
}

function LoginRequiredDisclaimer(props: Props) {
  const { user, children } = props;

  if (window == null || user == null) return null;

  if (!user.isGuest) return children;

  const destination = encodeURIComponent(window.location.toString());
  return (
    <div style={style}>
      <h3>It looks like you are not logged in.</h3>
      <p><i className="fa fa-user-o fa-5x"/></p>
      <p>To use this page, please <Link to={`/user/login?destination=${destination}`}>log in</Link> or <Link to={`/user/register`}>register</Link>.</p>
    </div>
  );
}

function mapStateToProps(state: RootState) {
  const { user } = state.globalData;
  return { user }
}

export default connect(mapStateToProps, null)(LoginRequiredDisclaimer as React.ComponentType<Props>);
