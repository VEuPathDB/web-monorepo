import React from 'react';

interface PubmedIdEntryProps {
  id: string;
  title: string;
  author: string;
  journal?: string;
  url: string;
  headerClassName?: string;
  entryrowClassName?: string;
}

export const PubmedIdEntry: React.SFC<PubmedIdEntryProps> = ({
  id,
  title,
  author,
  journal,
  url,
  headerClassName,
  entryrowClassName
}) => (
  <>
    <div className={headerClassName}>
      <label>
        PMID
      </label>
      <a href={url} target="_blank">{id}</a>
    </div>
    <div className={entryrowClassName}>
      <label>
        Title:
      </label>
      {title}
    </div>
    <div className={entryrowClassName}>
      <label>
        Author:
      </label>
      {author}
    </div>
    <div className={entryrowClassName}>
      <label>
        Title:
      </label>
      {journal}
    </div>
  </>
);
