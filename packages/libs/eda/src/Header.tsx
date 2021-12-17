import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { endpoint } from './constants';

export default function Header() {
  const [showLoginForm, setShowLoginForm] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [user, setUser] = React.useState<User>();
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  React.useEffect(() => {
    wdkService.getCurrentUser().then(setUser);
  }, [wdkService]);

  async function login() {
    setErrorMsg('');
    const response = await wdkService.tryLogin(email, pwd, '');
    if (response.success) {
      window.location.reload();
    } else {
      setErrorMsg(response.message);
    }
  }

  async function logout() {
    await fetch(`${endpoint}/logout`, {
      credentials: 'include',
    });
    window.location.assign('/');
  }

  return (
    <h1 style={{ background: 'black', color: 'whitesmoke' }}>
      {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
      <code>/// ========================== \\\</code>
      <br />
      <code>||| VEUPATHDB DEVELOPMENT SITE |||</code>
      <br />
      <code>\\\ ========================== ///</code>
      <div
        style={{ fontSize: '1rem', padding: '1em 1em 0', position: 'relative' }}
      >
        {user == null ? (
          <>Loading user...</>
        ) : user.isGuest ? (
          <>
            <button
              type="button"
              className="link"
              style={{ color: 'whitesmoke' }}
              onClick={() => setShowLoginForm(true)}
            >
              Login
            </button>
          </>
        ) : (
          <button
            type="button"
            className="link"
            style={{ color: 'whitesmoke' }}
            onClick={() => logout()}
          >
            Logout ({user.email})
          </button>
        )}
        {showLoginForm && (
          <div
            style={{
              position: 'absolute',
              background: 'black',
              zIndex: 100,
              padding: '1em',
              left: 0,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
            >
              <div>
                <label>
                  Username:{' '}
                  <input
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ color: 'black', width: '100%' }}
                    type="text"
                  />
                </label>
              </div>
              <div>
                <label>
                  Password:{' '}
                  <input
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    style={{ color: 'black', width: '100%' }}
                    type="password"
                  />
                </label>
              </div>
              <div
                style={{
                  paddingTop: '1em',
                  fontSize: '.85em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'end',
                }}
              >
                <div>
                  <button style={{ fontSize: '1em' }} type="submit">
                    Submit
                  </button>{' '}
                  &nbsp;
                  <button
                    style={{ fontSize: '1em' }}
                    type="button"
                    onClick={() => setShowLoginForm(false)}
                  >
                    Cancel
                  </button>
                </div>
                <Link
                  to="/user/registration"
                  style={{ color: 'whitesmoke' }}
                  onClick={() => setShowLoginForm(false)}
                >
                  Register
                </Link>
              </div>
              <div
                style={{ color: 'red', fontSize: '.8em', paddingTop: '.5em' }}
              >
                {errorMsg}
              </div>
            </form>
          </div>
        )}
      </div>
    </h1>
  );
}
