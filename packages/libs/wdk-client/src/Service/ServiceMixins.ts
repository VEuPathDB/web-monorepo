import { compose } from 'lodash/fp';

// Mixins for different services
// ADD NEW MIXINS HERE
import RecordTypeService from 'wdk-client/Service/Mixins/RecordTypeService';
import RecordInstanceService from 'wdk-client/Service/Mixins/RecordInstanceService';


// Create a function to mixin subclasses with ServiceBase
export const ServiceMixins = compose(
  // ADD NEW MIXINS HERE TOO
  RecordTypeService,
  RecordInstanceService,
);
