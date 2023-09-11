import { range } from 'lodash';
import React from 'react';

import './PlaceholderCard.scss';

export default function PlaceholderCard() {
  return (
    <div className="Card PlaceholderCard disabled">
      <PlaceholderParagraph lines={2} />
      <PlaceholderParagraph lines={4} />
      <PlaceholderParagraph lines={3} />
      <PlaceholderParagraph lines={3} />
    </div>
  );
}

function PlaceholderParagraph(props) {
  const { lines } = props;
  return (
    <div className="PlaceholderParagraph">
      <div className="PlaceholderText PlaceholderText__Indent" />
      {range(lines - 1).map((n) => (
        <div key={n} className="PlaceholderText" />
      ))}
    </div>
  );
}
