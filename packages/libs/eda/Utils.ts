import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

export const cx = makeClassNameHelper('EDAWorkspace');

/**
 * Attributes that appear in the heading. They will appear in the order specified here.
 */
export const SUMMARY_ATTRIBUTES = [
  'Years',
  'Study_Design',
  'Participant_Type',
  'disease',
] as const;
