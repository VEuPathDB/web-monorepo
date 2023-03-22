import React from 'react';

import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { combineClassNames } from 'ebrc-client/components/homepage/Utils';

import './SocialMediaControls.scss';

type Props = {
  isNewsExpanded: boolean,
  toggleNews: () => void
};

const cx = makeClassNameHelper('ebrc-SocialMediaControls');

export const SocialMediaControls = ({ isNewsExpanded, toggleNews }: Props) => {
  const newsToggleClassName = combineClassNames(
    cx('NewsToggle'),
    'link'
  );

  return (
    <div className={cx('', isNewsExpanded ? 'news-expanded' : 'news-collapsed')}>
      {
        isNewsExpanded &&
        <button type="button" className={newsToggleClassName} onClick={toggleNews}>
          <span>News</span>
          <IconAlt 
            fa="angle-double-right"
          />
        </button>
      }
    </div>
  );
};
