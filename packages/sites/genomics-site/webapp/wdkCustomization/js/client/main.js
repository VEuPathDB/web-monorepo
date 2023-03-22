import { initialize } from './bootstrap';

initialize();

// Using dynamic import to lazy load these scripts
import('../../../../vendored/pdbe-molstar-component-3.0.0');     
import('../../../../vendored/pdbe-molstar-light-3.0.0.css');
