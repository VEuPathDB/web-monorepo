import React, { Fragment } from 'react';
import ContactUsFinishedHeader from './ContactUsFinishedHeader';
import ContactUsSubmittedBody from './ContactUsSubmittedBody';

interface Props {
  message: string;
}

const ContactUsFinished: React.FC<Props> = ({ message }) => (
  <Fragment>
    <ContactUsFinishedHeader />
    <ContactUsSubmittedBody message={message} />
  </Fragment>
);

export default ContactUsFinished;
