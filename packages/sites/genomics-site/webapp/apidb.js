// include css files
import 'eupathdb/wdkCustomization/css/superfish/css/superfish.css';
import 'eupathdb/css/AllSites.css';
import 'apidb/css/AllApiSites.css';
// <!-- Only needed for pathway record -->
import 'apidb/wdkCustomization/css/pathway.css';


// Include javascript files
// Those starting with '!!script!' are loaded with script semantics
// rather than ES module semantics (i.e., code is executed in the global scope).
import 'apidb/wdkCustomization/js/client/main';
import 'apidb/wdkCustomization/js/attributeCheckboxTree';
import 'eupathdb/wdkCustomization/js/lib/hoverIntent';
import 'eupathdb/wdkCustomization/js/lib/superfish';
import '!!script!eupathdb/wdkCustomization/js/common';
import '!!script!./wdkCustomization/js/custom-login';
import '!!script!eupathdb/js/newwindow';

// <!-- Quick search box -->
import 'apidb/js/quicksearch';

// home page bubbles
import 'apidb/js/bubbles';

// <!-- Sidebar news/events, yellow background -->
import '!!script!apidb/js/newitems';

// <!-- Dynamic query grid (bubbles in home page) -->
import '!!script!apidb/js/dqg';

// <!-- Access twitter/facebook links, and configure menubar (superfish) -->
import '!!script!eupathdb/js/nav';

// <!-- show/hide the tables in the Record page -->
import 'apidb/js/show_hide_tables';
