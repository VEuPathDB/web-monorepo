import React, { useState, useEffect, useRef } from 'react';
import { webAppUrl } from '../config';

// may want to use this later
//import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {}

interface FormProps {
  actionUrl: string;
  params: any;
}

function AutoSubmitForm(props: FormProps) {
  // submit form as soon as it is rendered
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (formRef.current !== null) {
      formRef.current.submit();
    }
  }, []);

  // create a hidden form with the passed action URL and parameters
  return (
    <form ref={formRef} method="POST" action={props.actionUrl}>
      {Object.keys(props.params).map((name) => (
        <input type="hidden" name={name} value={props.params[name]}></input>
      ))}
    </form>
  );
}

async function getFormData(
  amount: number,
  setErrorMessage: (s: string) => void
) {
  try {
    const url = webAppUrl + '/service/payment-form-content?amount=' + amount;
    const response = await fetch(url);
    if (!response.ok) {
      setErrorMessage('Cannot connect to payment system.');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

function generateForm(
  amount: string,
  setAmount: (a: string) => void,
  setFormData: (b: any) => void,
  setErrorMessage: (s: string) => void
) {
  var amountNum: number = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    setErrorMessage('You must enter a positive number amount.');
  } else {
    setErrorMessage('Please wait...');
    amountNum = Math.floor(amountNum * 100) / 100;
    setAmount(amountNum.toString());
    console.log('Submitting form with payment amount $' + amountNum);
    getFormData(amountNum, setErrorMessage)
      .then((formData) => {
        setFormData(formData);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage('Cannot connect to payment system.');
      });
  }
}

export default function PaymentController(props: Props) {
  const [formData, setFormData] = useState(null);
  const [amount, setAmount] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState('');

  // initially show the starter form
  if (formData == null) {
    return (
      <div>
        <h3>Make Payment to VEuPathDB</h3>
        <hr />
        <div>
          <span style={{ color: 'red' }}>{errorMessage}</span>
        </div>
        <div>
          <span>How much will you be paying today? $</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <input
            type="button"
            value="Pay Now with Credit Card"
            onClick={(e) =>
              generateForm(amount, setAmount, setFormData, setErrorMessage)
            }
          />
        </div>
        <div>
          <span>Payments processed securely by CyberSource</span>
        </div>
      </div>
    );
  }

  // once form data has been fetched, return form which will automatically submit when rendered
  return (
    <AutoSubmitForm
      actionUrl="https://secureacceptance.cybersource.com/pay"
      params={formData}
    />
  );
}
