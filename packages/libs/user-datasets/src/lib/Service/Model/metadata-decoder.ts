import * as io from 'io-ts';

const stringArray = io.array(io.string);

const datasetOrganism = io.type({
  species: io.string,
  strain: io.string,
});

export const datasetMetadata = io.intersection([
  io.type({
    type: io.type({
      name: io.string,
      version: io.string,
    }),
    installTargets: stringArray,
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
    dependencies: io.array(
      io.type({
        resourceIdentifier: io.string,
        resourceVersion: io.string,
        resourceDisplayName: io.string,
      })
    ),
    publications: io.array(
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
    contacts: io.array(
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
    linkedDatasets: io.array(
      io.type({
        datasetUri: io.string,
        sharesRecords: io.boolean,
      })
    ),
    experimentalOrganism: datasetOrganism,
    hostOrganism: datasetOrganism,
    datasetCharacteristics: io.partial({
      studyDesign: io.string,
      studyType: io.string,
      countries: stringArray,
      years: io.type({
        start: io.number,
        end: io.number,
      }),
      studySpecies: stringArray,
      outcomes: stringArray,
      associatedFactors: stringArray,
      participantAges: io.string,
      sampleTypes: stringArray,
    }),
    externalIdentifiers: io.partial({
      dois: io.array(
        io.intersection([
          io.type({ doi: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
      hyperlinks: io.array(
        io.intersection([
          io.type({ url: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
      bioprojectIds: io.array(
        io.intersection([
          io.type({ id: io.string }),
          io.partial({ description: io.string }),
        ])
      ),
    }),
    funding: io.array(
      io.type({
        agency: io.string,
        awardNumber: io.string,
      })
    ),
    revisionHistory: io.type({
      originalId: io.string,
      revisions: io.array(
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
    datasetSources: io.array(
      io.type({
        url: io.string,
        version: io.string,
      })
    ),
  }),
]);
export type DatasetMetadata = io.TypeOf<typeof datasetMetadata>;
