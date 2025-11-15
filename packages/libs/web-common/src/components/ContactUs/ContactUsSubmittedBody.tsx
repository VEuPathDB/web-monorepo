import React from 'react';

interface Props {
  message: string;
}

const ContactUsSubmittedBody: React.FC<Props> = ({ message }) => (
  <div>
    {message.split('\n').map((line) => (
      <p key={line}>{line}</p>
    ))}
  </div>
);

export default ContactUsSubmittedBody;
