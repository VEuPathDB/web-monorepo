import { IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { cx } from './PreferredOrganismsConfig';

import './PreferredOrganismsToggleHelp.scss';

export function PreferredOrganismsToggleHelp() {
  return (
    <div className={cx('--ToggleHelp')}>
      <span>
        <IconAlt fa="lightbulb-o" />
      </span>
      <span>
        You can always disable this preference to bring back the full set of
        organisms, and explore the data, tools and searches they offer.
      </span>
    </div>
  );
}
