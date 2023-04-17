describe('Standalone Map Filter / Subset Panel', () => {
  it('users can open the subset panel from filter chip', () => {
    mockRoutes();
    cy.visit('https://localhost:3000/mapveu/DS_d6a1141fbf');
    cy.findByText('The Coolest Study Ever').click();
    cy.findByText('Country').click();
    cy.findByText('Nice description!').should('exist');
  });
  it.only('users can add filters to their analysis', () => {
    mockRoutes();
    cy.visit('https://localhost:3000/mapveu/DS_d6a1141fbf');
    cy.findByText('The Coolest Study Ever').click();
    cy.findByText('Filter').click();

    cy.findByText('Avocado').click();
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

  cy.fixture('postServiceRecordTypesDatasetRecords')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('POST', '/service/record-types/dataset/records', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getEdaServiceStudiesSCORECX0101-1')
    .then((fixture) => {
      fixture.study.rootEntity.variables[0].definition = 'Nice description!';
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/eda-service/studies/*', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getEdaServiceUsersIdAnalysesClinEpiDB')
    .then((fixture) => {
      fixture[0].displayName = 'The Coolest Study Ever';
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/eda-service/users/**/analyses/ClinEpiDB', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('postEdaServiceAppsPassVisualizationsMapMarkers')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept(
        'POST',
        '/eda-service/apps/pass/visualizations/map-markers',
        {
          statusCode: 200,
          body: fixture,
        }
      ).as('postEdaServiceAppsPassVisualizationsMapMarkers');
    });
  cy.fixture('getEdaServiceApps')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/eda-service/apps', {
        statusCode: 200,
        body: fixture,
      });
    });
  cy.fixture('getEdaServiceStudy_StudyId_entities_EntityId_count')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('POST', '/eda-service/studies/**/entities/**/count', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getEdaServiceStudy_StudyId_entities_EntityId_count')
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('POST', '/eda-service/studies/**/entities/**/count', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture('getEdaServiceUsers_UserId_AnalysesClinEpiDB_AnalysisId')
    .then((fixture) => {
      fixture.descriptor.subset.uiSettings['@@mapApp@@'].isSubsetPanelOpen =
        false;
      return fixture;
    })
    .then((fixture) => {
      cy.intercept('GET', '/eda-service/users/**/analyses/ClinEpiDB/**', {
        statusCode: 200,
        body: fixture,
      });
    });

  cy.fixture(
    'postEdaServiceStudies_StudyId_Entitie_EntityId_Variables_VariableId_Distribution'
  )
    .then((fixture) => {
      return fixture;
    })
    .then((fixture) => {
      cy.intercept(
        'POST',
        '/eda-service/studies/**/entities/**/variables/**/distribution',
        {
          statusCode: 200,
          body: fixture,
        }
      );
    });

  cy.intercept('PATCH', '/eda-service/users/**/analyses/ClinEpiDB/**', {
    statusCode: 202,
  });
  cy.intercept('https://*.tile.openstreetmap.org/*/*/*.png', {
    fixture: 'mapTile.jpeg',
  });
}
