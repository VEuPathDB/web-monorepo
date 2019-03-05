import { parseInt, isInteger } from 'lodash/fp';
import WdkService from 'wdk-client/Utils/WdkService';
import {UserPreferences} from 'wdk-client/Utils/WdkUser';
import { AttributeSortingSpec } from "wdk-client/Utils/WdkModel"

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

export const SORT_ASC = "ASC";
export const SORT_DESC = "DESC";


type PrefSpec = [keyof UserPreferences, string];

const getPrefWith = async (wdkService: WdkService, [ scope, key ]: PrefSpec) => 
  (await wdkService.getCurrentUserPreferences())[scope][key];

const setPrefWith = async (wdkService: WdkService, [ scope, key ]: PrefSpec, value: string) =>
  await wdkService.patchUserPreference(scope, key, value);

export const prefSpecs = {
  sort: (questionName: string): PrefSpec => [ 'project', questionName + '_sort' ],
  summary: (questionName: string): PrefSpec => [ 'project', questionName + '_summary' ],
  itemsPerPage: (): PrefSpec => [ 'global', 'preference_global_items_per_page' ],
  matchedTranscriptsExpanded: (): PrefSpec => [ 'global', 'matchted_transcripts_filter_expanded' ],
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
