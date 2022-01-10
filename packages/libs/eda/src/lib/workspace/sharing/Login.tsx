// Components
import { H5 } from '@veupathdb/core-components';
import { FilledButton } from '@veupathdb/core-components/dist/components/buttons';

// Definitions
import { gray } from '@veupathdb/core-components/dist/definitions/colors';

export default function Login({
  toggleVisible,
}: {
  toggleVisible: (visible: boolean) => void;
}) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 25,
      }}
    >
      <div>
        <H5
          text="Login Required"
          additionalStyles={{ marginTop: 25, marginBottom: 0 }}
        />
        <p style={{ fontSize: '.9rem', color: gray[600], marginTop: 0 }}>
          In order to share an analysis, or make it public, you'll need to login
          to your account.
        </p>
        <p style={{ fontSize: '.9rem', color: gray[600] }}>
          Please login and try again.
        </p>
      </div>

      <FilledButton
        text="Close"
        themeRole="secondary"
        onPress={() => toggleVisible(false)}
      />
    </div>
  );
}
