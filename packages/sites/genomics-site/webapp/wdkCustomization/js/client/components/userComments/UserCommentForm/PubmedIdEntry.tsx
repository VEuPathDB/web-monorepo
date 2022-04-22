import React from 'react';

interface PubmedIdEntryProps {
  id: string;
  title: string;
  author: string;
  journal?: string;
  url: string;
  className?: string;
  headerClassName?: string;
  entryrowClassName?: string;
}

export const PubmedIdEntry: React.SFC<PubmedIdEntryProps> = ({
  id,
  title,
  author,
  journal,
  url
}) => (
  <div className="wdk-PubmedIdEntry">
    <label>PMID</label>
    <div><a href={url} target="_blank">{id}</a></div>

    <label>Title:</label>
    <div>{title}</div>

    <label>Author:</label>
    <div>{author}</div>

    <label>Title:</label>
    <div>{journal}</div>
  </div>
);
