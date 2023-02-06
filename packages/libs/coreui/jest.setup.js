import "@testing-library/jest-dom"; // This wires up React Testing Library and Jest.
import "regenerator-runtime/runtime"; // Without this you'll this error when running tests: ReferenceError: regeneratorRuntime is not defined.
import "@testing-library/jest-dom/extend-expect";

// So this piece of tragedy is due to yet another jsdom limitation.
import resizeObserverPolyfill from "resize-observer-polyfill";
// eslint-disable-next-line no-undef
global.ResizeObserver = resizeObserverPolyfill;
