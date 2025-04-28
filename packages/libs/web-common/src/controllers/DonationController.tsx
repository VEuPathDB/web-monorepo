import React, { useState } from 'react';
//import React, { useEffect, useRef } from 'react';

//import { Loading } from '@veupathdb/wdk-client/lib/Components';
//import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
//import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface Props {}

const EXTERNAL_CONTENT_CONTROLLER_CLASSNAME = 'DonationController';

function visitCreditCardForm(
  amount: string,
  setErrorMessage: (s: string) => void
) {
  const amountNum: number = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    setErrorMessage('You must enter a positive number amount.');
  }
  console.log('Submitting form with donation amount $' + amountNum);
}

export default function DonationController(props: Props) {
  const [amount, setAmount] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div>
      <h3>Please Consider Donating to VEuPathDB</h3>
      <hr />
      <div>
        <span style={{ color: 'red' }}>${errorMessage}</span>
      </div>
      <div>
        <span>How much can you donate today? $</span>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <input
          type="button"
          value="Pay Now via Credit Card"
          onClick={(e) => visitCreditCardForm(amount, setErrorMessage)}
        />
      </div>
    </div>
  );
}
