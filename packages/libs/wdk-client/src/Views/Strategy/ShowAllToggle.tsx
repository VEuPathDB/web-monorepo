import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Tooltip } from '@veupathdb/coreui';
import './ShowAllToggle.scss';
import allStrats from './all-strats.svg';
import oneStrat from './one-strat.svg';

interface Props {
  on: boolean;
  onChange: (on: boolean) => void;
}

const cx = makeClassNameHelper('ShowAllToggle');

export default function ShowAllToggle(props: Props) {
  const { on, onChange } = props;
  return (
    <div className={cx()}>
      <Tooltip
        title="Show only the selected strategy, or all strategies."
        placement="bottom"
      >
        <div className={cx('--Container')}>
          <div>Show:</div>
          <label className={cx('--Option', on && 'active')}>
            <img className={cx('--Icon')} src={allStrats} />
            <div>
              <input
                type="radio"
                checked={on}
                onChange={() => onChange(true)}
              />{' '}
              All
            </div>
          </label>
          <label className={cx('--Option', !on && 'active')}>
            <img className={cx('--Icon')} src={oneStrat} />
            <div>
              <input
                type="radio"
                checked={!on}
                onChange={() => onChange(false)}
              />{' '}
              Active
            </div>
          </label>
        </div>
      </Tooltip>
    </div>
  );
}
