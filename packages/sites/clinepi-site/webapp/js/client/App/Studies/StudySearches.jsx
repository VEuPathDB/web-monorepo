import './StudySearches.scss';

import { constant } from 'lodash';
import React from 'react';
import { IconAlt, Mesa } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/ComponentUtils';

const cx = makeClassNameHelper('ce-StudySearchIconLinks');
const renderEmpty = constant(null);

export default function StudySearchIconLinks(props) {
  const {
    // Array of objects with question and recordClass
    entries = [],
    renderNotFound = renderEmpty,
    webAppUrl
  } = props;

  if (entries.length === 0) return renderNotFound();

  return (
    <div className={cx()}>
      {entries.map(({ question, recordClass }) => (
        <div className={cx('Item')}>
          <Mesa.AnchoredTooltip
            fadeOut
            content={<span>Search <strong>{recordClass.displayNamePlural}</strong></span>}
          >
            <a href={`${webAppUrl}/showQuestion.do?questionFullName=${question.name}`}>
              <IconAlt fa={recordClass.iconName}/>
            </a>
          </Mesa.AnchoredTooltip>
        </div>
      ))}
    </div>
  );
}
