import React, { useEffect, useState } from 'react';

import { Loading } from 'wdk-client/Components';

import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import { MOCK_FEATURED_TOOLS_METADATA } from './FeaturedToolsMockConfig';
import { makeVpdbClassNameHelper } from './Utils';

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

function useFeaturedToolEntries() {
  const [featuredToolMetadata, setFeaturedToolMetadata] = useState<
    FeaturedToolMetadata | undefined
  >(undefined);

  useEffect(() => {
    // FIXME: Replace this with "real" logic
    // for loading the featured tool entries
    setTimeout(() => {
      setFeaturedToolMetadata(MOCK_FEATURED_TOOLS_METADATA);
    }, Math.random() * 1000 + 500);
  }, []);

  return featuredToolMetadata;
}

export const FeaturedToolsContainer = () => {
  const toolMetadata = useFeaturedToolEntries();
  const [ selectedTool, setSelectedTool ] = useState<string | undefined>();

  return (
    <div className={cx()}>
      {
        !toolMetadata 
          ? <Loading />
          : <FeaturedToolList
              toolMetadata={toolMetadata}
              setSelectedTool={setSelectedTool}
              selectedTool={selectedTool}
            />
      }
      <SelectedTool>
        {
          (
            !toolMetadata ||
            !selectedTool ||
            !toolMetadata.toolEntries[selectedTool]
          )
            ? null
            : toolMetadata.toolEntries[selectedTool].description
        }
      </SelectedTool>
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
}: FeaturedToolListProps) => (
  <div className={cx('List')}>
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
  </div>
);

type ToolListItemProps = {
  entry: FeaturedToolEntry;
  isSelected: boolean;
  onSelect: () => void;
};

const ToolListItem = ({ entry, onSelect, isSelected }: ToolListItemProps) => (
  <div
    className={
      combineClassNames(
        cx('ListItem', isSelected && 'selected'),
        `fa fa-${entry.iconKey}`
      )
    }
    onClick={onSelect}
  >
    {entry.title}
  </div>
);

const SelectedTool: React.FunctionComponent = props => 
  <div className={cx('Selection')}>{props.children}</div>;
