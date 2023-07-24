import React from 'react';
import { addCommentLink } from '../common/UserComments';

const PopsetComments = addCommentLink(
  (props) => props.record.attributes.user_comment_link_url
);

export function RecordTable(props) {
  switch (props.table.name) {
    case 'PopsetComments':
      return <PopsetComments {...props} />;

    default:
      return <props.DefaultComponent {...props} />;
  }
}
