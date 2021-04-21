import { PreferredOrganismsLink } from './lib/components/PreferredOrganismsLink';

import './Header.scss';

export default function Header() {
  return (
    <header>
      <h1 style={{ background: 'black', color: 'whitesmoke' }}>
        <code>/// ========================== \\\</code>
        <br />
        <code>||| VEUPATHDB DEVELOPMENT SITE |||</code>
        <br />
        <code>\\\ ========================== ///</code>
      </h1>
      <div
        style={{
          background: 'white',
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: '0.0625rem solid black',
          padding: '0.5em 0',
        }}
      >
        <PreferredOrganismsLink />
      </div>
    </header>
  );
}
