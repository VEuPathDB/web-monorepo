// Mixins for different services
// ADD NEW MIXINS HERE
import RecordTypeService from 'wdk-client/Service/Mixins/RecordTypeService';
import RecordInstanceService from 'wdk-client/Service/Mixins/RecordInstanceService';
import BasketsService from 'wdk-client/Service/Mixins/BasketsService';
import DatasetsService from 'wdk-client/Service/Mixins/DatasetsService';
import FavoritesService from 'wdk-client/Service/Mixins/FavoritesService';
import OauthService from 'wdk-client/Service/Mixins/OauthService';
import LoginService from 'wdk-client/Service/Mixins/LoginService';
import OntologiesService from 'wdk-client/Service/Mixins/OntologiesService';
import SearchesService from 'wdk-client/Service/Mixins/SearchesService';
import SearchReportsService from 'wdk-client/Service/Mixins/SearchReportsService';
import StepAnalysisService from 'wdk-client/Service/Mixins/StepAnalysisService';
import StepsService from 'wdk-client/Service/Mixins/StepsService';
import StrategiesService from 'wdk-client/Service/Mixins/StrategiesService';
import StrategyListsService from 'wdk-client/Service/Mixins/StrategyListsService';
import TemporaryFilesService from 'wdk-client/Service/Mixins/TemporaryFilesService';
import UserPreferencesService from 'wdk-client/Service/Mixins/UserPreferencesService';
import UsersService from 'wdk-client/Service/Mixins/UsersService';
import XmlAnswerService from 'wdk-client/Service/Mixins/XmlAnswerService';
import { ServiceBase } from 'wdk-client/Service/ServiceBase';

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
  }
}

// Creates a unified interface with all of the functions returned by the mixins
export interface CompositeService extends ReturnType<typeof composeMixins> { }
