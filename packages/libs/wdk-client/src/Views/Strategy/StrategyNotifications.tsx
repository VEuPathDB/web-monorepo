import React, { useEffect, useCallback } from 'react';

import { useHistory } from 'react-router-dom';

import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';

import DismissButton from '@veupathdb/coreui/dist/components/notifications/DismissButton';

import { enqueueSnackbar } from 'wdk-client/Actions/NotificationActions';
import { Link } from 'wdk-client/Components';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';

import './StrategyNotifications.css';

export function enqueueAddStepToBasketNotificationAction(
  step: Step,
  recordClass: RecordClass
) {
  return enqueueStrategyNotificationAction(
    <div>
      The {step.estimatedSize === 1
        ? recordClass.displayName
        : recordClass.displayNamePlural
      } in step "{step.customName}" {
        step.estimatedSize === 1 ? 'was' : 'were'
      } added to{' '}
      <Link to="/workspace/basket">
        My Baskets
      </Link>
    </div>,
    {
      key: `add-step-${step.id}-to-basket-${Date.now()}`,
      variant: 'success',
      persist: true,
    }
  );
}

export function enqueueStrategyNotificationAction(
  message: SnackbarMessage,
  options: OptionsObject,
) {
  const defaultOptions: OptionsObject = {
    anchorOrigin: {
      horizontal: 'center',
      vertical: 'top',
    },
    action: (key) => (
      <StrategyNotificationAction
        notificationKey={key}
        offerDismissButton={options.persist}
      />
    ),
  };

  return enqueueSnackbar(
    message,
    {
      ...defaultOptions,
      ...options,
    }
  );
}

interface StrategyNotificationActionProps {
  notificationKey: SnackbarKey;
  offerDismissButton?: boolean;
}

function StrategyNotificationAction({
  notificationKey,
  offerDismissButton,
}: StrategyNotificationActionProps) {
  const { closeSnackbar } = useSnackbar();

  const history = useHistory();

  const closeAssociatedSnackbar = useCallback(() => {
    closeSnackbar(notificationKey);
  }, [closeSnackbar, notificationKey]);

  useEffect(() => {
    return history.listen((location) => {
      if (!location.pathname.startsWith('/workspace/strategies')) {
        closeAssociatedSnackbar();
      }
    });
  }, [closeAssociatedSnackbar]);

  return offerDismissButton
    ? <DismissButton
        className="link"
        onClick={closeAssociatedSnackbar}
        buttonText='Dismiss notification'
      />
    : null;
}
