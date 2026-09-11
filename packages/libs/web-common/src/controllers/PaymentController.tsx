import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { webAppUrl } from '../config';

import '../styles/Payment.scss';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';

interface AutoSubmitFormProps {
  actionUrl: string;
  params: any;
}

type ErrorKey = 'amount' | 'invoiceNumber' | 'general';

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

// empty string invoiceNumber is a valid arg
async function getFormData(amount: string, invoiceNumber: string) {
  const url =
    webAppUrl +
    '/service/payment-form-content?amount=' +
    amount +
    '&invoice_number=' +
    invoiceNumber;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Pre-payment form service error');
  }
  return await response.json();
}

export default function PaymentController() {
  const [formData, setFormData] = useState(null);
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  // errorType => errorMessage
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, ReactNode>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If we're showing a persisted page from a back-button navigation
  // we need to reset some state.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setFormData(null); // Clear stale formData
        setIsSubmitting(false); // and clear this, so the button can be pressed again
      }
    }

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleUserSubmit = () => {
    if (isSubmitting) return;

    // invoiceNumber validation
    // see https://github.com/VEuPathDB/EbrcWebsiteCommon/blob/baf3e3c6936b309b6d677019351c1a5fe06c08f0/Model/src/main/java/org/eupathdb/common/service/CyberSourceFormService.java#L58

    const invoiceNumberIsValid =
      invoiceNumber === '' || invoiceNumber.match(/^[0-9a-zA-Z\-]+$/);
    setErrors((errors) => ({
      ...errors,
      invoiceNumber: invoiceNumberIsValid ? undefined : (
        <>
          Invoice numbers may contain only A-Z a-z 0-9 and dash ('-')
          characters.
        </>
      ),
    }));

    // amount validation and remove any leading dollar sign
    const amountNum: number = Number(
      removeCommaThousandSeparators(amount).replace(/^\$/, '')
    );
    const amountIsValid = !isNaN(amountNum) && amountNum >= 0.01;

    setErrors((errors) => ({
      ...errors,
      amount: amountIsValid ? undefined : (
        <>
          You must enter a positive dollar amount. <br />
          Do not use commas for decimals.
        </>
      ),
    }));

    if (amountIsValid && invoiceNumberIsValid) {
      // submit to our service
      // clear all errors including 'general'
      setErrors({});

      // console.log('Submitting form with payment amount $' + amountNum.toFixed(2));
      setIsSubmitting(true);
      getFormData(amountNum.toFixed(2), invoiceNumber)
        .then((formData) => {
          setFormData(formData);
        })
        .catch((error) => {
          console.error(error);
          setErrors((errors) => ({
            ...errors,
            general: (
              <>
                Cannot connect to payment system. <br />
                Please{' '}
                <Link to="/contact-us" target="_blank">
                  let us know
                </Link>{' '}
                about this.
              </>
            ),
          }));
          setIsSubmitting(false);
        });
    }
  };

  // initially show the starter form
  if (formData == null) {
    return (
      <div className="payment-container">
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
        <div className="payment-form">
          <div className="error-message">
            <p>{errors.amount}</p>
          </div>

          <div className="form-row">
            <label htmlFor="amount">Amount (USD):&nbsp;*</label>
            <input
              id="amount"
              className={errors.amount ? 'hasError' : undefined}
              type="text"
              value={amount}
              placeholder="0.00"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="error-message">
            <p>{errors.invoiceNumber}</p>
          </div>

          <div className="form-row optional">
            <label htmlFor="invoiceNumber">Invoice number:</label>
            <input
              id="invoiceNumber"
              className={errors.invoiceNumber ? 'hasError' : undefined}
              type="text"
              value={invoiceNumber}
              placeholder="VEuPathDB-####-####"
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>

          <div className="error-message">
            <p>{errors.general}</p>
          </div>

          <div className="button">
            {isSubmitting && <Loading />}
            <input
              type="button"
              value="Pay with Credit Card"
              disabled={isSubmitting}
              onClick={handleUserSubmit}
            />
            <p>* indicates required field</p>
            <p>
              (Clicking the button will take you to secure.cybersource.com.)
            </p>
          </div>
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
