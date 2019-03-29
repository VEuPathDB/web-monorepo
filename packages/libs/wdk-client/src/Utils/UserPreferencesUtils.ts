import { parseInt, isInteger } from 'lodash/fp';
import WdkService from 'wdk-client/Utils/WdkService';
import { decode, arrayOf, combine, field, string, Decoder, optional, ok } from 'wdk-client/Utils/Json';
import {UserPreferences} from 'wdk-client/Utils/WdkUser';
import { AttributeSortingSpec, AnswerSpec } from "wdk-client/Utils/WdkModel"

type ViewFilters = AnswerSpec['viewFilters'];

function isValidDirection(direction: string): direction is 'ASC' | 'DESC' {
    return direction === 'ASC' || direction === 'DESC' 
  }

function constructSortingSpec(specString: string): AttributeSortingSpec {
    var [ attributeName, direction ] = specString.split(/\s+/);
    if (!isValidDirection(direction)) throw new Error('Expecting either ASC or DESC in sort directive: ' + specString);
    return { attributeName, direction };
}

export type SummaryTableConfigUserPref = {
    columns: string[];
    sorting: AttributeSortingSpec[];
}

export enum Scope {
  global = 'global',
  project = 'project',
}

export const SORT_ASC = "ASC";
export const SORT_DESC = "DESC";


type PrefSpec = [keyof UserPreferences, string];

const getPrefWith = async (wdkService: WdkService, [ scope, key ]: PrefSpec) => 
  (await wdkService.getCurrentUserPreferences())[scope][key];

const setPrefWith = async (wdkService: WdkService, [ scope, key ]: PrefSpec, value: string | null) =>
  await wdkService.patchUserPreference(scope, key, value);

export const prefSpecs = {
  sort: (questionName: string): PrefSpec => [ Scope.project, questionName + '_sort' ],
  summary: (questionName: string): PrefSpec => [ Scope.project, questionName + '_summary' ],
  itemsPerPage: (): PrefSpec => [ Scope.global, 'preference_global_items_per_page' ],
  matchedTranscriptsExpanded: (): PrefSpec => [ Scope.global, 'matchted_transcripts_filter_expanded' ],
  globalViewFilters: (recordClassName: string): PrefSpec => [Scope.project, recordClassName + '_globalViewFilters'],
  resultPanelTab: (questionName: string): PrefSpec => [Scope.project, questionName + '_resultPanelTab']
}

export async function getResultTableColumnsPref(questionName: string, wdkService: WdkService): Promise<string[]> {
    const columnsPref = await getPrefWith(wdkService, prefSpecs.summary(questionName));
    if (columnsPref) return columnsPref.split(/,\s*/);

    const questions = await wdkService.getQuestions();
    const question = questions.find(question => question.name === questionName);
    if (question == null) throw new Error(`Unknown question "${questionName}".`);
    return question.defaultAttributes;
}

export async function setResultTableColumnsPref(questionName: string, wdkService: WdkService, columns : Array<string>) : Promise<UserPreferences> {
    return setPrefWith(wdkService, prefSpecs.summary(questionName), columns.join(','));
}

export async function getResultTableSortingPref(questionName: string, wdkService: WdkService): Promise<AttributeSortingSpec[]> {
    const sortingPref = await getPrefWith(wdkService, prefSpecs.sort(questionName));
    if (sortingPref) return sortingPref.split(/,\s*/).map(constructSortingSpec);

    const questions = await wdkService.getQuestions();
    const question = questions.find(question => question.name === questionName);
    if (question == null) throw new Error(`Unknown question "${questionName}".`);
    return question.defaultSorting;
}

export async function setResultTableSortingPref(questionName: string, wdkService: WdkService, sorting : Array<AttributeSortingSpec>) : Promise<UserPreferences> {
    return setPrefWith(wdkService, prefSpecs.sort(questionName), sorting.map(spec => spec.attributeName + ' ' + spec.direction).join(','));
}

export async function getResultTablePageSizePref(wdkService: WdkService): Promise<number> {
  const sizeString = await getPrefWith(wdkService, prefSpecs.itemsPerPage());
  return isInteger(sizeString) ? parseInt(10, sizeString) : 20;
}

export async function setResultTablePageSizePref(wdkService: WdkService, pageSize : number) : Promise<UserPreferences> {
    return setPrefWith(wdkService, prefSpecs.itemsPerPage(), pageSize.toString());
}

export type MatchedTranscriptFilterPref = {
    expanded: boolean;
}

// TODO: maybe this should be in cookie instead.  we need a utility to manage that.
export async function getMatchedTranscriptFilterPref(wdkService: WdkService) : Promise<MatchedTranscriptFilterPref> {
    const pref = await getPrefWith(wdkService, prefSpecs.matchedTranscriptsExpanded());
    return { expanded: pref ? pref === 'yes' : false };
}

export async function setMatchedTranscriptFilterPref(expanded: boolean, wdkService: WdkService) : Promise<UserPreferences> {
    return setPrefWith(wdkService, prefSpecs.matchedTranscriptsExpanded(), expanded ? 'yes' : 'no');
}


// Global view filters
// -------------------

// FIXME Need to figure out a way to validate view filter values

const viewFiltersDecoder: Decoder<ViewFilters> = optional(arrayOf(combine(
  field('name', string),
  field('value', ok)
)));

export async function getGlobalViewFilters(wdkService: WdkService, recordClassName: string): Promise<ViewFilters> {
  const prefValue = await getPrefWith(wdkService, prefSpecs.globalViewFilters(recordClassName));
  if (prefValue == null || prefValue == '') return undefined;
  return decode(viewFiltersDecoder, await getPrefWith(wdkService, prefSpecs.globalViewFilters(recordClassName)));
}

export async function setGlobalViewFilters(wdkService: WdkService, recordClassName: string, viewFilters?: ViewFilters): Promise<UserPreferences> {
  const prefValue = viewFilters ? JSON.stringify(viewFilters) : null;
  return setPrefWith(wdkService, prefSpecs.globalViewFilters(recordClassName), prefValue);
}
