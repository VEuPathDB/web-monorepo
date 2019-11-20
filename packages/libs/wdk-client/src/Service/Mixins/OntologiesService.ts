import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import {keyBy} from 'lodash';
import { Ontology } from 'wdk-client/Utils/OntologyUtils';
import { CategoryTreeNode, pruneUnknownPaths, resolveWdkReferences, sortOntology } from 'wdk-client/Utils/CategoryUtils';

export default (base: ServiceBase) => {

  function getOntology(name: string) {
    let recordClasses$ = base.getRecordClasses().then(rs => keyBy(rs, 'fullName'));
    let questions$ = base.getQuestions().then(qs => keyBy(qs, 'fullName'));
    let ontology$ = base._getFromCache('ontologies/' + name, () => {
      let rawOntology$ = base._fetchJson<Ontology<CategoryTreeNode>>('get', `/ontologies/${name}`);
      return Promise.all([recordClasses$, questions$, rawOntology$])
        .then(([recordClasses, questions, rawOntology]) => {
          return sortOntology(recordClasses, questions,
            pruneUnknownPaths(recordClasses, questions, rawOntology));
        })
    });
    return Promise.all([recordClasses$, questions$, ontology$])
      .then(([recordClasses, questions, ontology]) => {
        return resolveWdkReferences(recordClasses, questions, ontology);
      });
  }

  return { getOntology };
}
