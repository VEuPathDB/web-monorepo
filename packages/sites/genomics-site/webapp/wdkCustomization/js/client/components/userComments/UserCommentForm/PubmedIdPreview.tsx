import React from 'react';

import { PubmedIdEntry } from './PubmedIdEntry';

import { PubmedPreview } from '../../../types/userCommentTypes';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface PubmedIdPreviewProps {
  onClose: () => void;
  previewData?: PubmedPreview;
  className?: string;
}

export const PubmedIdPreview: React.FunctionComponent<PubmedIdPreviewProps> = ({
  onClose,
  previewData,
  className,
}) =>
  previewData ? (
    <div className={className}>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <i className="fa fa-times" />
      </a>
      {previewData.map((previewDatum, index) => (
        <PubmedIdEntry key={index} {...previewDatum} />
      ))}
    </div>
  ) : (
    <Loading />
  );
