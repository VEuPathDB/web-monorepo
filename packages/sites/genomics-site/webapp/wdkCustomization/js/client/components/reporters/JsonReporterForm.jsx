import SharedReporterForm from './SharedReporterForm';

let JsonReporterForm = props => ( <SharedReporterForm {...props}/> );

JsonReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default JsonReporterForm;
