import {
  Decoder,
  boolean,
  nullValue,
  number,
  oneOf,
  optional,
  record,
  string,
} from 'wdk-client/Utils/Json';
import {
  AnswerSpec,
  Parameter,
  ParameterValues
} from 'wdk-client/Utils/WdkModel';
import { Omit } from 'wdk-client/Core/CommonTypes';

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

export interface FilterValue { }

/**
 * Validation level performed on step.
 */
export enum StepValidationLevel {
  None = 'NONE',
  Syntactic = 'SYNTACTIC',
  Displayable = 'DISPLAYABLE',
  Semantic = 'SEMANTIC',
  Runnable = 'RUNNABLE'
}

export interface ValidStepValidation {
  isValid: true;
  level: StepValidationLevel;
}

export interface InvalidStepValidation {
  isValid: false;
  level: StepValidationLevel;
  errors: {
    general: string[];
    byKey: Record<string, string[] | undefined>;
  }
}

export interface Step extends AnswerSpec {
  customName: string;
  description: string;
  displayName: string;
  estimatedSize?: number;
  hasCompleteStepAnalyses: boolean;
  id: number;
  isFiltered: boolean;
  ownerId: number;
  recordClassName: string;
  shortDisplayName: string;
  strategyId: number;
  displayPreferences: {
    columnSelection?: string[];
    sortColumns?: { name: string; direction: 'ASC' | 'DESC' }[];
  }
  expanded: boolean;
  expandedName?: string;
  validation: ValidStepValidation | InvalidStepValidation;
}

export interface PatchStepSpec {
  customName?: string,
  expanded?: boolean, // only allowed on combiner steps
  expandedName?: string;  // only allowed on combiner steps; not shown if expand is false and the step is not nested
  displayPreferences?: Step['displayPreferences'];
}

export interface NewStepSpec extends PatchStepSpec, AnswerSpec {
}

export interface SaveStrategyOptions {
  removeOrigin: boolean;
}

export interface StrategyProperties {
  name: string,
  isSaved: boolean,
  isPublic: boolean,
  description?: string,
  savedName?: string,
}

export type EditStrategySpec = Omit<StrategyProperties, 'isSaved'>;

export interface StrategySummary extends StrategyProperties {
  nameOfFirstStep?: string;
  strategyId: number;
  rootStepId: number;
  estimatedSize?: number; // optional; may be null if step was modified but not rerun
  isValid: boolean;
  lastModified: string;
  createdTime: string;
  releaseVersion?: string;
  recordClassName: string | null; // optional; may be null if root step is invalid
  signature: string;
  author?: string;
  organization?: string;
  isDeleted: boolean;
  isExample: boolean;
}

export interface StrategyDetails extends StrategySummary {
  stepTree: StepTree;
  steps: Record<number, Step>;
}

export const strategySummaryDecoder: Decoder<StrategySummary> = record({
  author: optional(string),
  description: string,
  estimatedSize: optional(number),
  lastModified: string,
  createdTime: string,
  name: string,
  organization: optional(string),
  recordClassName: oneOf(nullValue, string),
  signature: string,
  strategyId: number,
  releaseVersion: optional(string),
  isDeleted: boolean,
  isPublic: boolean,
  isSaved: boolean,
  isValid: boolean,
  rootStepId: number,
  isExample: boolean
});

export interface StepTree {
  stepId: number,
  primaryInput?: StepTree,
  secondaryInput?: StepTree
}

export interface NewStrategySpec extends StrategyProperties {
  stepTree: StepTree
}

export interface DuplicateStrategySpec {
  sourceStrategySignature: string
}

export interface DeleteStrategySpec {
  strategyId: number,
  isDeleted: boolean
}

// TODO: should be factored to Ebrc something
export type PubmedPreview = PubmedPreviewEntry[];

export interface PubmedPreviewEntry {
  id: string,
  title: string,
  journal?: string,
  author: string,
  url: string
}

export interface UserCommentAttachedFileSpec {
  file: File | null,
  description: string
}

export interface KeyedUserCommentAttachedFileSpec extends UserCommentAttachedFileSpec {
  id: number
}

export interface UserCommentAttachedFile {
  id: number,
  description: string,
  name: string,
  mimeType: string
}

export type ReviewStatus =
  "accepted" |
  "adopted" |
  "community" |
  "not_spam" |
  "rejected" |
  "spam" |
  "task" |
  "unknown";

export interface UserCommentLocation {
  coordinateType: string,
  ranges: { start: number, end: number }[],
  reverse?: boolean
}

// fields the user supplies
export interface UserCommentFormFields {
  content?: string,
  headline?: string,
  genBankAccessions?: string[],
  categoryIds?: number[],
  digitalObjectIds?: string[],
  pubMedIds?: string[],
  relatedStableIds?: string[],
  additionalAuthors?: string[],
  location?: UserCommentLocation
}

// raw field content for multivalued textboxes
export interface UserCommentRawFormFields {
  coordinateType: string;
  ranges: string;
  pubMedIds: string;
  digitalObjectIds: string;
  genBankAccessions: string,
  relatedStableIds: string;
}

// fields expected by the post to create a user comment
export interface UserCommentPostRequest extends UserCommentFormFields {
  previousCommentId?: number,
  target?: { type: string, id: string },
  organism?: string,
  author?: { organization: string, userId: number, firstName: string, lastName: string },
  externalDatabase?: { name: string, version: string }
}

export interface UserComment extends UserCommentPostRequest {
  attachedFiles?: UserCommentAttachedFile[];
}

export interface UserCommentGetResponse {
  additionalAuthors: string[];
  attachments: UserCommentAttachedFile[];
  author: { userId: number, firstName: string, lastName: string, organization: string };
  categories: string[];
  commentDate: number;
  conceptual: boolean;
  content: string;
  digitalObjectIds: string[];
  externalDatabase?: { name: string, version: string };
  genBankAccessions: string[];
  headline?: string;
  id: number;
  location?: UserCommentLocation;
  project: {
    name: string;
    version: string;
  };
  organism?: string;
  pubMedRefs: PubmedPreview;
  relatedStableIds: string[];
  reviewStatus: ReviewStatus;
  sequence?: string;
  target: { type: string, id: string };
}

export interface UserCommentPostResponse  {id: number};

export interface UserCommentAttachedFilePostResponse  {id: number};

export function extractParamValues(parameters: Parameter[], initialParams: ParameterValues = {}, step?: Step){
  return parameters.reduce(function(values, { name, initialDisplayValue, type }) {
    return Object.assign(values, {
      [name]: (
        (step == null && type === 'input-step')
        ? ''
        : (name in initialParams)
          ? initialParams[name]
          : initialDisplayValue
      )
    });
  }, {} as ParameterValues);
}
