import {
    compose,
    cond,
    constant,
    identity,
    parseInt,
    isInteger,
    stubTrue,
    getOr,
    get
 } from 'lodash/fp';
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

export const SUMMARY_SUFFIX = "_summary";
export const SORT_SUFFIX = "_sort";
export const SORT_ASC = "ASC";
export const SORT_DESC = "DESC";

export async function getResultTableColumnsPref(questionName: string, wdkService: WdkService): Promise<string[]> {
    const prefs = await wdkService.getCurrentUserPreferences();
    const prefName =  questionName + SUMMARY_SUFFIX;
    const columnsPref = prefs.global[prefName];
    if (columnsPref) return columnsPref.split(/,\s*/);
    
    const questions = await wdkService.getQuestions();
    const question = questions.find(question => question.name === questionName);
    if (question == null) throw new Error(`Unknown question "${questionName}".`);
    return question.defaultAttributes;
}

export async function setResultTableColumnsPref(questionName: string, wdkService: WdkService, columns : Array<string>) : Promise<UserPreferences> {
    return wdkService.patchUserPreference('global', questionName + SUMMARY_SUFFIX, columns.join(','));
}

export async function getResultTableSortingPref(questionName: string, wdkService: WdkService): Promise<AttributeSortingSpec[]> {
    const prefs = await wdkService.getCurrentUserPreferences();
    const prefName = questionName + SORT_SUFFIX;
    const sortingPref = prefs.global[prefName];
    if (sortingPref) return sortingPref.split(/,\s*/).map(constructSortingSpec);

    const questions = await wdkService.getQuestions();
    const question = questions.find(question => question.name === questionName);
    if (question == null) throw new Error(`Unknown question "${questionName}".`);
    return question.defaultSorting;
}

export async function setResultTableSortingPref(questionName: string, wdkService: WdkService, sorting : Array<AttributeSortingSpec>) : Promise<UserPreferences> {
    let sortingSpecString = sorting.map(spec => spec.attributeName + " " + spec.direction).join(",");

    return wdkService.patchUserPreference('global', questionName + SORT_SUFFIX, sortingSpecString);
}

export async function setResultTablePageSizePref(wdkService: WdkService, pageSize : number) : Promise<UserPreferences> {

    return wdkService.patchUserPreference('global', 'preference_global_items_per_page', pageSize.toString());
}

export type MatchedTranscriptFilterPref = {
    expanded: boolean;
}

export const MATCHED_TRANSCRIPT_FILTER_EXPANDED = 'MATCHED_TRANSCRIPT_FILTER_EXPANDED';

// TODO: maybe this should be in cookie instead.  we need a utility to manage that.
export async function getMatchedTranscriptFilterPref(wdkService: WdkService) : Promise<MatchedTranscriptFilterPref> {
    var userPrefs = await wdkService.getCurrentUserPreferences();
    var expanded = false;
    if (userPrefs.global[MATCHED_TRANSCRIPT_FILTER_EXPANDED])
        expanded = userPrefs.global[MATCHED_TRANSCRIPT_FILTER_EXPANDED] === 'yes';
    return {expanded};
}

export async function setMatchedTranscriptFilterPref(expanded: boolean, wdkService: WdkService) : Promise<UserPreferences> {
    return wdkService.patchUserPreference('global', MATCHED_TRANSCRIPT_FILTER_EXPANDED, expanded? 'yes' : 'no');
}

const getGlobalPrefs = (prefs: UserPreferences) => prefs.global;

const getItemsPerPage = compose(
    globalPrefs => globalPrefs.preference_global_items_per_page,
    getGlobalPrefs
)

export const getPageSizeFromPreferences = compose(
    cond<number, number>([
        [isInteger, identity],
        [stubTrue, constant(20)]
    ]),
    parseInt(10),
    getItemsPerPage
)
