import * as io from 'io-ts';
import { StringArray } from './shared/shared-fields';
import { ccServerErrorBody, simpleContainerCoreErrorBody } from './shared/error-responses';

const datasetOrganism = io.type({
  species: io.string,
  strain: io.string,
});

const datasetMetadata = io.intersection([
  io.type({
    type: io.type({
      name: io.string,
      version: io.string,
    }),
    installTargets: StringArray,
    visibility: io.union([
      io.literal('private'),
      io.literal('protected'),
      io.literal('public'),
    ]),
    owner: io.number,
    name: io.string,
    summary: io.string,
    origin: io.string,
    created: io.string,
    daysForApproval: io.number,
  }),
  io.partial({
    description: io.string,
    sourceUrl: io.string,
    dependencies: io.readonlyArray(
      io.type({
        resourceIdentifier: io.string,
        resourceVersion: io.string,
        resourceDisplayName: io.string,
      })
    ),
    publications: io.readonlyArray(
      io.intersection([
        io.type({
          identifier: io.string,
          type: io.union([io.literal('pmid'), io.literal('doi')]),
          citation: io.string,
        }),
        io.partial({
          isPrimary: io.boolean,
        }),
      ]),
    ),
    contacts: io.readonlyArray(
      io.intersection([
        io.type({
          firstName: io.string,
          lastName: io.string,
          isPrimary: io.boolean,
        }),
        io.partial({
          middleName: io.string,
          email: io.string,
          affiliation: io.string,
          country: io.string,
        }),
      ])
    ),
    shortAttribution: io.string,
    projectName: io.string,
    programName: io.string,
    linkedDatasets: io.readonlyArray(
      io.type({
        datasetUri: io.string,
        sharesRecords: io.boolean,
      })
    ),
    experimentalOrganisms: io.readonlyArray(datasetOrganism),
    hostOrganism: datasetOrganism,
    datasetCharacteristics: io.partial({
      studyDesign: io.string,
      studyType: io.string,
      countries: StringArray,
      years: io.type({
        start: io.number,
        end: io.number,
      }),
      studySpecies: StringArray,
      outcomes: StringArray,
      associatedFactors: StringArray,
      participantAges: io.string,
      sampleTypes: StringArray,
    }),
    externalIdentifiers: io.partial({
      dois: io.readonlyArray(
        io.intersection([
          io.type({ doi: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
      hyperlinks: io.readonlyArray(
        io.intersection([
          io.type({ url: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
      bioprojectIds: io.readonlyArray(
        io.intersection([
          io.type({ id: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
    }),
    funding: io.readonlyArray(
      io.type({
        agency: io.string,
        awardNumber: io.string,
      })
    ),
    revisionHistory: io.type({
      originalId: io.string,
      revisions: io.readonlyArray(
        io.type({
          action: io.union([
            io.literal('revise'),
            io.literal('extend'),
            io.literal('create'),
          ]),
          timestamp: io.string,
          revisionId: io.string,
          revisionNote: io.string,
        })
      ),
    }),
    dataDisclaimer: io.string,
    datasetSources: io.readonlyArray(
      io.type({
        url: io.string,
        version: io.string,
      })
    ),
    metadataContentFlags: io.partial({
      hasDatasetCharacteristics: io.union([io.null, io.boolean]),
      hasDatasetSources: io.union([io.null, io.boolean]),
      hasDataDisclaimer: io.union([io.null, io.boolean]),
      hasPublications: io.union([io.null, io.boolean]),
      hasOrganismData: io.union([io.null, io.boolean]),
    }),
  }),
]);

export const getMetadataResponse = io.union([
  simpleContainerCoreErrorBody,
  ccServerErrorBody,
  datasetMetadata,
]);
export type DatasetMetadata = io.TypeOf<typeof datasetMetadata>;
export type GetDatasetMetadataResponse = io.TypeOf<typeof getMetadataResponse>;
