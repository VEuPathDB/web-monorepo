import React from 'react';
import ContactUsError from './ContactUsError';

const ContactUsFooter = ({
  submitDisabled,
  submissionFailed,
  responseMessage,
  reporterEmailValue
}) => (
  <tr>
    <td></td>
    <td align="center">
      <input 
        type="submit"
        disabled={submitDisabled}
        value="Submit message" 
      />
      {
        !reporterEmailValue ? 
          <p style={{color: 'darkred', margin: '0.5em 0 0 0', fontSize: '100%'}}>
            <strong>Note</strong>: Please provide your email if you would like to hear back from us.
          </p> :
          null
      }
      {
        submissionFailed &&
        <ContactUsError 
          responseMessage={
            'An error occurred when we tried to submit your message. Please try to resubmit:\n' + responseMessage
          } 
        />
      }
    </td>
  </tr>
);

export default ContactUsFooter;
