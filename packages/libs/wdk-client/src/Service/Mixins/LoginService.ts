import { ServiceBase } from '../../Service/ServiceBase';
import * as Decode from '../../Utils/Json';
import { makeTraceid } from '../ServiceUtils';

/** This is for POST requests */
export type TryLoginResponse =
  | {
      success: true;
      redirectUrl: string;
    }
  | {
      success: false;
      message: string;
    };

/** This is for POST requests */
const tryLoginDecoder: Decode.Decoder<TryLoginResponse> = Decode.oneOf(
  Decode.combine(
    Decode.field('success', Decode.constant(true)),
    Decode.field('redirectUrl', Decode.string)
  ),
  Decode.combine(
    Decode.field('success', Decode.constant(false)),
    Decode.field('message', Decode.string)
  )
);

export default (base: ServiceBase) => {
  function tryLogin(email: string, password: string, redirectUrl: string) {
    return base.sendRequest(tryLoginDecoder, {
      method: 'post',
      path: '/login',
      body: JSON.stringify({ email, password, redirectUrl }),
    });
  }

  async function logout() {
    return fetch(`${base.serviceUrl}/logout`, {
      credentials: 'include',
      headers: {
        traceid: makeTraceid(),
      },
    });
  }

  return { tryLogin, logout };
};
