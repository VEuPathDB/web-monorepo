let req = require.context('./records', true);
let moduleNames = req.keys();

/**
 * Dynamically resolve `componentName` to a React Component object by checking
 * for a an export of the same name in the recordClass module. The recordClass
 * module may not exist, in which case we will simply return undefined.
 */
export function findComponent(componentName, recordClassName) {
  let moduleName = './' + recordClassName;
  let component;
  try {
    if (moduleNames.includes(moduleName)) {
      component = req(moduleName)[componentName];
    }
  }
  catch(e) {
    // Log and throw error. Throwing this error will cause React to crash, which
    // will leave the page in an unfinished state, without any error indication
    // displayed.
    console.error(e);
    alert("An error was found attempting to load module `" + moduleName + "`." +
      " See the browser's console for a detailed error.");
    throw e;
  }
  finally {
    return component;
  }
}
