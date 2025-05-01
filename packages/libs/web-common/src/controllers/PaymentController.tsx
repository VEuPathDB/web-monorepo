import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { webAppUrl } from '../config';

import '../styles/Payment.scss';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';

interface AutoSubmitFormProps {
  actionUrl: string;
  params: any;
}

function AutoSubmitForm(props: AutoSubmitFormProps) {
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
        <input
          type="hidden"
          key={name}
          name={name}
          value={props.params[name]}
        ></input>
      ))}
    </form>
  );
}

async function getFormData(amount: string) {
  const url = webAppUrl + '/service/payment-form-content?amount=' + amount;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Pre-payment form service error');
  }
  return await response.json();
}

export default function PaymentController() {
  const [formData, setFormData] = useState(null);
  const [amount, setAmount] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState<ReactNode>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    var amountNum: number = Number(removeCommaThousandSeparators(amount));
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage(
        <>
          You must enter a positive number amount. <br />
          Do not use commas for decimals.
        </>
      );
      setIsSubmitting(false);
    } else {
      setErrorMessage('');
      // console.log('Submitting form with payment amount $' + amountNum.toFixed(2));

      // optionally update UI with trimmed amount
      // (will only be visible for a short time, so potentially panic-inducing?)
      // setAmount(amountNum.toFixed(2));

      getFormData(amountNum.toFixed(2))
        .then((formData) => {
          setFormData(formData);
        })
        .catch((error) => {
          console.error(error);
          setErrorMessage(
            <>
              Cannot connect to payment system. <br />
              Please{' '}
              <Link to="/contact-us" target="_blank">
                let us know
              </Link>{' '}
              about this.
            </>
          );
          setIsSubmitting(false);
        });
    }
  };

  // initially show the starter form
  if (formData == null) {
    return (
      <div className="payment-form">
        <h1>Make a credit card payment based on your VEuPathDB invoice</h1>
        <p id="warning">
          Payments are processed securely by CyberSource.
          <br /> VEuPathDB does not store or have access to your credit card
          information. <br />
          See{' '}
          <a href="/a/app/static-content/subscriptions.html">
            VEuPathDB Subscriptions
          </a>{' '}
          to learn about subscriptions and create an invoice.
        </p>
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
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
        <div className="button">
          {isSubmitting && <Loading />}
          <input
            type="button"
            value="Pay with Credit Card"
            disabled={isSubmitting}
            onClick={handleUserSubmit}
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

function removeCommaThousandSeparators(input: string) {
  return input.replace(/,(\d{3})(?!\d)/g, '$1');
}
