import userCommentStoreModules from '../storeModules/userCommentStoreModules';

type StoreModules = typeof userCommentStoreModules;

export type RootState = {
  [K in keyof StoreModules]: ReturnType<StoreModules[K]['reduce']>;
};

export type PubmedPreview = PubmedPreviewEntry[];

export interface PubmedPreviewEntry {
  id: string;
  title: string;
  journal?: string;
  author: string;
  url: string;
}

export interface UserCommentAttachedFileSpec {
  file: File | null;
  description: string;
}

export interface KeyedUserCommentAttachedFileSpec
  extends UserCommentAttachedFileSpec {
  id: number;
}

export interface UserCommentAttachedFile {
  id: number;
  description: string;
  name: string;
  mimeType: string;
}

export type ReviewStatus =
  | 'accepted'
  | 'adopted'
  | 'community'
  | 'not_spam'
  | 'rejected'
  | 'spam'
  | 'task'
  | 'unknown';

export interface UserCommentLocation {
  coordinateType: string;
  ranges: { start: number; end: number }[];
  reverse?: boolean;
}

// fields the user supplies
export interface UserCommentFormFields {
  content?: string;
  headline?: string;
  genBankAccessions?: string[];
  categoryIds?: number[];
  digitalObjectIds?: string[];
  pubMedIds?: string[];
  relatedStableIds?: string[];
  additionalAuthors?: string[];
  location?: UserCommentLocation;
}

// raw field content for multivalued textboxes
export interface UserCommentRawFormFields {
  coordinateType: string;
  ranges: string;
  pubMedIds: string;
  digitalObjectIds: string;
  genBankAccessions: string;
  relatedStableIds: string;
}

// fields expected by the post to create a user comment
export interface UserCommentPostRequest extends UserCommentFormFields {
  previousCommentId?: number;
  target?: { type: string; id: string };
  organism?: string;
  author?: {
    organization: string;
    userId: number;
    firstName: string;
    lastName: string;
  };
  externalDatabase?: { name: string; version: string };
}

export interface UserComment extends UserCommentPostRequest {
  attachedFiles?: UserCommentAttachedFile[];
}

export interface UserCommentGetResponse {
  additionalAuthors: string[];
  attachments: UserCommentAttachedFile[];
  author: {
    userId: number;
    firstName: string;
    lastName: string;
    organization: string;
  };
  categories: string[];
  commentDate: number;
  conceptual: boolean;
  content: string;
  digitalObjectIds: string[];
  externalDatabase?: { name: string; version: string };
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
  target: { type: string; id: string };
}

export interface UserCommentPostResponse {
  id: number;
}

export interface UserCommentAttachedFilePostResponse {
  id: number;
}
