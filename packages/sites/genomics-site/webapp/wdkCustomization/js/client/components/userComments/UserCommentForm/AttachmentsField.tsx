import React from 'react';
import {
  UserCommentAttachedFile,
  KeyedUserCommentAttachedFileSpec,
  UserCommentAttachedFileSpec
} from '../../../types/userCommentTypes';
import { FileInputSubfield } from './FileInputSubfield';

interface AttachmentsFieldProps {
  attachedFiles: UserCommentAttachedFile[];
  fileSpecsToAttach: KeyedUserCommentAttachedFileSpec[];
  removeFileSpec: (index: number) => void;
  modifyFileSpec: (newFileSpec: Partial<UserCommentAttachedFileSpec>, index: number) => void;
  addFileSpec: (newFileSpec: UserCommentAttachedFileSpec) => void;
  removeAttachedFile: (attachmentId: number) => void;
}

const NOOP = () => {};

export const AttachmentsField: React.SFC<AttachmentsFieldProps> = ({
  attachedFiles,
  fileSpecsToAttach,
  removeFileSpec,
  modifyFileSpec,
  addFileSpec,
  removeAttachedFile
}) => (
  <div className="wdk-AttachmentsField">
    {
      attachedFiles.map(attachedFile =>
        <FileInputSubfield
          key={attachedFile.id}
          className="wdk-FileInputSubfield"
          disabled
          filename={attachedFile.name}
          description={attachedFile.description}
          onRemove={() => removeAttachedFile(attachedFile.id)}
          onFileChange={NOOP}
          onDescriptionChange={NOOP}
        />
      )
    }
    {
      fileSpecsToAttach.map((fileSpec, index) =>
        <FileInputSubfield
          key={`new-file-${fileSpec.id}`}
          className="wdk-FileInputSubfield"
          disabled={false}
          onFileChange={file => file && modifyFileSpec({ file }, index)
          }
          onDescriptionChange={
            description => modifyFileSpec({ description }, index)
          }
          onRemove={() => removeFileSpec(index)}
          description={fileSpec.description}
        />
      )
    }
    <button type="button" onClick={() => addFileSpec({ file: null, description: '' })}>
      {fileSpecsToAttach.length === 0 ? 'Add a file' : 'Add another file'}
    </button>
  </div>
);

