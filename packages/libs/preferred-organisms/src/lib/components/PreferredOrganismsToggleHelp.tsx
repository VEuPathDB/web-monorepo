import { IconAlt } from '@veupathdb/wdk-client/lib/Components';

import { cx } from './PreferredOrganismsConfig';

import './PreferredOrganismsToggleHelp.scss';

interface Props {
  visible: boolean;
}

export function PreferredOrganismsToggleHelp({ visible }: Props) {
  return (
    <div className={cx('--ToggleHelp', !visible && 'hidden')}>
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
