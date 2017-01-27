// include css files
import 'eupathdb/wdkCustomization/css/superfish/css/superfish.css';
import 'eupathdb/css/AllSites.css';
import 'site/css/AllApiSites.css';
// <!-- Only needed for pathway record -->
import 'site/wdkCustomization/css/pathway.css';


// Include javascript files
// Those starting with '!!script!' are loaded with script semantics
// rather than ES module semantics (i.e., code is executed in the global scope).

import 'site/wdkCustomization/js/client/main'; // This is imported solely for gbrowse.
import 'site/wdkCustomization/js/attributeCheckboxTree';
import 'eupathdb/wdkCustomization/js/lib/hoverIntent';
import 'eupathdb/wdkCustomization/js/lib/superfish';
import 'eupathdb/wdkCustomization/js/common';
import '!!script-loader!./wdkCustomization/js/custom-login';
import '!!script-loader!eupathdb/js/newwindow';

// <!-- Quick search box -->
import 'site/js/quicksearch';

// home page bubbles
import 'site/js/bubbles';

// <!-- Sidebar news/events, yellow background -->
import '!!script-loader!site/js/newitems';

// <!-- Dynamic query grid (bubbles in home page) -->
import '!!script-loader!site/js/dqg';

// <!-- Access twitter/facebook links, and configure menubar (superfish) -->
import '!!script-loader!eupathdb/js/nav';

// <!-- show/hide the tables in the Record page -->
import 'site/js/show_hide_tables';
