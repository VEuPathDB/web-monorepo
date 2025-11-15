import { SECURITY_AGREEMENT_STATUS_CHANGED } from '../actioncreators/GalaxyTermsActionCreators';

// State interface
export interface GalaxyTermsState {
  securityAgreementStatus: boolean;
}

// Action interface
interface SecurityAgreementStatusChangedAction {
  type: typeof SECURITY_AGREEMENT_STATUS_CHANGED;
  payload: {
    status: boolean;
  };
}

type GalaxyTermsAction = SecurityAgreementStatusChangedAction;

const initialState: GalaxyTermsState = {
  securityAgreementStatus: false,
};

export const key = 'galaxyTerms';

export function reduce(
  state: GalaxyTermsState = initialState,
  action: GalaxyTermsAction
): GalaxyTermsState {
  switch (action.type) {
    case SECURITY_AGREEMENT_STATUS_CHANGED:
      return {
        ...state,
        securityAgreementStatus: action.payload.status,
      };
    default:
      return state;
  }
}
