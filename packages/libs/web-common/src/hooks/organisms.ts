import { useState } from 'react';
import { useWdkEffect } from "@veupathdb/wdk-client/lib/Service/WdkService";
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// TODO Make these configurable via model.prop, and when not defined, always return an empty tree.
// This way non-genomic sites can call this without effect, while keeping the thrown error if
// the configuered search/param are not available.
const TAXON_QUESTION_NAME = 'SequencesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';


export function useOrganismTree() {
  const [ tree, setTree ] = useState<TreeBoxVocabNode>();
  useWdkEffect(wdkService => {
    wdkService.getQuestionAndParameters(TAXON_QUESTION_NAME)
      .then(question => {
        let orgParam  = question.parameters.find(p => p.name == ORGANISM_PARAM_NAME);
        if (orgParam && orgParam.type == 'multi-pick-vocabulary' && orgParam.displayType == "treeBox") {
          setTree(orgParam.vocabulary);
        }
        else {
          throw new Error(TAXON_QUESTION_NAME + " does not contain treebox enum param " + ORGANISM_PARAM_NAME);
        }
      });
  });
  return tree;
}
