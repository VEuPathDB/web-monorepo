import React from 'react';
import * as persistence from 'ebrc-client/util/persistence';

// Store user consent in browser storage
// -------------------------------------

const USER_AGREED_KEY = 'agreed-to-cookie-usage';

const UserAgreedStore = {
  get: () => persistence.get(USER_AGREED_KEY, false),
  set: (value) => persistence.set(USER_AGREED_KEY, Boolean(value))
};


const privacyPolicyLink = '/a/app/static-content/privacyPolicy.html';


// Styles
// ------

const bannerStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '2em',
  fontSize: '1.2em',
  background: 'black',
  color: 'white',
  boxShadow: 'rgb(114, 114, 114) 0px -1px 1px',
  zIndex: 1000
};

const linkStyle = {
  color: '#96b1e9',
  textDecoration: 'underline',
  whiteSpace: 'nowrap'
};

const positStyle = {
  position: 'relative',
  bottom: '0.75em',
  marginLeft: '1em'
};

/**
 * Inform user of cookie usage. Display banner until user clicks agree button.
 */
export default class CookieBanner extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userAgreed: undefined,
      loading: true
    };

    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  componentDidMount() {
    this.setState({
      userAgreed: UserAgreedStore.get(),
      loading: false
    });
  }

  handleButtonClick() {
    UserAgreedStore.set(true);
    this.setState({ userAgreed: true });
  }

  render() {
    const { loading, userAgreed } = this.state;
    return loading || userAgreed ? null : (
      <div style={bannerStyle}>
        <div>
          This website requires cookies &amp; limited processing of your
          personal data in order to function properly. By clicking any link on
          this page you are giving your consent to this as outlined in our <a style={linkStyle} target="_blank" href={privacyPolicyLink}>Privacy Policy</a>.
        </div>
        <div style={positStyle}>
          <button style={linkStyle} type="button" onClick={this.handleButtonClick} className="wdk-Link">I agree, close this banner.</button>
        </div>
      </div>
    );
  }
}
