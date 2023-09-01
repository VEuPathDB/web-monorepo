import { parseInt, uniq } from 'lodash/fp';
import WdkService from '../Service/WdkService';
import {
  decode,
  arrayOf,
  combine,
  field,
  string,
  Decoder,
  optional,
  ok,
  boolean,
} from '../Utils/Json';
import { UserPreferences, Step } from '../Utils/WdkUser';
import {
  Question,
  AttributeSortingSpec,
  SearchConfig,
} from '../Utils/WdkModel';
import { partition } from 'lodash';

/*
* TODO: this file should be updated to offer request/update/fulfill actions and handlers from request/update to fulfill.  application store modules will call them, and reduce the fulfills into their store state
caching, if any, will be done in the handlers or service layer.
*/

export async function getResultPanelTabPref(
  searchName: string,
  wdkService: WdkService
): Promise<string> {
  const question = await getQuestionFromSearchName(searchName, wdkService);
  const resultPanelTab = await getPrefWith(
    wdkService,
    prefSpecs.resultPanelTab(question.fullName)
  );
  if (resultPanelTab) return resultPanelTab;
  return '';
}

export async function getResultTableColumnsPref(
  wdkService: WdkService,
  searchName: string,
  step?: Step
): Promise<string[]> {
  const question = await getQuestionFromSearchName(searchName, wdkService);
  const recordClass = await wdkService.findRecordClass(
    question.outputRecordClassName
  );
  const fixedColumns = [
    recordClass.recordIdAttributeName,
    ...recordClass.attributes
      .filter(({ isRemovable }) => !isRemovable)
      .map(({ name }) => name),
  ];
  const displayPrefsColumns = step && step.displayPreferences.columnSelection;
  const columnsPref = await getPrefWith(
    wdkService,
    prefSpecs.summary(question.fullName)
  );
  const columns = displayPrefsColumns
    ? displayPrefsColumns
    : columnsPref
    ? columnsPref.trim().split(/,\s*/)
    : question.defaultAttributes;

  const [knownColumns, unknownColumns] = partition(
    columns,
    (columnName) =>
      recordClass.attributes.some((a) => a.name === columnName) ||
      question.dynamicAttributes.some((a) => a.name === columnName)
  );

  if (unknownColumns.length > 0) {
    await wdkService.submitError(
      new Error(
        'The following unknown attributes were encountered from either user preferences or step details.\n\n' +
          'Search name: ' +
          searchName +
          '\n' +
          (step ? 'Step ID: ' + step.id + '\n' : '') +
          'Unknown attributes: ' +
          unknownColumns.join(', ')
      )
    );
  }
  return uniq(fixedColumns.concat(knownColumns));
}

export async function setResultTableColumnsPref(
  searchName: string,
  wdkService: WdkService,
  columns: Array<string>
): Promise<UserPreferences> {
  const question = await getQuestionFromSearchName(searchName, wdkService);
  return setPrefWith(
    wdkService,
    prefSpecs.summary(question.fullName),
    columns.join(',')
  );
}

export async function getResultTableSortingPref(
  searchName: string,
  wdkService: WdkService
): Promise<AttributeSortingSpec[]> {
  const question = await getQuestionFromSearchName(searchName, wdkService);
  const sortingPref = await getPrefWith(
    wdkService,
    prefSpecs.sort(question.fullName)
  );
  if (!sortingPref) {
    // no sorting pref defined, use default from quesiton
    return question.defaultSorting;
  }
  try {
    return sortingPref.split(/,\s*/).map(constructSortingSpec);
  } catch (error) {
    console.warn(
      `Unable to parse sorting preference for ${question.fullName}. Using question's default sorting.`,
      error
    );
    return question.defaultSorting;
  }
}

function isValidDirection(direction: string): direction is 'ASC' | 'DESC' {
  return direction === 'ASC' || direction === 'DESC';
}

function constructSortingSpec(specString: string): AttributeSortingSpec {
  var [attributeName, direction] = specString.split(/\s+/);
  if (!isValidDirection(direction))
    throw new Error(
      'Expecting either ASC or DESC in sort directive: ' + specString
    );
  return { attributeName, direction };
}

export async function setResultTableSortingPref(
  searchName: string,
  wdkService: WdkService,
  sorting: Array<AttributeSortingSpec>
): Promise<UserPreferences> {
  const question = await getQuestionFromSearchName(searchName, wdkService);
  return setPrefWith(
    wdkService,
    prefSpecs.sort(question.fullName),
    sorting.map((spec) => spec.attributeName + ' ' + spec.direction).join(',')
  );
}

export async function getResultTablePageSizePref(
  wdkService: WdkService
): Promise<number> {
  const sizeString = await getPrefWith(wdkService, prefSpecs.itemsPerPage());
  return parseInt(10, sizeString) || 20;
}

export async function setResultTablePageSizePref(
  wdkService: WdkService,
  pageSize: number
): Promise<UserPreferences> {
  return setPrefWith(wdkService, prefSpecs.itemsPerPage(), pageSize.toString());
}

export type MatchedTranscriptFilterPref = {
  expanded: boolean;
};

// TODO: maybe this should be in cookie instead.  we need a utility to manage that.
export async function getMatchedTranscriptFilterPref(
  wdkService: WdkService
): Promise<MatchedTranscriptFilterPref> {
  const pref = await getPrefWith(
    wdkService,
    prefSpecs.matchedTranscriptsExpanded()
  );
  return { expanded: pref ? pref === 'yes' : false };
}

export async function setMatchedTranscriptFilterPref(
  expanded: boolean,
  wdkService: WdkService
): Promise<UserPreferences> {
  return setPrefWith(
    wdkService,
    prefSpecs.matchedTranscriptsExpanded(),
    expanded ? 'yes' : 'no'
  );
}

export async function getStrategyPanelVisibility(
  wdkService: WdkService
): Promise<MatchedTranscriptFilterPref> {
  const pref = await getPrefWith(
    wdkService,
    prefSpecs.matchedTranscriptsExpanded()
  );
  return { expanded: pref ? pref === 'yes' : false };
}

type ViewFilters = SearchConfig['viewFilters'];

// FIXME Need to figure out a way to validate view filter values
const viewFiltersDecoder: Decoder<ViewFilters> = optional(
  arrayOf(
    combine(
      field('name', string),
      field('value', ok),
      field('disabled', optional(boolean))
    )
  )
);

export async function getGlobalViewFilters(
  wdkService: WdkService,
  recordClassName: string
): Promise<ViewFilters> {
  const prefValue = await getPrefWith(
    wdkService,
    prefSpecs.globalViewFilters(recordClassName)
  );
  if (prefValue == null || prefValue == '') return undefined;
  return decode(
    viewFiltersDecoder,
    await getPrefWith(wdkService, prefSpecs.globalViewFilters(recordClassName))
  );
}

export async function setGlobalViewFilters(
  wdkService: WdkService,
  recordClassName: string,
  viewFilters?: ViewFilters
): Promise<UserPreferences> {
  const prefValue = viewFilters ? JSON.stringify(viewFilters) : null;
  return setPrefWith(
    wdkService,
    prefSpecs.globalViewFilters(recordClassName),
    prefValue
  );
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Utilities below ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
*/

export enum Scope {
  global = 'global',
  project = 'project',
}

type PrefSpec = [keyof UserPreferences, string];

const getPrefWith = async (wdkService: WdkService, [scope, key]: PrefSpec) =>
  (await wdkService.getCurrentUserPreferences())[scope][key];

const setPrefWith = async (
  wdkService: WdkService,
  [scope, key]: PrefSpec,
  value: string | null
) => await wdkService.patchSingleUserPreference(scope, key, value);

export const prefSpecs = {
  sort: (questionFullName: string): PrefSpec => [
    Scope.project,
    questionFullName + '_sort',
  ],
  summary: (questionFullName: string): PrefSpec => [
    Scope.project,
    questionFullName + '_summary',
  ],
  itemsPerPage: (): PrefSpec => [
    Scope.global,
    'preference_global_items_per_page',
  ],
  matchedTranscriptsExpanded: (): PrefSpec => [
    Scope.global,
    'matchted_transcripts_filter_expanded',
  ],
  globalViewFilters: (recordClassName: string): PrefSpec => [
    Scope.project,
    recordClassName + '_globalViewFilters',
  ],
  resultPanelTab: (questionFullName: string): PrefSpec => [
    Scope.project,
    questionFullName + '_resultPanelTab',
  ],
};

async function getQuestionFromSearchName(
  searchName: string,
  wdkService: WdkService
): Promise<Question> {
  const questions = await wdkService.getQuestions();
  const question = questions.find(
    (question) => question.urlSegment === searchName
  );
  if (question == null) throw new Error(`Unknown question "${searchName}".`);
  return question;
}

async function getQuestionAndRecordClass(
  wdkService: WdkService,
  questionName: string
) {
  const question = await wdkService.findQuestion(questionName);
  const recordClass = await wdkService.findRecordClass(
    question.outputRecordClassName
  );
  return { question, recordClass };
}

async function getValidColumns(
  wdkService: WdkService,
  questionName: string
): Promise<Set<string>> {
  const { question, recordClass } = await getQuestionAndRecordClass(
    wdkService,
    questionName
  );
  return new Set(
    recordClass.attributes
      .concat(question.dynamicAttributes)
      .filter(({ isDisplayable }) => isDisplayable)
      .map(({ name }) => name)
  );
}

export async function filterInvalidAttributes<T>(
  wdkService: WdkService,
  questionName: string,
  mapToAttributeName: (t: T) => string,
  array: T[]
): Promise<T[]> {
  const validColumns = await getValidColumns(wdkService, questionName);
  return array.filter((item) => validColumns.has(mapToAttributeName(item)));
}
