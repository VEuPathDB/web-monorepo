import { CSSProperties } from 'react';
import Notification from '@veupathdb/components/lib/components/widgets/Notification';

// this was defined as LIGHT_BLUE
const truncationWarningColor = '#5586BE';

const defaultContainerStyles: CSSProperties = { maxWidth: '350px' };

interface Props {
  /** The warning message; nothing is rendered when this is empty. */
  warning: string;
  /** Called when the user dismisses the notification. */
  onAcknowledge: () => void;
  containerStyles?: CSSProperties;
}

/**
 * Axis-truncation warning notification shown beneath axis range controls.
 */
export default function TruncationNotification({
  warning,
  onAcknowledge,
  containerStyles = defaultContainerStyles,
}: Props) {
  if (!warning) return null;
  return (
    <Notification
      title={''}
      text={warning}
      color={truncationWarningColor}
      onAcknowledgement={onAcknowledge}
      showWarningIcon={true}
      containerStyles={containerStyles}
    />
  );
}
