import React from 'react';
import ContactUsError from './ContactUsError';

interface Props {
  submitDisabled: boolean;
  submissionFailed: boolean;
  responseMessage: string;
}

const ContactUsFooter: React.FC<Props> = ({
  submitDisabled,
  submissionFailed,
  responseMessage,
}) => (
  <tr>
    <td></td>
    <td align="center">
      <input type="submit" disabled={submitDisabled} value="Submit message" />
      {submissionFailed && (
        <ContactUsError
          responseMessage={
            'An error occurred when we tried to submit your message. Please try to resubmit:\n' +
            responseMessage
          }
        />
      )}
    </td>
  </tr>
);

export default ContactUsFooter;
