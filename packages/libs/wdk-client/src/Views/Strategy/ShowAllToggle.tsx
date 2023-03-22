import React from 'react';
import {makeClassNameHelper} from 'wdk-client/Utils/ComponentUtils';
import Tooltip from 'wdk-client/Components/Overlays/Tooltip';
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
        content="Show only the selected strategy, or all strategies."
        position={{
          my: 'top center',
          at: 'bottom center'
        }}
      >
        <div className={cx('--Container')}>
          <div>Show:</div>
          <label className={cx('--Option', on && 'active')}>
            <img className={cx('--Icon')} src={allStrats}/>
            <div>
              <input type="radio" checked={on} onChange={() => onChange(true)}/> All
            </div>
          </label>
          <label className={cx('--Option', !on && 'active')}>
            <img className={cx('--Icon')} src={oneStrat}/>
            <div>
              <input type="radio" checked={!on} onChange={() => onChange(false)}/> Active
            </div>
          </label>
        </div>
      </Tooltip>
    </div>
  );
}
