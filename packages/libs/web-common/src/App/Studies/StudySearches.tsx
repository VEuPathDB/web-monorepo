import { constant } from 'lodash';
import React from 'react';
import { Mesa, Link } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Study } from './StudyActionCreators';

import './StudySearches.scss';

const cx = makeClassNameHelper('StudySearchIconLinks');
const renderEmpty = constant(null);

interface StudySearchIconLinksProps {
  study?: Study;
  renderNotFound?: () => JSX.Element | null;
}

export default function StudySearchIconLinks(props: StudySearchIconLinksProps) {
  const { study, renderNotFound = renderEmpty } = props;

  if (study == null) return renderNotFound();

  return (
    <div className={cx()}>
      {study.searches.map(({ icon, displayName, name, path }) => (
        <div key={name} className={cx('Item')}>
          <Mesa.AnchoredTooltip
            fadeOut
            content={
              <span>
                Search <strong>{displayName}</strong>
              </span>
            }
          >
            <Link to={`/search/${path}`}>
              <i className={icon} />
            </Link>
          </Mesa.AnchoredTooltip>
        </div>
      ))}
    </div>
  );
}
