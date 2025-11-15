import React from 'react';
import ContactUsSubmittedBody from './ContactUsSubmittedBody';

interface Props {
  responseMessage: string;
}

const ContactUsError: React.FC<Props> = ({ responseMessage }) => (
  <ContactUsSubmittedBody message={responseMessage} />
);

export default ContactUsError;
