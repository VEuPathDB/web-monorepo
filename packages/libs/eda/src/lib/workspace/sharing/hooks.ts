import { useMemo } from 'react';

export function useLoginCallbacks({
  showLoginForm,
  toggleVisible,
}: {
  showLoginForm: () => void;
  toggleVisible: (visible: boolean) => void;
}) {
  return useMemo(
    () => ({
      onPressClose: () => {
        toggleVisible(false);
      },
      onPressLogIn: () => {
        toggleVisible(false);
        showLoginForm();
      },
    }),
    [showLoginForm, toggleVisible]
  );
}
