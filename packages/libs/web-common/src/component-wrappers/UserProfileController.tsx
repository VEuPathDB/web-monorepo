import { UserProfileControllerProps as Props } from '@veupathdb/wdk-client/lib/Controllers/UserProfileController';
import { showSubscriptionProds } from '../config';

export function UserProfileController(
  DefaultComponent: React.ComponentType<Props>
) {
  return (props: Props) => {
    return (
      <DefaultComponent
        showSubscriptionProds={!!showSubscriptionProds}
        {...props}
      />
    );
  };
}
