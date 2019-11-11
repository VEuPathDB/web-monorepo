import React, { useEffect, useState } from 'react';

import { Loading, IconAlt } from 'wdk-client/Components';

import { MOCK_FEATURED_TOOLS_METADATA } from './FeaturedToolsMockConfig';
import { makeVpdbClassNameHelper } from './Utils';

import './FeaturedTools.scss';

const cx = makeVpdbClassNameHelper('FeaturedTools');

type FeaturedToolEntry = {
  iconKey: string;
  title: string;
  description: string;
};

export type FeaturedToolMetadata = {
  toolListOrder: string[];
  toolEntries: Record<string, FeaturedToolEntry>;
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
  const selectedToolDescription = !toolMetadata || !selectedTool || !toolMetadata.toolEntries[selectedTool]
    ? '...'
    : toolMetadata.toolEntries[selectedTool].description;

  return (
    <div className={cx()}>
      <h3>Featured Resources and Tools</h3>
      <div className={cx('List')}> 
        {
          !toolMetadata 
            ? <Loading />
            : (
              <>          
                <FeaturedToolList
                  toolMetadata={toolMetadata}
                  setSelectedTool={setSelectedTool}
                  selectedTool={selectedTool}
                />
                <SelectedTool
                  description={selectedToolDescription}
                />
              </>
            )
        }
      </div>
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
    <IconAlt fa={entry.iconKey} />
    {entry.title}
  </a>;

type SelectedToolProps = {
  description: string
};

const SelectedTool = ({
  description
}: SelectedToolProps) => 
  <div 
    className={cx('Selection')}
    dangerouslySetInnerHTML={{
      __html: description
    }}
  >
  </div>;
