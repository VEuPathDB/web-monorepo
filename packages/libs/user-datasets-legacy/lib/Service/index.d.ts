/// <reference types="lodash" />
/// <reference types="lodash" />
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { ServiceConfig as UserDatasetUploadServiceConfig } from './UserDatasetUploadWrappers';
export declare function wrapWdkService(
  serviceConfig: UserDatasetUploadServiceConfig | undefined,
  wdkService: WdkService
): {
  getCurrentUserDatasets:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  getUserDataset:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  updateUserDataset:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  removeUserDataset:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  editUserDatasetSharing:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  getUserDatasetDownloadUrl:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  getUserIdsByEmail:
    | (() => Promise<import('../Utils/types').UserDataset[]>)
    | ((id: number) => Promise<import('../Utils/types').UserDataset>)
    | ((
        id: number,
        meta: import('../Utils/types').UserDatasetMeta
      ) => Promise<void>)
    | ((
        actionName: string,
        userDatasetIds: number[],
        recipientUserIds: number[]
      ) => Promise<import('./UserDatasetWrappers').UserDatasetShareResponse>)
    | ((datasetId: number, filename: string) => string)
    | ((emails: string[]) => Promise<{
        results: Record<string, number>[];
      }>);
  _version: number | undefined;
  _fetchJson: <T>(
    method: string,
    url: string,
    body?: string | undefined,
    isBaseUrl?: boolean | undefined
  ) => Promise<T>;
  _getFromCache: <T_1>(
    key: string,
    onCacheMiss: () => Promise<T_1>,
    checkCachedValue?: ((cachedValue: T_1) => boolean) | undefined
  ) => Promise<T_1>;
  _clearCache: () => Promise<void>;
  serviceUrl: string;
  sendRequest: <Resource>(
    decoder: import('@veupathdb/wdk-client/lib/Utils/Json').Decoder<Resource>,
    options: {
      method: string;
      path: string;
      params?:
        | {
            [key: string]: any;
          }
        | undefined;
      body?: string | undefined;
      useCache?: boolean | undefined;
      cacheId?: string | undefined;
      checkCachedValue?: ((resource: Resource) => boolean) | undefined;
    }
  ) => Promise<Resource>;
  submitError: (error: Error, extra?: any) => Promise<void>;
  submitErrorIfNot500: (error: Error, extra?: any) => Promise<void>;
  submitErrorIfUndelayedAndNot500: (error: Error, extra?: any) => Promise<void>;
  getConfig: () => Promise<
    import('@veupathdb/wdk-client/lib/Service/ServiceBase').ServiceConfig
  >;
  getVersion: () => Promise<number>;
  getRecordClasses: (() => Promise<
    ({
      description: string;
      iconName?: string | undefined;
      displayName: string;
      properties?: Record<string, string[]> | undefined;
      fullName: string;
      urlSegment: string;
      displayNamePlural: string;
      shortDisplayName: string;
      shortDisplayNamePlural: string;
      recordIdAttributeName: string;
      primaryKeyColumnRefs: string[];
      attributes: import('@veupathdb/wdk-client/lib/Utils/WdkModel').AttributeField[];
      tables: import('@veupathdb/wdk-client/lib/Utils/WdkModel').TableField[];
      formats: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Reporter[];
      useBasket: boolean;
      searches: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Question[];
    } & {
      attributesMap: import('lodash').Dictionary<
        import('@veupathdb/wdk-client/lib/Utils/WdkModel').AttributeField
      >;
      tablesMap: import('lodash').Dictionary<
        import('@veupathdb/wdk-client/lib/Utils/WdkModel').TableField
      >;
    })[]
  >) &
    import('lodash').MemoizedFunction;
  findRecordClass: (urlSegment: string) => Promise<
    {
      description: string;
      iconName?: string | undefined;
      displayName: string;
      properties?: Record<string, string[]> | undefined;
      fullName: string;
      urlSegment: string;
      displayNamePlural: string;
      shortDisplayName: string;
      shortDisplayNamePlural: string;
      recordIdAttributeName: string;
      primaryKeyColumnRefs: string[];
      attributes: import('@veupathdb/wdk-client/lib/Utils/WdkModel').AttributeField[];
      tables: import('@veupathdb/wdk-client/lib/Utils/WdkModel').TableField[];
      formats: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Reporter[];
      useBasket: boolean;
      searches: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Question[];
    } & {
      attributesMap: import('lodash').Dictionary<
        import('@veupathdb/wdk-client/lib/Utils/WdkModel').AttributeField
      >;
      tablesMap: import('lodash').Dictionary<
        import('@veupathdb/wdk-client/lib/Utils/WdkModel').TableField
      >;
    }
  >;
  getQuestions: () => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkModel').Question[]
  >;
  findQuestion: (
    urlSegment: string
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Question>;
  getRecordTypePath: (recordClassUrlSegment: string) => string;
  getRecordTypesPath: () => string;
  getReportsEndpoint: (
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) => string;
  getReportsPath: (
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) => string;
  getSearchesPath: (recordClassUrlSegment: string) => string;
  getSearchPath: (
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) => string;
  getStandardSearchReportEndpoint: (
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) => string;
  getCustomSearchReportEndpoint: (
    recordClassUrlSegment: string,
    questionUrlSegment: string,
    reportName: string
  ) => string;
  getXmlAnswerJson: (xmlQuestionName: string) => Promise<any>;
  getCurrentUser: (
    options?:
      | {
          force?: boolean | undefined;
        }
      | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkUser').User>;
  createNewUser: (
    userWithPrefs: import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserWithPrefs
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Identifier>;
  updateCurrentUser: (
    user: import('@veupathdb/wdk-client/lib/Utils/WdkUser').User
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkUser').User>;
  updateCurrentUserPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  getCurrentUserPreferences: () => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences
  >;
  patchSingleUserPreference: (
    scope: import('@veupathdb/wdk-client/lib/Utils/WdkUser').PreferenceScope,
    key: string,
    value: string | null
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences
  >;
  patchScopedUserPreferences: (
    scope: import('@veupathdb/wdk-client/lib/Utils/WdkUser').PreferenceScope,
    updates: Record<string, string>
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences
  >;
  patchUserPreferences: (
    updates: import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').UserPreferences
  >;
  createTemporaryFile: (file: File) => Promise<string>;
  getPublicStrategies: (
    queryParams?:
      | {
          userEmail: string | string[] | undefined;
        }
      | undefined
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').StrategySummary[]
  >;
  getStrategies: () => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').StrategySummary[]
  >;
  createStrategy: (
    newStrategySpec: import('@veupathdb/wdk-client/lib/Utils/WdkUser').NewStrategySpec,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Identifier>;
  duplicateStrategy: (
    copyStepSpec: import('@veupathdb/wdk-client/lib/Utils/WdkUser').DuplicateStrategySpec,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Identifier>;
  deleteStrategies: (
    deleteStrategiesSpecs: import('@veupathdb/wdk-client/lib/Utils/WdkUser').DeleteStrategySpec[],
    userId?: string | undefined
  ) => Promise<void>;
  getStrategy: (
    strategyId: number,
    userId?: string | undefined
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkUser').StrategyDetails
  >;
  deleteStrategy: (
    strategyId: number,
    userId?: string | undefined
  ) => Promise<void>;
  patchStrategyProperties: (
    strategyId: number,
    strategyProperties: Partial<
      import('@veupathdb/wdk-client/lib/Service/Mixins/StrategiesService').PatchOptions
    >,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Identifier>;
  putStrategyStepTree: (
    strategyId: number,
    newStepTree: import('@veupathdb/wdk-client/lib/Utils/WdkUser').StepTree,
    userId?: string | undefined
  ) => Promise<void>;
  getDuplicatedStrategyStepTree: (
    strategyId: number,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkUser').StepTree>;
  findStep: (
    stepId: number,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkUser').Step>;
  updateStepProperties: (
    stepId: number,
    stepSpec: import('@veupathdb/wdk-client/lib/Utils/WdkUser').PatchStepSpec,
    userId?: string | undefined
  ) => Promise<void>;
  createStep: (
    newStepSpec: import('@veupathdb/wdk-client/lib/Utils/WdkUser').NewStepSpec,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Identifier>;
  getStepCustomReport: (
    stepId: number,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting,
    userId?: string | undefined
  ) => Promise<any>;
  getStepStandardReport: (
    stepId: number,
    reportConfig: import('@veupathdb/wdk-client/lib/Utils/WdkModel').StandardReportConfig,
    viewFilters:
      | import('@veupathdb/wdk-client/lib/Utils/WdkModel').FilterValueArray
      | undefined,
    userId?: string | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Answer>;
  getStepColumnReport: (
    stepId: number,
    columnName: string,
    toolName: string,
    reportConfig: object,
    userId?: string | undefined
  ) => Promise<any>;
  getStepFilterSummary: <T_2>(
    decoder: import('@veupathdb/wdk-client/lib/Utils/Json').Decoder<T_2>,
    stepId: number,
    filterName: string,
    userId?: string | undefined
  ) => Promise<T_2>;
  deleteStep: (stepId: number, userId?: string | undefined) => void;
  updateStepSearchConfig: (
    stepId: number,
    answerSpec: import('@veupathdb/wdk-client/lib/Utils/WdkModel').SearchConfig,
    userId?: string | undefined
  ) => Promise<void>;
  downloadStepReport: (
    stepId: number,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting,
    target?: string | undefined,
    userId?: string | undefined
  ) => Promise<void>;
  createStepAnalysis: (
    stepId: number,
    baseAnalysisConfig: {
      analysisName: string;
      displayName?: string | undefined;
      parameters: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues;
    }
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/StepAnalysisUtils').StepAnalysisConfig
  >;
  deleteStepAnalysis: (stepId: number, analysisId: number) => Promise<void>;
  getAppliedStepAnalyses: (
    stepId: number
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/StepAnalysisUtils').StepAnalysis[]
  >;
  getStepAnalysis: (
    stepId: number,
    analysisId: number
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Service/Mixins/StepAnalysisService').StepAnalysisConfigWithDisplayParams
  >;
  getStepAnalysisResult: (stepId: number, analysisId: number) => Promise<any>;
  getStepAnalysisStatus: (
    stepId: number,
    analysisId: number
  ) => Promise<{
    status: import('@veupathdb/wdk-client/lib/Utils/StepAnalysisUtils').StepAnalysisStatus;
  }>;
  getStepAnalysisTypeParamSpecs: (
    stepId: number,
    analysisTypeName: string
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Parameter[]>;
  getStepAnalysisTypes: (
    stepId: number
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/StepAnalysisUtils').StepAnalysisType[]
  >;
  renameStepAnalysis: (
    stepId: number,
    analysisId: number,
    displayName: string
  ) => Promise<void>;
  runStepAnalysis: (
    stepId: number,
    analysisId: number
  ) => Promise<{
    status: import('@veupathdb/wdk-client/lib/Utils/StepAnalysisUtils').StepAnalysisStatus;
  }>;
  updateStepAnalysisForm: (
    stepId: number,
    analysisId: number,
    formParams: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues
  ) => Promise<string[]>;
  getCustomSearchReportRequestInfo: (
    answerSpec: import('@veupathdb/wdk-client/lib/Utils/WdkModel').AnswerSpec,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').CustomSearchReportRequestInfo
  >;
  getAnswer: <T_3>(
    answerSpec: import('@veupathdb/wdk-client/lib/Utils/WdkModel').AnswerSpec,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting
  ) => Promise<T_3>;
  getAnswerJson: (
    answerSpec: import('@veupathdb/wdk-client/lib/Utils/WdkModel').AnswerSpec,
    reportConfig: import('@veupathdb/wdk-client/lib/Utils/WdkModel').StandardReportConfig,
    viewFilters?:
      | import('@veupathdb/wdk-client/lib/Utils/WdkModel').FilterValueArray
      | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Answer>;
  getTemporaryResultPath: (
    answerSpecOrStepId:
      | number
      | import('@veupathdb/wdk-client/lib/Utils/WdkModel').AnswerSpec,
    reportName: string,
    reportConfig: unknown
  ) => Promise<string>;
  downloadAnswer: (
    answerRequest: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerRequest,
    target?: string | undefined
  ) => Promise<void>;
  getQuestionAndParameters: (
    questionUrlSegment: string
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkModel').QuestionWithParameters
  >;
  getQuestionGivenParameters: (
    questionUrlSegment: string,
    paramValues: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkModel').QuestionWithParameters
  >;
  getRefreshedDependentParams: (
    questionUrlSegment: string,
    paramName: string,
    paramValue: string,
    paramValues: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Parameter[]>;
  getOntologyTermSummary: (
    questionUrlSegment: string,
    paramName: string,
    filters: any,
    ontologyId: string,
    paramValues: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Components/AttributeFilter/Types').OntologyTermSummary
  >;
  getFilterParamSummaryCounts: (
    questionUrlSegment: string,
    paramName: string,
    filters: any,
    paramValues: import('@veupathdb/wdk-client/lib/Utils/WdkModel').ParameterValues
  ) => Promise<{
    filtered: number;
    unfiltered: number;
    nativeFiltered: number;
    nativeUnfiltered: number;
  }>;
  getOntology: (
    name: string
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/CategoryUtils').CategoryOntology
  >;
  getCategoriesOntology: () => Promise<
    import('@veupathdb/wdk-client/lib/Utils/CategoryUtils').CategoryOntology
  >;
  tryLogin: (
    email: string,
    password: string,
    redirectUrl: string
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Service/Mixins/LoginService').TryLoginResponse
  >;
  logout: () => Promise<Response>;
  getOauthStateToken: () => Promise<{
    oauthStateToken: string;
  }>;
  getFavoriteId: (
    recordId: import('@veupathdb/wdk-client/lib/Utils/WdkModel').PrimaryKey,
    recordClassUrlSegment: string
  ) => Promise<number | undefined>;
  addFavorite: (
    recordId: import('@veupathdb/wdk-client/lib/Utils/WdkModel').PrimaryKey,
    recordClassUrlSegment: string
  ) => Promise<number>;
  deleteFavorite: (id: number) => Promise<undefined>;
  deleteFavorites: (ids: number[]) => Promise<void>;
  getCurrentFavorites: () => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkModel').Favorite[]
  >;
  saveFavorite: (
    favorite: import('@veupathdb/wdk-client/lib/Utils/WdkModel').Favorite
  ) => Promise<void>;
  undeleteFavorites: (ids: number[]) => Promise<void>;
  getRecord: (
    recordClassUrlSegment: string,
    primaryKey: import('@veupathdb/wdk-client/lib/Utils/WdkModel').PrimaryKey,
    options?:
      | {
          attributes?: string[] | undefined;
          tables?: string[] | undefined;
        }
      | undefined
  ) => Promise<
    import('@veupathdb/wdk-client/lib/Utils/WdkModel').RecordInstance
  >;
  createDataset: (
    config: import('@veupathdb/wdk-client/lib/Service/Mixins/DatasetsService').DatasetConfig
  ) => Promise<Number>;
  getDataset: (id: number) => Promise<(string | null)[][]>;
  getBasketCounts: () => Promise<{
    [recordClassName: string]: number;
  }>;
  getBasketStatus: (
    recordClassUrlSegment: string,
    records: import('@veupathdb/wdk-client/lib/Utils/WdkModel').RecordInstance[]
  ) => Promise<boolean[]>;
  getBasketStatusPk: (
    recordClassUrlSegment: string,
    records: import('@veupathdb/wdk-client/lib/Utils/WdkModel').PrimaryKey[]
  ) => Promise<boolean[]>;
  updateRecordsBasketStatus: (
    operation: import('@veupathdb/wdk-client/lib/Service/Mixins/BasketsService').BasketPatchIdsOperation,
    recordClassUrlSegment: string,
    primaryKey: import('@veupathdb/wdk-client/lib/Utils/WdkModel').PrimaryKey[]
  ) => Promise<void>;
  clearBasket: (recordClassUrlSegment: string) => Promise<void>;
  addStepToBasket: (
    recordClassUrlSegment: string,
    stepId: number
  ) => Promise<void>;
  getBasketCustomReport: <T_4>(
    basketName: string,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting
  ) => Promise<T_4>;
  getBasketStandardReport: (
    basketName: string,
    reportConfig: import('@veupathdb/wdk-client/lib/Utils/WdkModel').StandardReportConfig,
    viewFilters?:
      | import('@veupathdb/wdk-client/lib/Utils/WdkModel').FilterValueArray
      | undefined
  ) => Promise<import('@veupathdb/wdk-client/lib/Utils/WdkModel').Answer>;
  downloadBasketReport: (
    basketName: string,
    formatting: import('@veupathdb/wdk-client/lib/Service/Mixins/SearchReportsService').AnswerFormatting,
    target?: string | undefined
  ) => Promise<void>;
};
//# sourceMappingURL=index.d.ts.map
