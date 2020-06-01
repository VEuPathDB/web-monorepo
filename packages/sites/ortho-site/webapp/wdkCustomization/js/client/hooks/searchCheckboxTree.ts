import { useSelector } from 'react-redux';

import { get, memoize } from 'lodash';

import { RootState } from 'wdk-client/Core/State/Types';
import { useSessionBackedState } from 'wdk-client/Hooks/SessionBackedState';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { decode, arrayOf, string } from 'wdk-client/Utils/Json';

export function useSearchTree() {
  return useSelector(
    (state: RootState) => get(state.globalData, 'searchTree') as CategoryTreeNode
  );
}

export function useSessionBackedSearchTerm(initialSearchTerm: string, key: string) {
  return useSessionBackedState(
    initialSearchTerm,
    key,
    encodeSearchTerm,
    parseSearchTerm
  );
}

export function useSessionBackedExpandedBranches(initialExpandedBranches: string[], key: string) {
  return useSessionBackedState(
    initialExpandedBranches,
    key,
    encodeExpandedBranches,
    parseExpandedBranches
  );
}

const encodeSearchTerm = (s: string) => s;
const parseSearchTerm = encodeSearchTerm;

const encodeExpandedBranches = JSON.stringify;
const parseExpandedBranches = memoize((s: string) => decode(
  arrayOf(string),
  s
));
