import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keyBy } from 'lodash';

import { Loading, IconAlt } from 'wdk-client/Components';

import { makeVpdbClassNameHelper, useCommunitySiteUrl } from './Utils';

import { combineClassNames } from 'ebrc-client/components/homepage/Utils';
import { useIsRefOverflowingVertically } from 'wdk-client/Hooks/Overflow';
import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';
import { decode, string } from 'wdk-client/Utils/Json';

import './FeaturedTools.scss';


const cx = makeVpdbClassNameHelper('FeaturedTools');
const bgDarkCx = makeVpdbClassNameHelper('BgDark');

const FEATURED_TOOL_URL_SEGMENT = 'json/features_tools.json';

type FeaturedToolResponseData = FeaturedToolEntry[];

type FeaturedToolMetadata = {
  toolListOrder: string[],
  toolEntries: Record<string, FeaturedToolEntry>
};

type FeaturedToolEntry = {
  identifier: string,
  listIconKey: string,
  listTitle: string,
  descriptionTitle?: string,
  output: string
};

function useFeaturedToolMetadata(): FeaturedToolMetadata | undefined {
  const communitySiteUrl = useCommunitySiteUrl();
  const [ featuredToolResponseData, setFeaturedToolResponseData ] = useState<FeaturedToolResponseData | undefined>(undefined);

  useEffect(() => {
    if (communitySiteUrl != null) {
      (async () => {
        // FIXME Add basic error-handling 
        const response = await fetch(`https://${communitySiteUrl}${FEATURED_TOOL_URL_SEGMENT}`, { mode: 'cors' });

        // FIXME Validate this JSON using a Decoder
        const responseData = await response.json() as FeaturedToolResponseData;

        setFeaturedToolResponseData(responseData);
      })();
    }
  }, [ communitySiteUrl ]);

  const featuredToolMetadata = useMemo(
    () => 
      featuredToolResponseData && 
      {
        toolListOrder: featuredToolResponseData.map(({ identifier }) => identifier),
        toolEntries: keyBy(featuredToolResponseData, 'identifier')
      }, 
    [ featuredToolResponseData ]
  );

  return featuredToolMetadata;
}

const FEATURED_TOOL_KEY = 'homepage-featured-tool';

export const FeaturedTools = () => {
  const toolMetadata = useFeaturedToolMetadata();
  const [ selectedTool, setSelectedTool ] = useSessionBackedState<string | undefined>(
    undefined,
    FEATURED_TOOL_KEY,
    JSON.stringify,
    (s: string) => decode(string, s)
  );
  const selectedToolEntry = !toolMetadata || !selectedTool || !toolMetadata.toolEntries[selectedTool]
    ? undefined
    : toolMetadata.toolEntries[selectedTool];

  useEffect(() => {
    if (
      toolMetadata && 
      toolMetadata.toolListOrder.length > 0 && 
      toolMetadata.toolEntries[toolMetadata.toolListOrder[1]] &&
      (!selectedTool || !toolMetadata.toolEntries[selectedTool])
    ) {
      setSelectedTool(toolMetadata.toolListOrder[1]);
    }
  }, [ toolMetadata ]);

  return (
    <div className={cx()}>
      <div className={cx('Header')}>
        <h3>Featured Resources and Tools</h3>
        <a href="">View all <IconAlt fa="angle-double-right" /></a>
      </div>
      {
        !toolMetadata 
          ? <Loading />
          : <div className={cx('List')}>          
              <FeaturedToolList
                toolMetadata={toolMetadata}
                setSelectedTool={setSelectedTool}
                selectedTool={selectedTool}
              />
              <SelectedTool
                entry={selectedToolEntry}
              />
            </div>
      }
    </div>
  );
}

type FeaturedToolListProps = {
  toolMetadata: FeaturedToolMetadata;
  selectedTool?: string;
  setSelectedTool: (nextSelectedTool: string) => void;
};

const FeaturedToolList = ({
  toolMetadata: { toolEntries, toolListOrder },
  selectedTool,
  setSelectedTool
}: FeaturedToolListProps) => 
  <div className={cx('ListItems')}>
    {toolListOrder
      .filter(toolKey => toolEntries[toolKey])
      .map(toolKey => (
        <ToolListItem
          key={toolKey}
          entry={toolEntries[toolKey]}
          isSelected={toolKey === selectedTool}
          onSelect={() => {
            setSelectedTool(toolKey);
          }}
        />
      ))}
  </div>;

type ToolListItemProps = {
  entry: FeaturedToolEntry;
  isSelected: boolean;
  onSelect: () => void;
};

const ToolListItem = ({ entry, onSelect, isSelected }: ToolListItemProps) =>
  <a
    className={cx('ListItem', isSelected && 'selected')}
    href="#"
    onClick={e => {
      e.preventDefault();
      onSelect(); 
    }}
    type="button"
  >
    <div className={cx('ListItemIconContainer')}>
      <IconAlt fa={entry.listIconKey} />
    </div>
    <span className={cx('ListItemCaption')}>
      {entry.listTitle}
    </span>
  </a>;

type SelectedToolProps = {
  entry?: FeaturedToolEntry
};

const SelectedTool = ({ entry }: SelectedToolProps) => 
  <div className={cx('Selection')}>
    {
      entry && entry.descriptionTitle &&
      <h5 className={combineClassNames(cx('SelectionHeader'), bgDarkCx())}>
        {entry.descriptionTitle}
      </h5>
    }
    <SelectionBody key={entry?.identifier} entry={entry} />
  </div>;

type SelectionBodyProps = SelectedToolProps;

const SelectionBody = ({ entry }: SelectionBodyProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isOverflowing = useIsRefOverflowingVertically(ref);
  const [ isExpanded, setExpanded ] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded(!isExpanded);
  }, [ isExpanded ]);

  return (
    <div className={cx('SelectionBody')}>
      <div
        ref={ref}
        className={cx('SelectionBodyContent', isExpanded && 'expanded')}
        dangerouslySetInnerHTML={{
          __html: entry?.output || '...'
        }}
      >
      </div>
      {
        isOverflowing && (
          <div className={cx('SelectionBodyReadMore', isExpanded && 'expanded')}>
            <button 
              type="button" 
              className="link" 
              onClick={toggleExpanded}
            >
              {isExpanded 
                ? <React.Fragment>
                    <IconAlt fa="chevron-up" />
                    {' '}
                    Read Less
                  </React.Fragment>
                : <React.Fragment>
                    <IconAlt fa="chevron-down" />
                    {' '}
                    Read More
                  </React.Fragment>
              }
            </button>
          </div>
        )
      }
    </div>
  );
};
