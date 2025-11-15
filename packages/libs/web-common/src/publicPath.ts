// placeholder used by webpack when making xhr's for code chunks

declare global {
  interface Window {
    __asset_path_remove_me_please__?: string;
  }
  // eslint-disable-next-line no-var
  var __webpack_public_path__: string;
  // eslint-disable-next-line no-var
  var __OUTPUT_SUBDIR__: string;
}

if (window.__asset_path_remove_me_please__ != null) {
  __webpack_public_path__ =
    window.__asset_path_remove_me_please__ + __OUTPUT_SUBDIR__; // eslint-disable-line
}
