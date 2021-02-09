import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { pruneNodesWithSingleExtendingChild } from 'ebrc-client/util/organisms';

// TODO Make these configurable via model.prop, and when not defined, always return an empty tree.
// This way non-genomic sites can call this without effect, while keeping the thrown error if
// the configuered search/param are not available.
const TAXON_QUESTION_NAME = 'SequencesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';


export function useOrganismTree(offerOrganismFilter: boolean) {
  const tree = useWdkService(async wdkService => {
    if (!offerOrganismFilter) {
      return undefined;
    }

    const taxonQuestion = await wdkService.getQuestionAndParameters(TAXON_QUESTION_NAME);
    const orgParam  = taxonQuestion.parameters.find(p => p.name == ORGANISM_PARAM_NAME);

    if (orgParam?.type == 'multi-pick-vocabulary' && orgParam?.displayType == 'treeBox') {
      return pruneNodesWithSingleExtendingChild(orgParam.vocabulary);
    }

    throw new Error(TAXON_QUESTION_NAME + " does not contain treebox enum param " + ORGANISM_PARAM_NAME);
  }, [ offerOrganismFilter ]);

  return tree;
}
