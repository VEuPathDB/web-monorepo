import React, { useState, useEffect, ReactNode } from 'react';
import { webAppUrl } from '../config';

import '../styles/Payment.scss';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';

const CHECKOUT_CONTAINER_ID = 'unified-checkout-container';

declare global {
  interface Window {
    VAS?: {
      UnifiedCheckout: (
        captureContext: string
      ) => Promise<UnifiedCheckoutClient>;
    };
  }
}

interface UnifiedCheckoutClient {
  createCheckout: (options?: {
    autoProcessing?: boolean;
  }) => Promise<UnifiedCheckoutInstance>;
}

interface UnifiedCheckoutInstance {
  mount: (selector: string) => Promise<string>; // resolves with transient token JWT
}

interface CaptureContextResponse {
  captureContext: string;
  referenceNumber: string;
  scriptUrl: string;
}

// The capture context response plus the amount that produced it (not
// returned by the service, but needed again when we submit the payment).
interface PaymentAttempt extends CaptureContextResponse {
  amount: string;
}

interface PaymentResultResponse {
  status: string;
  transactionId: string;
  referenceNumber: string;
}

// Statuses returned by CyberSource's Payments API that represent a
// successfully authorized (and, per completeMandate.type=CAPTURE, captured) sale.
const SUCCESS_STATUSES = ['AUTHORIZED', 'PARTIAL_AUTHORIZED'];

type Stage =
  | { name: 'entry' }
  | { name: 'loading-checkout' }
  | { name: 'awaiting-payment' }
  | { name: 'processing' }
  | { name: 'success'; result: PaymentResultResponse }
  | { name: 'declined'; result: PaymentResultResponse }
  | { name: 'error'; message: ReactNode };

async function fetchCaptureContext(
  amount: string
): Promise<CaptureContextResponse> {
  const url = webAppUrl + '/service/payment-form-context?amount=' + amount;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Pre-payment form service error');
  }
  return await response.json();
}

async function submitPayment(
  transientToken: string,
  referenceNumber: string,
  amount: string
): Promise<PaymentResultResponse> {
  const url = webAppUrl + '/service/payment-process';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transientToken, referenceNumber, amount }),
  });
  if (!response.ok) {
    throw new Error('Payment processing service error');
  }
  return await response.json();
}

// Loads the CyberSource Unified Checkout JS asset if it isn't already present
// on the page. The asset URL (test vs. production) is determined server-side
// from the deployed cybersource config, so we don't hardcode it here.
function loadUnifiedCheckoutScript(scriptUrl: string): Promise<void> {
  const existing = document.querySelector(
    `script[src="${scriptUrl}"]`
  ) as HTMLScriptElement | null;
  if (existing != null) {
    if (window.VAS != null) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Unified Checkout script'))
      );
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Unified Checkout script'));
    document.body.appendChild(script);
  });
}

export default function PaymentController() {
  const [stage, setStage] = useState<Stage>({ name: 'entry' });
  const [amount, setAmount] = useState('0.00');
  const [errorMessage, setErrorMessage] = useState<ReactNode>('');

  // Set once per payment attempt (by handleUserSubmit) and cleared on
  // retry/reset. This is deliberately NOT part of `stage`: the effect below
  // is keyed on this value so that its own setStage() calls (entry ->
  // awaiting-payment -> processing -> success/declined/error) don't change
  // its dependency and tear down/cancel itself mid-flight.
  const [captureContext, setCaptureContext] = useState<PaymentAttempt | null>(
    null
  );

  const resetToEntry = () => {
    setCaptureContext(null);
    setStage({ name: 'entry' });
  };

  // If we're showing a persisted page from a back-button navigation
  // we need to reset some state.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        resetToEntry();
      }
    }

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Once we have a capture context, load the widget and mount it. When the
  // donor finishes entering payment info in CyberSource's embedded iframe,
  // checkout.mount() resolves with a transient token (never raw card data),
  // which we forward to our backend to actually authorize/capture.
  useEffect(() => {
    if (captureContext == null) return;
    let cancelled = false;

    (async () => {
      try {
        setStage({ name: 'awaiting-payment' });

        await loadUnifiedCheckoutScript(captureContext.scriptUrl);
        if (window.VAS == null)
          throw new Error('Unified Checkout failed to load');

        const client = await window.VAS.UnifiedCheckout(
          captureContext.captureContext
        );
        const checkout = await client.createCheckout({ autoProcessing: false });
        const transientToken = await checkout.mount(
          `#${CHECKOUT_CONTAINER_ID}`
        );

        if (cancelled) return;
        setStage({ name: 'processing' });

        const result = await submitPayment(
          transientToken,
          captureContext.referenceNumber,
          captureContext.amount
        );

        if (cancelled) return;
        setStage(
          SUCCESS_STATUSES.includes(result.status)
            ? { name: 'success', result }
            : { name: 'declined', result }
        );
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setStage({
          name: 'error',
          message: (
            <>
              Something went wrong processing your payment. <br />
              Please{' '}
              <Link to="/contact-us" target="_blank">
                let us know
              </Link>{' '}
              about this.
            </>
          ),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [captureContext]);

  const handleUserSubmit = () => {
    if (stage.name !== 'entry') return;

    const amountNum: number = Number(removeCommaThousandSeparators(amount));
    if (isNaN(amountNum) || amountNum < 0.01) {
      setErrorMessage(
        <>
          You must enter a positive dollar amount. <br />
          Do not use commas for decimals.
        </>
      );
      return;
    }

    setErrorMessage('');
    setStage({ name: 'loading-checkout' });

    fetchCaptureContext(amountNum.toFixed(2))
      .then((context) => {
        setCaptureContext({ ...context, amount: amountNum.toFixed(2) });
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
        setStage({ name: 'entry' });
      });
  };

  if (stage.name === 'success') {
    return (
      <div className="payment-container">
        <h1>Thank you for your payment</h1>
        <p>
          Your payment (reference number {stage.result.referenceNumber}) was
          processed successfully.
        </p>
      </div>
    );
  }

  if (stage.name === 'declined') {
    return (
      <div className="payment-container">
        <h1>Payment Declined</h1>
        <p id="warning">
          Your card was declined (reference number{' '}
          {stage.result.referenceNumber}
          ). Please check your card details or try a different card.
        </p>
        <div className="button">
          <input type="button" value="Try Again" onClick={resetToEntry} />
        </div>
      </div>
    );
  }

  if (stage.name === 'error') {
    return (
      <div className="payment-container">
        <h1>Payment Error</h1>
        <p id="warning">{stage.message}</p>
        <div className="button">
          <input type="button" value="Try Again" onClick={resetToEntry} />
        </div>
      </div>
    );
  }

  if (stage.name === 'awaiting-payment' || stage.name === 'processing') {
    return (
      <div className="payment-container">
        <h1>Make a credit card payment based on your VEuPathDB invoice</h1>
        <p id="warning">
          Payments are processed securely by CyberSource.
          <br /> VEuPathDB does not store or have access to your credit card
          information.
        </p>
        <div id={CHECKOUT_CONTAINER_ID} />
        {stage.name === 'processing' && <Loading />}
      </div>
    );
  }

  // 'entry' and 'loading-checkout' stages show the starter form
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
          <p>{errorMessage}</p>
        </div>
        <div className="amount">
          <p>
            Please enter the amount from your invoice in USD:&nbsp;&nbsp;
            <input
              className={errorMessage ? 'hasError' : undefined}
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </p>
        </div>
        <div className="button">
          {stage.name === 'loading-checkout' && <Loading />}
          <input
            type="button"
            value="Pay with Credit Card"
            disabled={stage.name === 'loading-checkout'}
            onClick={handleUserSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function removeCommaThousandSeparators(input: string) {
  return input.replace(/,(\d{3})(?!\d)/g, '$1');
}
