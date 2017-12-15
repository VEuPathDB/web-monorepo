import React from 'react';

const restrictions = {
  notLoggedIn: (
    <div>
      <p>Sorry! You must be logged in for access to this study.</p>
      <a href="#">
        <button>Log In</button>
      </a>
    </div>
  ),
  notPriveleged: (
    <div>
      <p>Sorry, you do not have access to this data set. If you believe this is in error, please contact our </p>
      <a href="#">
        <button>Contact Us</button>
      </a>
    </div>
  ),
};

export function getRestriction ({ userId, studyId, siteId } = {}) {
  const restrict = Math.random() > 0.1;
  return !restrict
    ? false
    : restrictions.notPriveleged
}
