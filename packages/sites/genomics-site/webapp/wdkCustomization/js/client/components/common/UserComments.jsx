import React from 'react';

export function addCommentLink(getLink) {
  return function SequenceComments(props) {
    let link = getLink(props);
    return (
      <div>
        <p>
          <a href={link}>
            Add a comment <i className="fa fa-comment" />
          </a>
        </p>
        <props.DefaultComponent {...props} />
      </div>
    );
  };
}
