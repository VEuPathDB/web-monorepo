import { pruneDescendantNodes } from 'wdk-client/TreeUtils';
import { getTree, nodeHasChildren } from 'wdk-client/OntologyUtils';
import { getNodeId } from 'wdk-client/CategoryUtils';

let booleanQuestionPrefixes = [
  'InternalQuestions.boolean_question',
  'SpanQuestions.'
];

let badBooleanAttributes = [
  'transcripts_found_per_gene'
];

export function trimBooleanQuestionAttribs(question, categoryTree) {

  // determine if this type of question needs its attributes trimmed
  let needsTrimming = false;
  booleanQuestionPrefixes.forEach(prefix => {
    if (question.name.startsWith(prefix)) needsTrimming = true;
  });

  if (!needsTrimming) {
    return categoryTree;
  }

  // function tells whether a leaf should be trimmed off (if so, returns true)
  let trimLeafPredicate = node => (badBooleanAttributes.indexOf(getNodeId(node)) !== -1) ;

  return pruneDescendantNodes(node => nodeHasChildren(node) || !trimLeafPredicate(node), categoryTree);
}

let MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];
export function formatReleaseDate(releaseDateString) {
  let date = new Date(releaseDateString);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

