import React, { useEffect, useState } from 'react';

import { Loading, IconAlt } from 'wdk-client/Components';

import { MOCK_FEATURED_TOOLS_METADATA } from './FeaturedToolsMockConfig';
import { makeVpdbClassNameHelper } from './Utils';

import './FeaturedTools.scss';
import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

const cx = makeVpdbClassNameHelper('FeaturedTools');
const bgDarkCx = makeVpdbClassNameHelper('BgDark');

type FeaturedToolEntry = {
  listIconKey: string,
  listTitle: string,
  descriptionTitle?: string,
  descriptionBody: string
};

export type FeaturedToolMetadata = {
  toolListOrder: string[],
  toolEntries: Record<string, FeaturedToolEntry>
};

function useFeaturedToolMetadata() {
  const [ featuredToolMetadata, setFeaturedToolMetadata ] = useState<FeaturedToolMetadata | undefined>(undefined);

  useEffect(() => {
    // FIXME: Replace this with "real" logic
    // for loading the featured tool entries
    setTimeout(() => {
      setFeaturedToolMetadata(MOCK_FEATURED_TOOLS_METADATA);
    }, Math.random() * 1000 + 500);
  }, []);

  return featuredToolMetadata;
}

export const FeaturedTools = () => {
  const toolMetadata = useFeaturedToolMetadata();
  const [ selectedTool, setSelectedTool ] = useState<string | undefined>();
  const selectedToolEntry = !toolMetadata || !selectedTool || !toolMetadata.toolEntries[selectedTool]
    ? undefined
    : toolMetadata.toolEntries[selectedTool];

  useEffect(() => {
    if (
      toolMetadata && 
      toolMetadata.toolListOrder.length > 0 && 
      toolMetadata.toolEntries[toolMetadata.toolListOrder[0]]
    ) {
      setSelectedTool(toolMetadata.toolListOrder[0]);
    }
  }, [ toolMetadata ]);

  return (
    <div className={cx()}>
      <div className={cx('Header')}>
        <h3>Featured Resources and Tools</h3>
        <a href="">View all resources &amp; tools <IconAlt fa="angle-double-right" /></a>
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
    <IconAlt fa={entry.listIconKey} />
    {entry.listTitle}
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
    <div
      className={cx('SelectionBody')}
      dangerouslySetInnerHTML={{
        __html: entry ? entry.descriptionBody : '...'
      }}
    ></div>
  </div>;
