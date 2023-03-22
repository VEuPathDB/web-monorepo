export const SECURITY_AGREEMENT_STATUS_CHANGED = 'galaxy-terms/security-agreement-status-changed';

/**
 * Update the status of security agreement.
 */
export function updateSecurityAgreementStatus(status) {
  return { type: SECURITY_AGREEMENT_STATUS_CHANGED, payload: { status } };
}
