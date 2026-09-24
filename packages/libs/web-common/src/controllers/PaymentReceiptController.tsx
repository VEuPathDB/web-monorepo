import React from 'react';
import { webAppUrl } from '../config';

import '../styles/PaymentReceipt.scss';
import { Link, Loading } from '@veupathdb/wdk-client/lib/Components';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';

// Shape returned by GET /service/payment/{referenceNumber} (format=JSON, the
// default) -- mirrors the fields persisted by the backend's Payment class.
// Everything but referenceNumber is optional since the server omits unset
// fields rather than serializing them as null.
interface PaymentReceipt {
  referenceNumber: string;
  paymentDateTimeISO8601?: string;
  amount?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  email?: string;
}

type FetchResult =
  | { status: 'loaded'; payment: PaymentReceipt }
  | { status: 'error' };

interface Props {
  referenceNumber: string;
}

async function fetchPaymentReceipt(
  referenceNumber: string
): Promise<PaymentReceipt> {
  const url =
    webAppUrl + '/service/payment/' + encodeURIComponent(referenceNumber);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Payment receipt service error');
  }
  return await response.json();
}

export default function PaymentReceiptController({ referenceNumber }: Props) {
  useSetDocumentTitle('Payment Receipt');

  const { value } = usePromise<FetchResult>(async () => {
    try {
      const payment = await fetchPaymentReceipt(referenceNumber);
      return { status: 'loaded', payment };
    } catch (error) {
      console.error(error);
      return { status: 'error' };
    }
  }, [referenceNumber]);

  const downloadUrl =
    webAppUrl +
    '/service/payment/' +
    encodeURIComponent(referenceNumber) +
    '?format=PDF';

  if (value == null) {
    return (
      <div className="payment-container payment-receipt">
        <Loading />
      </div>
    );
  }

  if (value.status === 'error') {
    return (
      <div className="payment-container payment-receipt">
        <h1>Payment Receipt</h1>
        <p id="warning">
          We could not find a payment with reference number {referenceNumber}.
          Please{' '}
          <Link to="/contact-us" target="_blank">
            let us know
          </Link>{' '}
          if you believe this is an error.
        </p>
      </div>
    );
  }

  const { payment } = value;
  const fullName = [payment.firstName, payment.lastName]
    .filter(Boolean)
    .join(' ');
  const cityState = [payment.city, payment.state].filter(Boolean).join(', ');
  const cityStateZip = [cityState, payment.postalCode]
    .filter(Boolean)
    .join(' ');
  const formattedDate = payment.paymentDateTimeISO8601
    ? new Date(payment.paymentDateTimeISO8601).toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : undefined;
  const hasBillingInfo = Boolean(
    fullName || payment.address1 || cityStateZip || payment.email
  );

  return (
    <div className="payment-container payment-receipt">
      <h1>Payment Receipt</h1>
      <p>
        Thank you for your payment to VEuPathDB. You can bookmark this page for
        future reference.
      </p>
      <p>
        For questions about this payment or your subscription, contact{' '}
        <a href="mailto:subscriptions@VEuPathDB.org">
          subscriptions@VEuPathDB.org
        </a>
        .
      </p>

      <div className="receipt-details">
        <div className="receipt-row">
          <span className="label">Reference Number</span>
          <span className="value">{payment.referenceNumber}</span>
        </div>
        {formattedDate && (
          <div className="receipt-row">
            <span className="label">Date</span>
            <span className="value">{formattedDate}</span>
          </div>
        )}
        {payment.amount && (
          <div className="receipt-row">
            <span className="label">Amount</span>
            <span className="value">${payment.amount}</span>
          </div>
        )}
      </div>

      {hasBillingInfo && (
        <div className="receipt-billing">
          <h2>Billed To</h2>
          {fullName && <p>{fullName}</p>}
          {payment.address1 && <p>{payment.address1}</p>}
          {payment.address2 && <p>{payment.address2}</p>}
          {cityStateZip && <p>{cityStateZip}</p>}
          {payment.country && <p>{payment.country}</p>}
          {payment.email && <p>{payment.email}</p>}
        </div>
      )}

      <div className="button">
        <a className="download-receipt" href={downloadUrl}>
          <i className="fa fa-download" /> Download PDF
        </a>
      </div>
    </div>
  );
}
