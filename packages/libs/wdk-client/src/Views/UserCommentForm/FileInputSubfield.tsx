import React from 'react';

import { FileInput, TextArea } from 'wdk-client/Components';
import { FormRow } from 'wdk-client/Views/UserCommentForm/FormRow';

interface FileInputSubfieldProps {
  onFileChange: (file: File | null) => void;
  onDescriptionChange: (description: string) => void;
  onRemove: () => void;
  filename?: string;
  description: string;
  disabled: boolean;
  className?: string;
}

export const FileInputSubfield: React.SFC<FileInputSubfieldProps> = ({
  onFileChange,
  onDescriptionChange,
  onRemove,
  filename,
  description,
  disabled,
  className
}) => (
  <div className={className}>
    {
      <a href="#" onClick={(event) => {
          event.preventDefault();
          onRemove();
        }}
      >
        <i className="fa fa-times" />
      </a>
    }
    {
      disabled
      ? (
        <FormRow
          label="Select a file:"
          field={filename}
        />
      )
      : (
        <FormRow
          label="Select a file:"
          field={(
            <FileInput
              required
              onChange={onFileChange}
            />
          )}
        />
      )
    }
    <FormRow
      label={(
        <>
          Brief Description:
          <br />
          (4000 max characters)
        </>
      )}
      field={(
        <TextArea
          required
          maxLength={4000}
          disabled={disabled}
          onChange={onDescriptionChange}
          value={description}
        />
      )}
    />
  </div>
);
