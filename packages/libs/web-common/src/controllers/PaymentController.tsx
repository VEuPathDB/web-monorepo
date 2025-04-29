import React, { useState, useEffect, useRef } from 'react';
import { webAppUrl } from '../config';

import '../styles/Payment.scss';

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
      <div className="payment-form">
        <h1>Make a credit card payment based on your VEuPathDB invoice</h1>
        <p id="warning">
          Payments are processed securely by CyberSource.
          <br /> VEuPathDB does not store nor has access to your payment
          information. <br />
          See{' '}
          <a href="/a/app/static-content/subscriptions.html">
            VEuPathDB Subscriptions
          </a>{' '}
          to learn about subscriptions and make an invoice.
        </p>
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
        <div className="amount">
          <p>
            Please enter the amount from your invoice in USD:&nbsp;&nbsp;
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </p>
        </div>
        <div className="button">
          <input
            type="button"
            value="Pay with Credit Card"
            onClick={(e) =>
              generateForm(amount, setAmount, setFormData, setErrorMessage)
            }
          />
          <p>(Clicking the button will take you to secure.cybersource.com.)</p>
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
