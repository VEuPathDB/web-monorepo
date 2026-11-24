import * as io from 'io-ts';
import { StringArray } from './shared-fields';
import { datasetPublication } from './publications';

const datasetDependency = io.type({
  resourceIdentifier: io.string,
  resourceDisplayName: io.string,
  resourceVersion: io.string,
});

const datasetContact = io.intersection([
  io.type({
    firstName: io.string,
    lastName: io.string,
  }),
  io.partial({
    middleName: io.string,
    isPrimary: io.boolean,
    email: io.string,
    affiliation: io.string,
    country: io.string,
  })
]);

const bioprojectId = io.intersection([
  io.type({ id: io.string }),
  io.partial({ description: io.string }),
]);

const datasetHyperlink = io.intersection([
  io.type({ url: io.string }),
  io.partial({ description: io.string }),
]);

const doiReference = io.intersection([
  io.type({ doi: io.string }),
  io.partial({ description: io.string }),
]);

const externalIdentifiers = io.partial({
  dois: io.readonlyArray(doiReference),
  hyperlinks: io.readonlyArray(datasetHyperlink),
  bioprojectIds: io.readonlyArray(bioprojectId),
});

const sampleYearRange = io.type({
  start: io.number,
  end: io.number,
});

const datasetCharacteristics = io.partial({
  studyDesign: io.string,
  studyType: io.string,
  countries: StringArray,
  years: sampleYearRange,
  studySpecies: StringArray,
  outcomes: StringArray,
  associatedFactors: StringArray,
  participantAges: io.string,
  sampleTypes: StringArray,
});

const organism = io.type({
  species: io.string,
  strain: io.string,
});

const fundingAward = io.type({
  agency: io.string,
  awardNumber: io.string,
});

const linkedDataset = io.type({
  datasetUri: io.string,
  sharesRecords: io.boolean,
});

const datasetSource = io.type({
  url: io.string,
  version: io.string,
});

export const datasetMetaBase = io.intersection([
  io.type({
    installTargets: StringArray,
    name: io.string,
    summary: io.string,
    origin: io.string,
    dependencies: io.readonlyArray(datasetDependency),
  }),
  io.partial({
    description: io.string,
    publications: io.readonlyArray(datasetPublication),
    contacts: io.readonlyArray(datasetContact),
    projectName: io.string,
    programName: io.string,
    linkedDatasets: io.readonlyArray(linkedDataset),
    experimentalOrganisms: io.readonlyArray(organism),
    hostOrganism: organism,
    datasetCharacteristics: datasetCharacteristics,
    externalIdentifiers: externalIdentifiers,
    funding: io.readonlyArray(fundingAward),
    shortAttribution: io.string,
    daysForApproval: io.number,
    dataDisclaimer: io.string,
    datasetSources: io.readonlyArray(datasetSource),
  }),
]);

export type DatasetDependency = io.TypeOf<typeof datasetDependency>;
export type DatasetContact = io.TypeOf<typeof datasetContact>;
export type BioProjectId = io.TypeOf<typeof bioprojectId>;
export type DatasetHyperlink = io.TypeOf<typeof datasetHyperlink>;
export type DOIReference = io.TypeOf<typeof doiReference>;
export type ExternalIdentifiers = io.TypeOf<typeof externalIdentifiers>;
export type SampleYearRange = io.TypeOf<typeof sampleYearRange>;
export type DatasetCharacteristics = io.TypeOf<typeof datasetCharacteristics>;
export type DatasetOrganism = io.TypeOf<typeof organism>;
export type FundingAward = io.TypeOf<typeof fundingAward>;
export type LinkedDataset = io.TypeOf<typeof linkedDataset>;
export type DatasetSource = io.TypeOf<typeof datasetSource>;
export type DatasetMetaBase = io.TypeOf<typeof datasetMetaBase>;
