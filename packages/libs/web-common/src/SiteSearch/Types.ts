import {
  record,
  string,
  arrayOf,
  constant,
  combine,
  Unpack,
  oneOf,
  objectOf,
  number,
  boolean,
  optional,
} from '@veupathdb/wdk-client/lib/Utils/Json';

const siteSearchCategory = record({
  name: string,
  documentTypes: arrayOf(string),
});

const siteSearchDocumentTypeField = record({
  name: string,
  displayName: string,
  // wdk search vocab term
  term: string,
  isSubtitle: boolean,
});

const siteSearchDocumentTypeBase = record({
  id: string,
  displayName: string,
  displayNamePlural: string,
  count: number,
  hasOrganismField: boolean,
  summaryFields: arrayOf(siteSearchDocumentTypeField),
  searchFields: arrayOf(siteSearchDocumentTypeField),
});

const standardSiteSearchDocumentType = combine(
  siteSearchDocumentTypeBase,
  record({
    isWdkRecordType: constant(false),
  })
);

const wdkSiteSearchDocumentType = combine(
  siteSearchDocumentTypeBase,
  record({
    isWdkRecordType: constant(true),
    wdkSearchName: string,
  })
);

const siteSearchDocumentType = oneOf(
  standardSiteSearchDocumentType,
  wdkSiteSearchDocumentType
);

const siteSearchDocument = record({
  documentType: string,
  primaryKey: arrayOf(string),
  summaryFieldData: objectOf(oneOf(string, arrayOf(string))),
  foundInFields: objectOf(arrayOf(string)),
  wdkPrimaryKeyString: optional(string),
  hyperlinkName: optional(string),
  organism: optional(string),
});

const siteSearchResults = record({
  totalCount: number,
  documents: arrayOf(siteSearchDocument),
});

export const siteSearchResponse = record({
  categories: arrayOf(siteSearchCategory),
  documentTypes: arrayOf(siteSearchDocumentType),
  organismCounts: objectOf(number),
  fieldCounts: optional(objectOf(number)),
  searchResults: siteSearchResults,
});

export type SiteSearchDocument = Unpack<typeof siteSearchDocument>;
export type SiteSearchDocumentType = Unpack<typeof siteSearchDocumentType>;
export type SiteSearchDocumentTypeField = Unpack<
  typeof siteSearchDocumentTypeField
>;
export type SiteSearchResponse = Unpack<typeof siteSearchResponse>;

export interface SiteSearchRequest {
  searchText: string;
  pagination: {
    offset: number;
    numRecords: number; // max is 50
  };
  restrictToProject?: string;
  restrictMetadataToOrganisms?: string[];
  restrictSearchToOrganisms?: string[]; // (must be subset of metadata orgs)
  documentTypeFilter?: {
    documentType: string;
    foundOnlyInFields?: string[];
  };
}
