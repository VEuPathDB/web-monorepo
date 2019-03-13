import React from 'react';
import { PubmedPreview } from 'wdk-client/Utils/WdkUser';
import { TextBox } from 'wdk-client/Components';
import { PubmedIdPreview } from 'wdk-client/Views/UserCommentForm/PubmedIdPreview';
import { PubmedIdSearchField } from 'wdk-client/Views/UserCommentForm/PubmedIdSearchField';

interface PubMedIdsFieldProps {
  idsFieldContents: string;
  onIdsChange: (value: string) => void;
  openPreview: () => void;
  previewOpen: boolean;
  onClosePreview: () => void;
  previewData?: PubmedPreview;
}

export const PubMedIdsField: React.SFC<PubMedIdsFieldProps> = ({
  idsFieldContents,
  onIdsChange,
  openPreview,
  previewOpen,
  onClosePreview,
  previewData
}) => (
  <>
    <TextBox
      value={idsFieldContents}
      onChange={onIdsChange}
    />
    <button type="button" onClick={openPreview}>Preview</button> the article details of the PubMed ID(s) above
    <PubmedIdSearchField query={"2"} onChange={console.log} />
    {
      previewOpen && (
        <PubmedIdPreview
          onClose={onClosePreview}
          previewData={previewData}
        />
      )
    }
  </>
);


