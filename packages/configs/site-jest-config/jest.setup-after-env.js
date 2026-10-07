// Runs once the test framework (expect, etc.) is installed (via jest's
// `setupFilesAfterEach`/`setupFilesAfterEnv`) — unlike jest.setup.js (which
// runs via `setupFiles`, before `expect` exists), this is the right place
// for matcher registration.
//
// jest-dom adds custom jest matchers for asserting on DOM nodes, e.g.
// toBeInTheDocument()/toBeEmptyDOMElement()/toBeChecked()/toHaveValue().
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');
