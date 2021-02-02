import { createContext } from 'react';
import { EdaClient } from '../api/eda-api';
import { useNonNullableContext } from './useNonNullableContext';

export const EdaClientContext = createContext<EdaClient | undefined>(undefined);

export function useEdaApi() {
  return useNonNullableContext(EdaClientContext);
}