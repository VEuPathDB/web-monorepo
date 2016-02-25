
export let StepDownloadFormViewStore2 = {

  getInitialState(origGetInitialState) {
    return () => {
      let parentState = origGetInitialState();
      // supplement with additional state
      parentState.numCalls = 0;
      return parentState;
    }
  },

  reduce(origReduce) {
    return (state, action) => {
      let newNumCalls = state.numCalls + 1;
      let newState = origReduce(state, action);
      newState.numCalls = newNumCalls;
      return newState;
    }
  }
}

export let RecordViewStore = {

  reduce(origReduce) {
    return function(state, action) {
      let nextState = origReduce(state, action);

      switch (action.type) {
        case 'record/set-active-record': {
          // Hide Protein properties and Proteomics categories for non- protein coding genes
          let { record, recordClass, categoryTree } = nextState;
          if (recordClass.name === 'GeneRecordClasses.GeneRecordClass' && record.attributes.gene_type !== 'protein coding') {
            categoryTree.children = categoryTree.children.filter(function(category) {
              let label = category.properties.label[0];
              return label !== 'Protein properties' && label !== 'Proteomics';
            });
          }
          return nextState;
        }

        default:
          return nextState;
      }
    }
  }

}
