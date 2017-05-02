// include css files
import 'eupathdb/css/AllSites.css';
import 'site/css/AllApiSites.css';

// Include javascript files
// Those starting with '!!script!' are loaded with script semantics
// rather than ES module semantics (i.e., code is executed in the global scope).

import 'site/wdkCustomization/js/client/main';
import 'site/wdkCustomization/js/attributeCheckboxTree';
import 'eupathdb/wdkCustomization/js/common';
import '!!script-loader!site/wdkCustomization/js/custom-login';
import '!!script-loader!eupathdb/js/newwindow';

// home page bubbles
import 'site/js/bubbles';
