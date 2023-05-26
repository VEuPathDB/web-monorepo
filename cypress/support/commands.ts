/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import '@testing-library/cypress/add-commands';
// Add typings for the custom command
declare global {
  namespace Cypress {
    interface Chainable {
      dragTo: (
        draggableElement: Cypress.Chainable<JQuery<HTMLElement>>,
        dragDestination: { x: number; y: number }
      ) => Chainable;
    }
  }
}

// Add a custom command
Cypress.Commands.add('dragTo', dragTo);

/**
 * Give me an element via cy.findBy* and tell me where to drag it to.
 * @param draggableElement
 * @param dragDestination
 * @returns
 */
function dragTo(
  draggableElement: Cypress.Chainable<JQuery<HTMLElement>>,
  dragDestination: { x: number; y: number }
) {
  return draggableElement
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', {
      clientX: dragDestination.x,
      clientY: dragDestination.y,
    })
    .trigger('mouseup', { force: true });
}
