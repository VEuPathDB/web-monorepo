import React from 'react';
import { addCommentLink } from '../common/UserComments';

const SequenceComments = addCommentLink(
  (props) => props.record.attributes.user_comment_link_url
);

export function RecordTable(props) {
  switch (props.table.name) {
    case 'SequenceComments':
      return <SequenceComments {...props} />;

    default:
      return <props.DefaultComponent {...props} />;
  }
}
