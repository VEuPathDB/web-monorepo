import React from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../../Core/State/Types';
import { User } from '../../Utils/WdkUser';
import { connect } from 'react-redux';

interface OwnProps {
  toDoWhatMessage?: string;
  extraParagraphContent?: JSX.Element;
  children?: React.ReactChild;
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
  maxHeight: '500px',
};

function LoginRequiredDisclaimer(props: Props) {
  const { user, toDoWhatMessage, extraParagraphContent, children } = props;

  if (window == null || user == null) return null;

  if (!user.isGuest) return children;

  const destination = encodeURIComponent(window.location.toString());
  return (
    <div style={style}>
      <h3>It looks like you are not logged in.</h3>
      <p>
        <i className="fa fa-user-o fa-5x" />
      </p>
      <p>
        {toDoWhatMessage || 'To use this page'}, please{' '}
        <Link to={`/user/login?destination=${destination}`}>log in</Link> or{' '}
        <Link to={`/user/registration`}>register</Link>.
      </p>
      {extraParagraphContent}
    </div>
  );
}

function mapStateToProps(state: RootState) {
  const { user } = state.globalData;
  return { user };
}

export default connect(
  mapStateToProps,
  null
)(LoginRequiredDisclaimer as React.ComponentType<Props>);
