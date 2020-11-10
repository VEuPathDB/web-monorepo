/**
 * Dynamically resolve `componentName` to a React Component object by checking
 * for a an export of the same name in the recordClass module. The recordClass
 * module may not exist, in which case we will simply return undefined.
 */
export const findExportWith = webpackContext => exportName => moduleRelativePath => {
  const moduleNames = webpackContext.keys();
  let exportObject;
  try {
    if (moduleNames.includes(moduleRelativePath)) {
      exportObject = webpackContext(moduleRelativePath)[exportName];
    }
  }
  catch(e) {
    // Log and throw error. Throwing this error will cause React to crash, which
    // will leave the page in an unfinished state, without any error indication
    // displayed.
    console.error(e);
    alert("An error was found attempting to load module `" + moduleRelativePath + "`." +
      " See the browser's console for a detailed error.");
    throw e;
  }
  return exportObject;
}
