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

// TODO: if no user preference, get the default from the question!
export async function getSummaryTableConfigUserPref(questionName: string, wdkService: WdkService) : Promise<SummaryTableConfigUserPref> {
    var userPrefs = await wdkService.getCurrentUserPreferences();
    var prefName = questionName + SORT_SUFFIX;
    var sortingSpecStrings : string[] = [];
    if (userPrefs.global[prefName])
        sortingSpecStrings = userPrefs.global[prefName].split(/,\s+/);
    var sorting = sortingSpecStrings.map(value => constructSortingSpec(value));
    var prefName = questionName + SUMMARY_SUFFIX;
    var columns : string[] = [];
     if (userPrefs.global[prefName])
      columns = userPrefs.global[prefName].split(/,\s+/);
    return {sorting,  columns};
}

export async function setResultTableColumnsPref(questionName: string, wdkService: WdkService, columns : Array<string>) : Promise<UserPreferences> {
    return wdkService.patchUserPreference('global', questionName + SUMMARY_SUFFIX, columns.join(','));
}

export async function setResultTableSortingPref(questionName: string, wdkService: WdkService, sorting : Array<AttributeSortingSpec>) : Promise<UserPreferences> {
    let sortingSpecString = sorting.map(spec => spec.attributeName + " " + spec.direction).join(",");

    return wdkService.patchUserPreference('global', questionName + SORT_SUFFIX, sortingSpecString);
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
