export const SECURITY_AGREEMENT_STATUS_CHANGED =
  'galaxy-terms/security-agreement-status-changed';

// Action type interfaces
export interface SecurityAgreementStatusChangedAction {
  type: typeof SECURITY_AGREEMENT_STATUS_CHANGED;
  payload: {
    status: boolean;
  };
}

/**
 * Update the status of security agreement.
 */
export function updateSecurityAgreementStatus(
  status: boolean
): SecurityAgreementStatusChangedAction {
  return { type: SECURITY_AGREEMENT_STATUS_CHANGED, payload: { status } };
}
