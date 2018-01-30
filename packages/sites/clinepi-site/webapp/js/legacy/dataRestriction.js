wdk.namespace('wdk.dataRestriction', (ns, $) => {

  function getIdFromRecordClass (recordClass) {
    if (typeof recordClass !== 'string') return null;
    if (recordClass.length > 13) recordClass = recordClass.slice(0, 13);
    const result = recordClass.match(/^DS_[^_]+/g);
    return result === null
      ? null
      : result[0];
  };

  function emit (action, details) {
    const detail = Object.assign({}, details, { action });
    const event = new CustomEvent('DataRestricted', { detail });
    document.dispatchEvent(event);
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  ns.restrictionController = (element) => {
    const { recordClass, restrictionType } = element.data();
    const studyId = getIdFromRecordClass(recordClass);

    const isResultsPage = element.children('.Results_Div').length !== 0;
    if (isResultsPage) {
      emit('results', { studyId });
      return;
    }

    const isSearchPage = restrictionType && restrictionType === 'search';
    if (isSearchPage) {
      setTimeout(() => emit('search', { studyId }), 0);
      return;
    }

    const analysisTiles = element.find('.analysis-selector');
    analysisTiles.each((index, tile) => ns.analysisTileController($(tile), studyId));

    const pagingTables = element.find('.paging-table');
    pagingTables.each((index, table) => ns.pagingController($(table), studyId));

    const downloadButton = element.find('a.step-download-link');
    ns.downloadLinkController(downloadButton, studyId);
  };

  ns.analysisTileController = (element, studyId) => {
    const handler = (event) => emit('analysis', { studyId, event });
    element.on('click', handler);
  };

  ns.pagingController = (element, studyId) => {
    const handler = (event) => emit('paginate', { studyId, event });
    element.on('click', 'a', handler);
    element.find('input.paging-button')
      .attr('onclick', null)
      .on('click', handler)
      .on('click', function () { wdk.resultsPage.openAdvancedPaging(this); });
  };

  ns.downloadLinkController = (element, studyId) => {
    element.on('click', (event) => {
      emit('download', { studyId, event });
    });
  };

});
