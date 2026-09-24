import React, { useState, useEffect, ReactNode } from 'react';
import { useHistory } from 'react-router';
import { webAppUrl } from '../config';

import '../styles/Payment.scss';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';

const CHECKOUT_CONTAINER_ID = 'unified-checkout-container';

declare global {
  interface Window {
    // VAS is a CyberSource JS object (Visa Acceptance Solutions)
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
  // URL and SRI hash of the Unified Checkout JS asset, extracted server-side
  // from the capture context JWT itself (CyberSource requires these not be
  // hardcoded, since they are unique to each transaction).
  scriptUrl: string;
  scriptIntegrity: string | null;
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

// The status CyberSource returns for an actual card decline. Every other
// non-success status (pending review, authentication required, a gateway or
// processor error, etc.) is a real outcome too, but isn't a decline -- so it
// shouldn't be reported to the payer as "your card was declined."
const DECLINE_STATUSES = ['DECLINED'];

type Stage =
  | { name: 'entry' }
  | { name: 'loading-checkout' }
  | { name: 'awaiting-payment' }
  | { name: 'processing' }
  | { name: 'success'; result: PaymentResultResponse }
  | { name: 'declined'; result: PaymentResultResponse }
  // `retryable` is false once submitPayment() has actually been called: if
  // that request fails without a clear response (e.g. the connection drops),
  // we can't tell whether the backend already authorized/captured the
  // charge, so we must not let the payer blindly start a new attempt (which
  // would submit a second, independent charge for the same amount).
  | { name: 'error'; message: ReactNode; retryable: boolean };

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
// on the page. Per CyberSource's docs, scriptUrl/scriptIntegrity must come
// from the capture context JWT (never hardcoded) since they're unique to
// each transaction; the script tag must carry a matching `integrity` (SRI)
// attribute and `crossorigin="anonymous"`, or the browser will refuse to
// execute the script:
// https://developer.cybersource.com/docs/cybs/en-us/unified-checkout/developer/all/rest/unified-checkout/uc-getting-started-cs-setup-intro/uc-getting-started-cs-js-library-intro.html
// Caches the in-flight load promise per scriptUrl so concurrent/duplicate
// calls share one <script> tag instead of racing to add more, and so a
// retry after a failed load always attaches its listeners to a script tag
// whose 'load'/'error' event hasn't fired yet (a plain DOM query for an
// "existing" tag can't tell whether that tag already finished loading or
// erroring, which left retries hanging forever).
const scriptLoadPromises = new Map<string, Promise<void>>();

function loadUnifiedCheckoutScript(
  scriptUrl: string,
  scriptIntegrity: string | null
): Promise<void> {
  if (window.VAS != null) return Promise.resolve();

  const cached = scriptLoadPromises.get(scriptUrl);
  if (cached != null) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    document
      .querySelectorAll(`script[src="${scriptUrl}"]`)
      .forEach((node) => node.remove());

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    if (scriptIntegrity) script.integrity = scriptIntegrity;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('Failed to load Unified Checkout script'));
    };
    document.body.appendChild(script);
  });

  // Don't cache a failed load: the next attempt should get a fresh tag.
  promise.catch(() => scriptLoadPromises.delete(scriptUrl));
  scriptLoadPromises.set(scriptUrl, promise);

  return promise;
}

// wrap functional payment controller in a class component to support title method API
export default class PaymentController extends PageController {
  getTitle() {
    return 'Submit Payment';
  }

  renderView() {
    return <PaymentControllerFunction {...this.props} />;
  }
}

function PaymentControllerFunction() {
  const history = useHistory();
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
    // Becomes true once submitPayment() has been called; from that point on
    // a failure is ambiguous (the charge may have gone through) and must not
    // be silently retried. See the `retryable` comment on the 'error' stage.
    let paymentSubmitted = false;

    (async () => {
      try {
        setStage({ name: 'awaiting-payment' });

        await loadUnifiedCheckoutScript(
          captureContext.scriptUrl,
          captureContext.scriptIntegrity
        );
        // A back-button reset (see handlePageShow above) can fire while any
        // of these SDK calls is in flight, tearing down the
        // #unified-checkout-container div. Re-check `cancelled` at each step
        // so we never hand the SDK a selector that's already been unmounted.
        if (cancelled) return;
        if (window.VAS == null)
          throw new Error('Unified Checkout failed to load');

        const client = await window.VAS.UnifiedCheckout(
          captureContext.captureContext
        );
        if (cancelled) return;
        const checkout = await client.createCheckout({ autoProcessing: false });
        if (cancelled) return;
        const transientToken = await checkout.mount(
          `#${CHECKOUT_CONTAINER_ID}`
        );

        if (cancelled) return;
        setStage({ name: 'processing' });

        paymentSubmitted = true;
        const result = await submitPayment(
          transientToken,
          captureContext.referenceNumber,
          captureContext.amount
        );

        if (cancelled) return;
        if (SUCCESS_STATUSES.includes(result.status)) {
          setStage({ name: 'success', result });
        } else if (DECLINE_STATUSES.includes(result.status)) {
          setStage({ name: 'declined', result });
        } else {
          // A definitive, non-ambiguous outcome came back from the backend
          // (unlike the catch block below), so it's safe to let the payer
          // retry -- we just don't have a specific, accurate message for
          // this status, so avoid implying it was a card-level decline.
          setStage({
            name: 'error',
            retryable: true,
            message: (
              <>
                Your payment could not be completed (status: {result.status},
                reference number {result.referenceNumber}). <br />
                Please{' '}
                <Link to="/contact-us" target="_blank">
                  contact us
                </Link>{' '}
                for help completing your payment.
              </>
            ),
          });
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setStage({
          name: 'error',
          retryable: !paymentSubmitted,
          message: paymentSubmitted ? (
            <>
              We couldn't confirm whether your payment went through (reference
              number {captureContext.referenceNumber}). <br />
              Please{' '}
              <Link to="/contact-us" target="_blank">
                contact us
              </Link>{' '}
              to check your payment status before trying again, so you aren't
              charged twice.
            </>
          ) : (
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

  // Once a payment succeeds, move the payer to their permanent, bookmarkable
  // receipt page instead of showing a one-off inline message.
  useEffect(() => {
    if (stage.name !== 'success') return;
    history.push(
      '/payment/' + encodeURIComponent(stage.result.referenceNumber)
    );
  }, [stage, history]);

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
    // Redirecting to /payment/{referenceNumber}; see the useEffect above.
    return (
      <div className="payment-container">
        <Loading />
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
        {stage.retryable && (
          <div className="button">
            <input type="button" value="Try Again" onClick={resetToEntry} />
          </div>
        )}
      </div>
    );
  }

  if (stage.name === 'awaiting-payment' || stage.name === 'processing') {
    return (
      <div className="payment-container">
        <h1>Make a credit card payment based on your VEuPathDB invoice</h1>
        <p id="warning">
          Payments are processed securely by CyberSource.
          <br />
          <b>
            VEuPathDB does not store or have access to your credit card
            information.
          </b>
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
        <br />
        <b>
          VEuPathDB does not store or have access to your credit card
          information.
        </b>
        <br />
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
