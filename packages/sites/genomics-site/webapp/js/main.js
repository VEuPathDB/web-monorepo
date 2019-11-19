// Include javascript files
// Those starting with '!!script!' are loaded with script semantics
// rather than ES module semantics (i.e., code is executed in the global scope).

import { initialize as initializeWdk } from 'wdk/js/index.js';
import { initialize } from 'site/wdkCustomization/js/client/bootstrap';

initialize(initializeWdk);

import 'eupathdb/wdkCustomization/js/common';

// home page bubbles
import 'site/js/bubbles';
