import { useWdkService } from './WdkServiceHook';
import { SubscriptionGroup } from '../Service/Mixins/OauthService';

/**
 * Hook to fetch subscription groups from the API.
 *
 * @returns undefined while loading, SubscriptionGroup[] when loaded, or undefined on error
 *
 * Usage patterns:
 * - undefined: Still loading or API error - can show loading state
 * - []: Successfully loaded but no groups available
 * - SubscriptionGroup[]: Successfully loaded with groups
 *
 * This hook is used by:
 * - UserAccountForm: Shows loading spinner when undefined
 * - UserMenu: Prevents showing wrong subscription status during load
 * - Announcements: Used for subscription-based banner logic
 */
export function useSubscriptionGroups(): SubscriptionGroup[] | undefined {
  return useWdkService(
    (wdkService) =>
      wdkService.getSubscriptionGroups().catch((error) => {
        console.error('Failed to fetch subscription groups:', error);
        return undefined;
      }),
    []
  );
}
