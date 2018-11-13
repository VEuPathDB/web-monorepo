import WdkService from 'wdk-client/Utils/WdkService';
import { AttributeSortingSpec, AttributesConfig } from "wdk-client/Utils/WdkModel"

function isValidDirection(direction: string): direction is 'ASC' | 'DESC' {
    return direction === 'ASC' || direction === 'DESC' 
  }

function constructSortingSpec(specString: string): AttributeSortingSpec {
    var [ attributeName, direction ] = specString.split(/\s+/);
    if (!isValidDirection(direction)) throw new Error('Expecting either ASC or DESC in sort directive: ' + specString);
    return { attributeName, direction };
}

export async function getQuestionAttributesTableConfig(questionName: string, wdkService: WdkService) : Promise<AttributesConfig> {
    var userPrefs = await wdkService.getCurrentUserPreferences();
    var prefName = questionName + "_sort";
    var sortingSpecStrings = userPrefs.global[prefName].split(/,\s+/);
    var sorting = sortingSpecStrings.map(value => constructSortingSpec(value));
    var prefName = questionName + "_summmary";
    var attributes = userPrefs.global[prefName].split(/,\s*/);
    return {sorting, attributes };
}