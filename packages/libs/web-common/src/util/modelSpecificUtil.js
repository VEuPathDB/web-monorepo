import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { nodeHasChildren } from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';
import { getNodeId } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';

let booleanQuestionPrefixes = [
  'InternalQuestions.boolean_question',
  'SpanQuestions.',
];

let badBooleanAttributes = ['transcripts_found_per_gene'];

export function trimBooleanQuestionAttribs(question, categoryTree) {
  // determine if this type of question needs its attributes trimmed
  let needsTrimming = false;
  booleanQuestionPrefixes.forEach((prefix) => {
    if (question.fullName.startsWith(prefix)) needsTrimming = true;
  });

  if (!needsTrimming) {
    return categoryTree;
  }

  // function tells whether a leaf should be trimmed off (if so, returns true)
  let trimLeafPredicate = (node) =>
    badBooleanAttributes.indexOf(getNodeId(node)) !== -1;

  return pruneDescendantNodes(
    (node) => nodeHasChildren(node) || !trimLeafPredicate(node),
    categoryTree
  );
}
