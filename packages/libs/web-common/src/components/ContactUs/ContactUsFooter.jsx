import React from 'react';
import ContactUsInstructions from './ContactUsInstructions';
import ContactUsError from './ContactUsError';

const ContactUsFooter = ({
  submitDisabled,
  submissionFailed,
  responseMessage
}) => (
  <tr>
    <td align="center" colSpan={2}>
    {/*  <ContactUsInstructions /> */}
      <input 
        type="submit"
        disabled={submitDisabled}
        value="Submit message" 
      />
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
