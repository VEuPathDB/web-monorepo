import React from 'react';
import { connect } from 'react-redux';
import { UserSessionActions } from '@veupathdb/wdk-client/lib/Actions';

const withUserAndAction = connect(
  state => ({ user: state.globalData.user, location: state.globalData.location }),
  UserSessionActions
);

export function addCommentLink(getLink) {
  return withUserAndAction(function SequenceComments(props) {
    let link = getLink(props);
    return (
      <div>
        <p>
          <a href={link}
            onClick={e => {
              const modifierPressed = e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
              const { isGuest } = props.user;
              if (modifierPressed || !isGuest) return;
              e.preventDefault();
              props.showLoginWarning('add a comment', link);
            }}
          >
            Add a comment <i className="fa fa-comment"/>
          </a>
        </p>
        <props.DefaultComponent {...props} />
      </div>
    )
  });
}
