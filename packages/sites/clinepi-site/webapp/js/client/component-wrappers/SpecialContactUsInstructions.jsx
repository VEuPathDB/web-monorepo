import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './SpecialContactUsInstructions.scss'

const cx = makeClassNameHelper('ce-SpecialContactUsInstructions');

export function SpecialContactUsInstructions() {
  return (
    <div className={cx()}>
      <details>
        <summary>
          If you hit an error with our analysis tools, please let us know
        </summary>
        <div className={cx('--ExpandedDetails')}>
          <ol className={cx('--InstructionList')}>
            <li>
              The type of analysis: Distributions, Contingency Tables, or Data Summaries.
            </li>
            <li>
              A screenshot of your Plot Parameters. (You can zoom out (Cmd/Ctrl -) to fit the content if needed.)
            </li>
          </ol>
          <div className={cx('--SampleScreenshot')}>
          </div>
          <div className={cx('--Footer')}>
            Thank you for your help!
          </div>
        </div>
      </details>
    </div>
  );
}
