import { MouseEventHandler, useState } from 'react';
import { format, parse } from 'date-fns';

// Components
import { Copy } from '@veupathdb/coreui';
import { FloatingButton } from '@veupathdb/coreui';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

// Definitions
import { DownloadTabStudyRelease } from './types';
import { LinkAttributeValue } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Utils
import {
  writeTextToClipboard,
  stripHTML,
} from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeStyles } from '@material-ui/core';

export type CitationDetails = {
  partialCitationData: {
    studyAuthor: string | LinkAttributeValue;
    studyDisplayName: string;
    projectDisplayName: string;
    downloadUrl: string;
  };
  release: DownloadTabStudyRelease;
};

export function getCitationString({
  partialCitationData,
  release,
}: CitationDetails) {
  const { studyAuthor, studyDisplayName, projectDisplayName, downloadUrl } =
    partialCitationData;
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

const useStyles = makeStyles(() => ({
  tooltip: {},
}));

export default function StudyCitation({
  partialCitationData,
  release,
}: CitationDetails) {
  const [hoveredState, setHoveredState] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    pageX: 0,
    pageY: 0,
  });
  const classes = useStyles();

  const citation = getCitationString({
    partialCitationData,
    release,
  });

  const copyCitation = () => {
    writeTextToClipboard(stripHTML(citation));
  };

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const { pageX, pageY } = event;
    setTooltipPosition({ pageX, pageY });
  };

  const computeStyleFn = (data: any) => {
    return {
      ...data,
      styles: {
        ...data.styles,
        left: `${tooltipPosition.pageX + 10}px`,
        top: `${tooltipPosition.pageY}px`,
      },
    };
  };

  return (
    <Tooltip
      title="Copy citation to clipboard"
      onMouseMove={handleMouseMove}
      classes={{ tooltip: classes.tooltip }}
      PopperProps={{
        modifiers: {
          computeStyle: {
            fn: computeStyleFn,
            gpuAcceleration: true,
          },
        },
      }}
    >
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
            tooltip=""
            themeRole="primary"
          />
        </div>
      </span>
    </Tooltip>
  );
}
