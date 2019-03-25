import { Decoder, combine, field, string, number, boolean } from 'wdk-client/Utils/Json';
import {AnswerSpec} from 'wdk-client/Utils/WdkModel';

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
  name: string
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

export interface UserCommentQueryStringParams {
  commentId?: string;
  stableId?: string;
  commentTargetId?: string;
  externalDbName?: string;
  externalDbVersion?: string;
  organism?: string;
  locations?: string;
  contig?: string;
  strand?: string;
}

export interface UserCommentQueryParams {
  commentId?: number;
  target?: { id: string, type: string };
  externalDatabase?: { name: string, version: string };
  organism?: string;
  locations?: string;
  contig?: string;
  strand?: string;
}

export interface UserComment extends UserCommentPostRequest {
  attachedFiles?: UserCommentAttachedFile[];
}

export interface UserCommentGetResponse {
  additionalAuthors: string[];
  attachments: { id: number, name: string, description: string, preview?: string }[];
  author: { userId: number, firstName: string, lastName: string, organization: string };
  categories: string[];
  commentDate: number;
  conceptual: boolean;
  content: string;
  digitalObjectIds: string[];
  externalDatabase?: { name: string, version: string };
  genBankAccessions: string[];
  headline: string;
  id: number;
  location?: { 
    coordinateType: string, 
    ranges: { start: number, end: number }[],
    reverse?: boolean
  };
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
