// Components
import { H5 } from '@veupathdb/coreui';
import { FilledButton } from '@veupathdb/coreui/dist/components/buttons';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

export default function Login({
  onPressClose,
  onPressLogIn,
}: {
  onPressClose: () => void;
  onPressLogIn: () => void;
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
          In order to share an analysis, or make it public, you'll need to log
          in to your account.
        </p>
        <p style={{ fontSize: '.9rem', color: gray[600] }}>
          Please log in and try again.
        </p>
      </div>

      <div style={{ display: 'flex' }}>
        <FilledButton
          text="Log In"
          themeRole="secondary"
          onPress={onPressLogIn}
        />
        <FilledButton
          text="Close"
          themeRole="secondary"
          onPress={onPressClose}
          styleOverrides={{
            container: {
              marginLeft: 10,
            },
          }}
        />
      </div>
    </div>
  );
}
