import React from 'react';

export function NotPriveleged () {
  return (
    <div>
      <p>Sorry, you do not have access to this data set. If you believe this is in error, please contact our </p>
      <a href="#">
        <button>Contact Us</button>
      </a>
    </div>
  );
};

export function NotLoggedIn () {
  return (
    <div>
      <p>Sorry! You must be logged in for access to this study.</p>
      <a href="#">
        <button>Log In</button>
      </a>
    </div>
  );
};

export function ApprovalRequired ({ studyName = 'study', policyUrl = '#', onClose = () => null }) {
  return (
    <div>
      <p>
        The data from this study requires approval to download and use in research projects.
        Please read the <a href={policyUrl} target="_blank">{studyName} Data Use and Approval Policy.</a>
      </p>
      <button className="btn" onClick={onClose}>I understand the restrictions.</button>
    </div>
  );
};
