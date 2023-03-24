import { useState } from 'react';
import { format, parse } from 'date-fns';

// Components
import { Copy } from '@veupathdb/coreui';
import { FloatingButton } from '@veupathdb/coreui';

// Definitions
import { DownloadTabStudyRelease } from './types';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Utils
import {
  writeTextToClipboard,
  stripHTML,
} from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

export type CitationDetails = {
  studyAuthor: string | LinkAttributeValue;
  studyDisplayName: string;
  projectDisplayName: string;
  downloadUrl: string;
  release: DownloadTabStudyRelease;
};

export function getCitationString({
  studyAuthor,
  studyDisplayName,
  projectDisplayName,
  downloadUrl,
  release,
}: CitationDetails) {
  const parsedReleaseDate = parse(
    release.date ?? '',
    'yyyy-MMM-dd',
    new Date()
  );
  const citationDate = format(parsedReleaseDate, 'dd MMMM yyyy');
  const typeGuardedStudyAuthor =
    typeof studyAuthor == 'string'
      ? studyAuthor
      : 'displayText' in studyAuthor
      ? studyAuthor.displayText
      : studyAuthor.url;

  return `${typeGuardedStudyAuthor}. Study: ${studyDisplayName}. ${projectDisplayName}. ${citationDate}, ${release.releaseNumber} (${downloadUrl})`;
}

export default function StudyCitation({
  studyAuthor,
  studyDisplayName,
  projectDisplayName,
  downloadUrl,
  release,
}: CitationDetails) {
  const [hoveredState, setHoveredState] = useState<boolean>(false);

  const citation = getCitationString({
    studyAuthor,
    studyDisplayName,
    projectDisplayName,
    downloadUrl,
    release,
  });

  const copyCitation = () => {
    writeTextToClipboard(stripHTML(citation));
  };

  return (
    <Tooltip title="Copy citation to clipboard">
      <span
        onMouseOver={() => (hoveredState ? undefined : setHoveredState(true))}
        onMouseLeave={() =>
          !hoveredState ? undefined : setHoveredState(false)
        }
        onClick={copyCitation}
        style={{
          cursor: 'copy',
          textDecoration: hoveredState ? 'underline' : undefined,
        }}
      >
        {safeHtml(citation)}
        <div style={{ display: 'inline-block' }}>
          <FloatingButton
            icon={Copy}
            text=""
            onPress={copyCitation}
            size="small"
            tooltip="Copy citation to clipboard"
            themeRole="primary"
          />
        </div>
      </span>
    </Tooltip>
  );
}
