import React from 'react';
const ContactUsSubmittedBody = ({ message }) => (
  <div>
    {message.split('\n').map((line) => (
      <p key={line}>{line}</p>
    ))}
  </div>
);

export default ContactUsSubmittedBody;
