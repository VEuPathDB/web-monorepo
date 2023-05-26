describe('Example', () => {
  it('informs users that they have no analyses', () => {
    mockRoutes();

    cy.intercept('GET', '/eda-service/users/*/analyses/*', {
      statusCode: 200,
      body: [],
    }).as('hasNoAnalysis');

    cy.visit('/mapveu');
    cy.findByText('There are no analyses that match your search.').should(
      'exist'
    );
  });
  it('users can open a previously saved analysis', () => {
    mockRoutes();
    cy.intercept('GET', '/eda-service/users/*/analyses/*', {
      statusCode: 200,
      body: [
        {
          displayName: 'Example Analysis',
          description:
            'This is an exmaple of an Analysis returned from the EDA service',
          studyId: 'FAKE_studyId',
          studyVersion: '',
          apiVersion: '',
          isPublic: false,
          analysisId: 'FAKE_AnalysisId',
          creationTime: '2023-05-08T17:11:36',
          modificationTime: '2023-05-25T16:55:31',
          numFilters: 0,
          numComputations: 2,
          numVisualizations: 9,
        },
      ],
    }).as('getOneAnalysis');

    cy.visit('/mapveu');
    cy.findByText('Example Analysis').should('exist');
  });
});

function mockRoutes() {
  cy.setCookie('wdk_check_auth', 'MOCK_WDK_AUTH_KEY');

  cy.fixture('getService')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/service', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getServiceUsersCurrent')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/service/users/current', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getServiceUsersCurrentPreferences')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/service/users/current/preferences', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getEdaServicePermissions')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/eda-service/permissions', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.intercept('GET', '/eda-service/users/*/preferences/*', {
    statusCode: 200,
    body: {},
  });

  cy.fixture('postServiceRecordTypesDatasetSearchesStudiesReportsStandard')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept(
        'POST',
        '/service/record-types/dataset/searches/Studies/reports/standard',
        {
          statusCode: 200,
          body: fixture,
        }
      );
    });

  cy.fixture('getRecordTypes')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/service/record-types?format=expanded', {
        statusCode: 200,
        body: fixture,
      });
    });
}
