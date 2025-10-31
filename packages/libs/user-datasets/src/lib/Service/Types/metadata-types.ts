import * as io from "io-ts";

export const datasetType = io.type({
  name: io.string,
  displayName: io.string,
  version: io.string,
  category: io.string
});
export type DatasetType = io.TypeOf<typeof datasetType>;

export const visibilityEnum = io.union([
  io.literal("private"),
  io.literal("protected"),
  io.literal("public"),
  io.literal("controlled"),
]);
export type DatasetVisibility = io.TypeOf<typeof visibilityEnum>;

const dependency = io.type({
  resourceIdentifier: io.string,
  resourceDisplayName: io.string,
  resourceVersion: io.string,
});
export type DatasetDependency = io.TypeOf<typeof dependency>;

export const publicationTypeEnum = io.union([
  io.literal("pmid"),
  io.literal("doi"),
]);
export type PublicationType = io.TypeOf<typeof publicationTypeEnum>;

export const publication = io.intersection([
  io.type({
    identifier: io.string,
    type: publicationTypeEnum,
  }),
  io.partial({
    citation: io.string,
    isPrimary: io.boolean,
  }),
]);
export type DatasetPublication = io.TypeOf<typeof publication>;

export const contact = io.partial({
  firstName: io.string,
  middleName: io.string,
  lastName: io.string,
  email: io.string,
  isPrimary: io.boolean,
  affiliation: io.string,
  country: io.string,
});
export type DatasetContact = io.TypeOf<typeof contact>;

export const linkedDataset = io.type({
  datasetUri: io.string,
  sharesRecords: io.boolean,
});
export type LinkedDataset = io.TypeOf<typeof linkedDataset>;

export const organism = io.type({
  species: io.string,
  strain: io.string,
});
export type DatasetOrganism = io.TypeOf<typeof organism>;

export const yearRange = io.type({
  start: io.number,
  end: io.number,
});
export type StudyYearRange = io.TypeOf<typeof yearRange>;

export const characteristics = io.partial({
  studyDesign: io.string,
  studyType: io.string,
  countries: io.array(io.string),
  years: yearRange,
  studySpecies: io.array(io.string),
  diseases: io.array(io.string),
  associatedFactors: io.array(io.string),
  participantAges: io.string,
  sampleTypes: io.array(io.string),
});
export type DatasetCharacteristics = io.TypeOf<typeof characteristics>;

export const doi = io.intersection([
  io.type({ doi: io.string }),
  io.partial({ description: io.string }),
]);
export type DoiRef = io.TypeOf<typeof doi>;

export const hyperlink = io.intersection([
  io.type({ url: io.string }),
  io.partial({ description: io.string }),
]);
export type DatasetHyperlink = io.TypeOf<typeof hyperlink>;

export const bioprojectId = io.intersection([
  io.type({ id: io.string }),
  io.partial({ description: io.string }),
]);
export type BioprojectIDRef = io.TypeOf<typeof bioprojectId>;

export const externalIdentifiers = io.partial({
  dois: io.array(doi),
  hyperlinks: io.array(hyperlink),
  bioprojectIds: io.array(bioprojectId),
});
export type ExternalIdentifiers = io.TypeOf<typeof externalIdentifiers>;

export const fundingAward = io.type({
  agency: io.string,
  awardNumber: io.string,
});
export type DatasetFundingAward = io.TypeOf<typeof fundingAward>;

const revisionActionEnum = io.union([
  io.literal("create"),
  io.literal("extend"),
  io.literal("revise"),
]);

const revision = io.type({
  action: revisionActionEnum,
  timestamp: io.string,
  revisionId: io.string,
  revisionNote: io.string,
  fileListUrl: io.string,
});
export type DatasetRevision = io.TypeOf<typeof revision>;

export const revisionHistory = io.type({
  originalId: io.string,
  revisions: io.array(revision),
});
export type DatasetRevisionHistory = io.TypeOf<typeof revisionHistory>;

export const baseMetadata = io.intersection([
  io.type({
    installTargets: io.array(io.string),
    name: io.string,
    summary: io.string,
    dependencies: io.array(dependency),
  }),
  io.partial({
    description: io.string,
    publications: io.array(publication),
    contacts: io.array(contact),
    projectName: io.string,
    programName: io.string,
    linkedDatasets: io.array(linkedDataset),
    experimentalOrganism: organism,
    hostOrganism: organism,
    characteristics,
    externalIdentifiers,
    funding: io.array(fundingAward),
    shortAttribution: io.string,
  }),
]);

/**
 * Common dataset metadata for datasets after they have been imported by VDI and
 * now have additional generated metadata fields.
 */
export const importedBaseMetadata = io.intersection([
  baseMetadata,
  io.type({
    datasetId: io.string,
    created: io.string,
    origin: io.string,
    type: datasetType,
    shortName: io.string,
  }),
  io.partial({
    sourceUrl: io.string,
    revisionHistory: revisionHistory,
  })
]);
