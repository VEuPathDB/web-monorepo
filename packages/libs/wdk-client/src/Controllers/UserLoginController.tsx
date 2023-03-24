import { useEffect } from 'react';
import { connect } from 'react-redux';
import { showLoginForm } from '../Actions/UserSessionActions';

interface Props {
  destination?: string;
  showLoginForm: (destination?: string) => void;
}

function UserLoginController(props: Props) {
  useEffect(() => {
    props.showLoginForm(props.destination);
  }, []);
  return null;
}

export default connect(null, { showLoginForm })(UserLoginController);
