import { PreferredOrganismsSummary } from '@veupathdb/preferred-organisms/lib/components/PreferredOrganismsSummary';

export default function Header() {
  return (
    <header>
      <h1 style={{ background: 'black', color: 'whitesmoke' }}>
        {/* eslint-disable-next-line */}
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
        <PreferredOrganismsSummary />
      </div>
    </header>
  );
}
