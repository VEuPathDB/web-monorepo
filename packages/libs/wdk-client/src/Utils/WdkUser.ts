import { Decoder, combine, field, string, number, boolean } from './Json';
import {AnswerSpec} from './WdkModel';

export interface User {
  id: number;
  email: string;
  isGuest: boolean;
  properties: Record<string,string>
}

export type PreferenceScope = "global" | "project";

export type UserPreferences = Record<PreferenceScope, Record<string, string>>;

export interface UserWithPrefs {
  user: User;
  preferences: UserPreferences;
}

export type UserPredicate = (user: User) => boolean;

export interface Step {
  answerSpec: AnswerSpec;
  customName: string;
  description: string;
  displayName: string;
  estimatedSize: number;
  hasCompleteStepAnalyses: boolean;
  id: number;
  ownerId: number;
  recordClassName: string;
  shortDisplayName: string;
  strategyId: number;
}

export interface Strategy {
  author: string;
  estimatedSize: number;
  isDeleted: boolean;
  isPublic: boolean;
  isSaved: boolean;
  isValid: boolean;
  lastModified: string;
  latestStepId:	number;
  name: string;
  organization: string;
  recordClassName: string;
  signature: string;
  strategyId: number;
}

export const strategyDecoder: Decoder<Strategy> = combine(
  combine(
    field('author', string),
    field('estimatedSize', number),
    field('lastModified', string),
    field('latestStepId',	number),
    field('name', string),
    field('organization', string),
    field('recordClassName', string),
    field('signature', string),
    field('strategyId', number),
  ),
  combine(
    field('isDeleted', boolean),
    field('isPublic', boolean),
    field('isSaved', boolean),
    field('isValid', boolean),
  )
)