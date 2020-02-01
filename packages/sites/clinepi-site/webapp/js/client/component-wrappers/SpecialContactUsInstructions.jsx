import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './SpecialContactUsInstructions.scss'

const cx = makeClassNameHelper('ce-SpecialContactUsInstructions');

export function SpecialContactUsInstructions() {
  return (
    <div className={cx()}>
      <details>
        <summary>
          If you hit an error with our analysis tools, please click here for instructions ...
        </summary>
        <div className={cx('--ExpandedDetails')}>
          <div className={cx('--InstructionsList')}>
            Send us a message by filling in the form below. Please provide: 
            <ol>
              <li>
                Your page URL (copy and paste from your browser tab), 
                <br /><span className={cx('--small')}>(eg: https://clinepidb.org/ce.b11/app/workspace/strategies/1035300/14840/analysis:102300)</span>
              </li>
              <li>
                The type of analysis: Distributions, Contingency Tables, or Data Summaries.
              </li>
              <li>
                A screenshot of your Plot Parameters similar to this example: 
                <br /><span className={cx('--small')}>(You can zoom out (Cmd/Ctrl -) to fit the content if needed.)</span>
              </li>
            </ol>
            Thank you for your help!
          </div>
          <div className={cx('--SampleScreenshot')}>
          </div>
        </div>
      </details>
    </div>
  );
}
