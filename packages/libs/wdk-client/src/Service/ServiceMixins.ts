// Mixins for different services
// ADD NEW MIXINS HERE
import RecordTypeService from '../Service/Mixins/RecordTypeService';
import RecordInstanceService from '../Service/Mixins/RecordInstanceService';
import BasketsService from '../Service/Mixins/BasketsService';
import DatasetsService from '../Service/Mixins/DatasetsService';
import FavoritesService from '../Service/Mixins/FavoritesService';
import OauthService from '../Service/Mixins/OauthService';
import LoginService from '../Service/Mixins/LoginService';
import OntologiesService from '../Service/Mixins/OntologiesService';
import SearchesService from '../Service/Mixins/SearchesService';
import SearchReportsService from '../Service/Mixins/SearchReportsService';
import StepAnalysisService from '../Service/Mixins/StepAnalysisService';
import StepsService from '../Service/Mixins/StepsService';
import StrategiesService from '../Service/Mixins/StrategiesService';
import StrategyListsService from '../Service/Mixins/StrategyListsService';
import TemporaryFilesService from '../Service/Mixins/TemporaryFilesService';
import UserPreferencesService from '../Service/Mixins/UserPreferencesService';
import UsersService from '../Service/Mixins/UsersService';
import XmlAnswerService from '../Service/Mixins/XmlAnswerService';
import { ServiceBase } from '../Service/ServiceBase';

// Create a function to mixin subclasses with ServiceBase
// ADD NEW MIXINS HERE TOO
export function composeMixins(baseUrl: string) {
  const base = ServiceBase(baseUrl);
  return {
    ...BasketsService(base),
    ...DatasetsService(base),
    ...RecordInstanceService(base),
    ...RecordTypeService(base),
    ...FavoritesService(base),
    ...OauthService(base),
    ...LoginService(base),
    ...OntologiesService(base),
    ...SearchesService(base),
    ...SearchReportsService(base),
    ...StepAnalysisService(base),
    ...StepsService(base),
    ...StrategiesService(base),
    ...StrategyListsService(base),
    ...TemporaryFilesService(base),
    ...UserPreferencesService(base),
    ...UsersService(base),
    ...XmlAnswerService(base),
    ...base,
  };
}

// Creates a unified interface with all of the functions returned by the mixins
export interface CompositeService extends ReturnType<typeof composeMixins> {}
