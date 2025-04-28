import React, { useState } from 'react';
//import React, { useEffect, useRef } from 'react';

//import { Loading } from '@veupathdb/wdk-client/lib/Components';
//import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';
//import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface Props {}

const EXTERNAL_CONTENT_CONTROLLER_CLASSNAME = 'DonationController';

function visitCreditCardForm(amount: string) {}

export default function DonationController(props: Props) {
  const [amount, setAmount] = useState('0.00');

  return (
    <div>
      <h3>Please Consider Donating to VEuPathDB</h3>
      <hr />
      <span>How much can you donate today? $</span>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />
      <input
        type="button"
        value="Pay Now via Credit Card"
        onClick={(e) => visitCreditCardForm(amount)}
      />
    </div>
  );
}
