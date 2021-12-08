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
    <div>
      <H5
        text="Login Required"
        additionalStyles={{ marginTop: 25, marginBottom: 0 }}
      />
      <p style={{ fontSize: '.9rem', color: gray[600], marginTop: 0 }}>
        In order to share an analyis, you'll need to login to your account.
      </p>
      <p style={{ fontSize: '.9rem', color: gray[600] }}>
        Please login and then try again.
      </p>

      <FilledButton
        text="Close"
        themeRole="secondary"
        onPress={() => toggleVisible(false)}
      />
    </div>
  );
}
