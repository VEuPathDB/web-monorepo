import React, { Fragment } from 'react';
import ContactUsFinishedHeader from './ContactUsFinishedHeader';
import ContactUsSubmittedBody from './ContactUsSubmittedBody';

const ContactUsFinished = ({ message }) => (
  <Fragment>
    <ContactUsFinishedHeader />
    <ContactUsSubmittedBody message={message} />
  </Fragment>
);

export default ContactUsFinished;
