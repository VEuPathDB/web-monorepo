/**
 * This will remove html tags from string in a format of <tags>
 * <b>, </b>, <i>, </i>, <br>, <br />
 */

export function removeHtmlTags(str: string) {
  if (str === null || str === '') return str;
  else {
    // removing tags for a format of <tags>
    // return str.replace( /(<([^>]+)>)/gi, '');
    // removing specific tags
    const regexp = new RegExp('(?:</?b>|</?i>|<br\\s*/?>)', 'gi');
    return str.replace(regexp, '');
  }
}
