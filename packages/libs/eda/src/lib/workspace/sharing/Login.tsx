// Components
import { H5 } from '@veupathdb/coreui';
import {
  FilledButton,
  OutlinedButton,
} from '@veupathdb/coreui/dist/components/buttons';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';

export default function Login({
  onPressClose,
  onPressLogIn,
  showCloseButton = true,
}: {
  onPressClose: () => void;
  onPressLogIn: () => void;
  showCloseButton?: boolean;
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
          themeRole="primary"
          onPress={onPressLogIn}
        />
        {showCloseButton && (
          <OutlinedButton
            text="Close"
            themeRole="primary"
            onPress={onPressClose}
            styleOverrides={{
              container: {
                marginLeft: 10,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
