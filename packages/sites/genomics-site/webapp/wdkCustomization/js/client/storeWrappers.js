
export let StepDownloadFormViewStore = {

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