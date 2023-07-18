import React from 'react';
import ContactUsSubmittedBody from './ContactUsSubmittedBody';

const ContactUsError = ({ responseMessage }) => (
  <ContactUsSubmittedBody message={responseMessage} />
);

export default ContactUsError;
