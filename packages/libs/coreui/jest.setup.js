import "@testing-library/jest-dom"; // This wires up React Testing Library and Jest.
import "regenerator-runtime/runtime"; // Without this you'll this error when running tests: ReferenceError: regeneratorRuntime is not defined.
import "@testing-library/jest-dom/extend-expect";

global.ResizeObserver = require("resize-observer-polyfill");
