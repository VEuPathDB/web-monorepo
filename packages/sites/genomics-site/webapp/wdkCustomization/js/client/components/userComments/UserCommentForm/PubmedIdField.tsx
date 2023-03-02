import React from 'react';
import { PubmedPreview } from '../../../types/userCommentTypes';
import { TextBox, HelpIcon } from '@veupathdb/wdk-client/lib/Components';
import { PubmedIdPreview } from './PubmedIdPreview';
import { PubmedIdSearchField } from './PubmedIdSearchField';

interface PubMedIdsFieldProps {
  idsField: string;
  searchField: string;
  onIdsChange: (value: string) => void;
  onSearchFieldChange: (value: string) => void;
  openPreview: () => void;
  previewOpen: boolean;
  onClosePreview: () => void;
  previewData?: PubmedPreview;
}

export const PubMedIdsField: React.SFC<PubMedIdsFieldProps> = ({
  idsField,
  searchField,
  onIdsChange,
  onSearchFieldChange,
  openPreview,
  previewOpen,
  onClosePreview,
  previewData
}) => (
  <div className="wdk-PubMedIdsField">
    <div className="wdk-PubMedIdInputField">
      <TextBox
        value={idsField}
        onChange={onIdsChange}
      />
      
      <HelpIcon>
        <ul>
          <li> First, find the publication in <a href="http://www.ncbi.nlm.nih.gov/pubmed">PubMed</a> based on author or title.</li>
          <li>Enter one or more IDs in the box above separated by ','s (Example: 18172196,10558988).</li>
          <li>Click 'Preview' to see information about these publications.</li>
        </ul>
      </HelpIcon>
      <div>
        <button className="wdk-PubMedIdOpenPreviewButton" type="button" onClick={openPreview}>Preview</button> the article details of the PubMed ID(s) above
      </div>
    </div>
    <PubmedIdSearchField className="wdk-PubMedIdSearchField" query={searchField} onChange={onSearchFieldChange} />
    {
      previewOpen && (
        <PubmedIdPreview
          className="wdk-PubMedIdPreview"
          onClose={onClosePreview}
          previewData={previewData}
        />
      )
    }
  </div>
);


