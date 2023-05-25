describe('Example', () => {
  it.only('users can open the subset panel from filter chip', () => {
    mockRoutes();
    cy.visit('/mapveu');
    cy.findByText('There are no analyses that match your search.').should(
      'exist'
    );
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
  cy.intercept('GET', '/eda-service/users/*/analyses/*', {
    statusCode: 200,
    body: [],
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
}
