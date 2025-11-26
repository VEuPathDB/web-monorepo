import { useQuery } from '@tanstack/react-query';
import {
  SubscriptionGroup,
  SubscriptionGroupWithMembers,
} from '../Service/Mixins/OauthService';
import { useWdkDependenciesContext } from './WdkDependenciesEffect';

/**
 * Hook to fetch subscription groups and group info from the API with react-query caching.
 * Note: wdkService caching is all-or-nothing. We need something in between, so
 * we disable wdkService caching (in `wdkService.getSubscriptionGroups` and
 * `wdkService.getManagedGroupsForUser`) and use react-query to provide a limited-time cache.
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
  const { wdkService } = useWdkDependenciesContext();

  const { data } = useQuery({
    queryKey: ['subscriptionGroups'],
    queryFn: async () => {
      if (!wdkService) {
        throw new Error('WDK service not available');
      }
      try {
        return await wdkService.getSubscriptionGroups();
      } catch (error: any) {
        console.error('Failed to fetch subscription groups:', error);
        return undefined;
      }
    },
    enabled: wdkService != null,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return data;
}

export function useSubscriptionGroupsByLead():
  | SubscriptionGroupWithMembers[]
  | undefined {
  const { wdkService } = useWdkDependenciesContext();

  const { data } = useQuery({
    queryKey: ['subscriptionGroupsWithMembers'],
    queryFn: async () => {
      if (!wdkService) {
        throw new Error('WDK service not available');
      }
      try {
        return await wdkService.getManagedGroupsForUser();
      } catch (error: any) {
        console.error('Failed to fetch subscription groups by lead:', error);
        return undefined;
      }
    },
    enabled: wdkService != null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return data;
}
