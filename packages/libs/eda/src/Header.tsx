import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { DevLoginFormContext } from '.';
import { wdkEndpoint } from './constants';

const buttonLinkStyle = {
  color: 'whitesmoke',
  background: 'transparent',
  border: 'none',
  fontWeight: 500,
};

const navBarLinkStyle = {
  color: 'whitesmoke',
  fontWeight: 500,
  fontSize: '1rem',
  margin: '0 1em',
};

export default function Header() {
  const { loginFormVisible, setLoginFormVisible } =
    React.useContext(DevLoginFormContext);
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
    await fetch(`${wdkEndpoint}/logout`, {
      credentials: 'include',
    });
    window.location.assign('/');
  }

  return (
    <h1
      style={{
        background: 'black',
        color: 'whitesmoke',
        margin: 0,
        fontSize: '2.5em',
        fontWeight: 400,
        textAlign: 'left',
      }}
    >
      {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
      <code>/// ========================== \\\</code>
      <br />
      <code>||| VEUPATHDB DEVELOPMENT SITE |||</code>
      <br />
      <code>\\\ ========================== ///</code>
      <div style={{ display: 'flex', marginTop: '0.5em' }}>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/eda" style={navBarLinkStyle}>
            My analyses
          </Link>
          <Link to="/eda/public" style={navBarLinkStyle}>
            Public analyses
          </Link>
          <Link to="/eda/studies" style={navBarLinkStyle}>
            All studies
          </Link>
        </nav>
        <div
          style={{
            fontSize: '1rem',
            position: 'relative',
            flexGrow: 1,
            textAlign: 'end',
            paddingRight: '1em',
          }}
        >
          {user == null ? (
            <>Loading user...</>
          ) : user.isGuest ? (
            <>
              <button
                type="button"
                style={buttonLinkStyle}
                onClick={() => setLoginFormVisible(true)}
              >
                Log In
              </button>
            </>
          ) : (
            <button
              type="button"
              style={buttonLinkStyle}
              onClick={() => logout()}
            >
              Log Out ({user.email})
            </button>
          )}
          {loginFormVisible && (
            <div
              style={{
                position: 'absolute',
                background: 'black',
                zIndex: 100,
                padding: '1em',
                right: 0,
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
                    <button
                      style={{ fontSize: '1em', color: 'black' }}
                      type="submit"
                    >
                      Submit
                    </button>{' '}
                    &nbsp;
                    <button
                      style={{ fontSize: '1em', color: 'black' }}
                      type="button"
                      onClick={() => setLoginFormVisible(false)}
                    >
                      Cancel
                    </button>
                  </div>
                  <Link
                    to="/user/registration"
                    style={{ color: 'whitesmoke' }}
                    onClick={() => setLoginFormVisible(false)}
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
      </div>
    </h1>
  );
}
