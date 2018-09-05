import { wrappable } from '../../Utils/ComponentUtils';
import WdkServiceJsonReporterForm from './WdkServiceJsonReporterForm';

let DownloadForm = props => ( <WdkServiceJsonReporterForm {...props}/> );

export default wrappable(DownloadForm);
