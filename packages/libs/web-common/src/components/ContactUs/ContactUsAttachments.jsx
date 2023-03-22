import React from 'react';
import ValidatedInput from '../../components/ValidatedInput';

import { MAX_ATTACHMENT_SIZE_DESCRIPTION } from 'ebrc-client/selectors/ContactUsSelectors';

import './ContactUsAttachments.scss';

const ContactUsAttachments = ({ 
  changeFile,
  addFile,
  removeFile,
  validatedAttachmentMetadata
}) => 
  <div className="contact-us-files">
    Attach up to three files (maximum {MAX_ATTACHMENT_SIZE_DESCRIPTION} per file).
    <div className="contact-us-file-list">
      {
        validatedAttachmentMetadata.map(({ id, validity }, index) =>
          <div key={id}>
            <ValidatedInput
              validity={validity}
              onChange={event => changeFile(index, event.target.files)}
              type="file"
            />
            <span className="remove-file">
              <button type="button" className="btn" onClick={e => {
                e.preventDefault();
                removeFile(index);
              }}>
                Remove file
              </button>
            </span>
          </div>
        )
      }
    </div>
    {
      validatedAttachmentMetadata.length < 3 &&
      (
        <div className={validatedAttachmentMetadata.length === 0 
          ? "add-file"
          : "add-another-file"
        } >
          <button type="button" className="btn" onClick={e => {
            e.preventDefault();
            addFile();
          }}>{
            validatedAttachmentMetadata.length === 0
              ? 'Add a file'
              : 'Add another file'
          }</button>
        </div>
      )
    }
  </div>;

export default ContactUsAttachments;
